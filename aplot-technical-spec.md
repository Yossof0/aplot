# aPlot — Technical Spec (Convex + Clerk + Next.js)

Stack: Next.js App Router, Convex (DB + realtime + cron), Clerk (admin auth only — claimed users get their own session, not Clerk), Tailwind + shadcn.

Convex is doing double duty here: it's the DB, the realtime layer (queries are reactive — no Supabase Realtime needed), and the cron runner. Server Actions in Next.js are thin wrappers that call Convex mutations/actions; they exist for the parts that need Node (bcrypt) or that you want off the public Convex function surface.

---

## 1. Database Schema

**File: `convex/schema.ts`**

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  servers: defineTable({
    ownerId: v.string(), // Clerk user id of the business admin
    name: v.string(),
    durationTier: v.union(
      v.literal("3d"),
      v.literal("7d"),
      v.literal("2w"),
      v.literal("3w"),
      v.literal("1m"),
    ),
    storageTierMb: v.union(
      v.literal(25),
      v.literal(50),
      v.literal(100),
      v.literal(250),
    ),
    storageUsedBytes: v.number(),
    bookedAt: v.number(), // ms epoch
    expiresAt: v.number(), // ms epoch, derived from bookedAt + durationTier
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("archived"),
    ),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status_expiresAt", ["status", "expiresAt"]), // cron scan target

  serverLogs: defineTable({
    serverId: v.id("servers"),
    type: v.union(
      v.literal("invite_created"),
      v.literal("invite_claimed"),
      v.literal("member_removed"),
      v.literal("message_sent"),
      v.literal("server_expired"),
      v.literal("server_archived"),
    ),
    detail: v.optional(v.string()), // never store PII here — event metadata only
    createdAt: v.number(),
  }).index("by_server", ["serverId"]),

  userCredentials: defineTable({
    serverId: v.id("servers"),
    username: v.string(),
    passwordHash: v.string(), // bcrypt, set via Node action
    inviteToken: v.string(), // opaque, high-entropy, embedded in the invite link
    state: v.union(v.literal("pending"), v.literal("burned")),
    claimedAt: v.optional(v.number()),
    sessionId: v.optional(v.id("sessions")), // set once burned
  })
    .index("by_server", ["serverId"])
    .index("by_token", ["inviteToken"]) // lookup on claim
    .index("by_server_username", ["serverId", "username"]), // admin dedupe check

  sessions: defineTable({
    serverId: v.id("servers"),
    credentialId: v.id("userCredentials"),
    sessionToken: v.string(), // stored hashed; raw value lives only in the cookie
    createdAt: v.number(),
    revoked: v.boolean(),
  })
    .index("by_server", ["serverId"])
    .index("by_token", ["sessionToken"]),

  chatMessages: defineTable({
    serverId: v.id("servers"),
    senderRole: v.union(v.literal("admin"), v.literal("member")),
    // Deliberately no senderCredentialId exposed to client queries for members —
    // Max Privacy means members never resolve who sent what beyond "admin" or "member".
    senderCredentialId: v.optional(v.id("userCredentials")),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_server_createdAt", ["serverId", "createdAt"]),
});
```

**Privacy enforcement note:** Convex has no RLS. Enforcement happens in the query/mutation function bodies — every function that reads `chatMessages` or `userCredentials` must check the caller's session against `serverId` server-side, and member-facing queries must strip `senderCredentialId` before returning results. This is arguably easier to audit than Postgres RLS since it's plain TypeScript in one place per function, not a separate policy layer — but it means every new query needs the same check written by hand. Worth a shared helper (see §3).

---

## 2. Expiration / Cron Logic

**File: `convex/crons.ts`**

```ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "sweep expired servers",
  { minutes: 15 },
  internal.servers.sweepExpired,
);

export default crons;
```

**File: `convex/servers.ts`** (relevant excerpt)

```ts
import { internalMutation } from "./_generated/server";

export const sweepExpired = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const candidates = await ctx.db
      .query("servers")
      .withIndex("by_status_expiresAt", (q) =>
        q.eq("status", "active").lt("expiresAt", now),
      )
      .collect();

    for (const server of candidates) {
      await ctx.db.patch(server._id, { status: "expired" });

      await ctx.db.insert("serverLogs", {
        serverId: server._id,
        type: "server_expired",
        createdAt: now,
      });

      // Revoke all active sessions immediately
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_server", (q) => q.eq("serverId", server._id))
        .filter((q) => q.eq(q.field("revoked"), false))
        .collect();
      for (const s of sessions) {
        await ctx.db.patch(s._id, { revoked: true });
      }

      // Teardown policy depends on storage tier — smaller tiers purge sooner.
      // Simplest correct approach: archive now, hard-delete on a second sweep
      // after a grace window (e.g. 24h) so an admin can export data first.
    }
  },
});
```

A second scheduled function (`archiveExpired`, also on a 15–60 min interval) can hard-delete `chatMessages` for servers that have sat in `expired` status past a grace period, then flip status to `archived`. Splitting expire vs. archive into two sweeps avoids irreversible deletion in the same transaction that revokes access — gives you a rollback window if a cron bug fires early.

---

## 3. Auth / Burn-on-Claim Flow

The tricky part is the race condition: two requests hitting the same invite token simultaneously must not both succeed. Convex mutations are transactional and serialized per-document, so this is actually simpler here than in a manually-locked Postgres flow — the `patch` on `userCredentials.state` inside the same mutation as the read acts as the lock.

**File: `convex/invites.ts`**

```ts
import { mutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Step 1: Admin creates an invite (username/password set by admin per spec)
export const createInvite = mutation({
  args: {
    serverId: v.id("servers"),
    username: v.string(),
    password: v.string(), // plaintext in transit over HTTPS, never stored
  },
  handler: async (ctx, args) => {
    // auth check: caller must be the server's ownerId (via Clerk identity) — omitted here for brevity
    const inviteToken = crypto.randomUUID();

    // Hashing needs Node — hand off to an action
    const passwordHash: string = await ctx.scheduler.runAfter(
      0,
      internal.invites.hashPassword,
      { password: args.password },
    );

    const credentialId = await ctx.db.insert("userCredentials", {
      serverId: args.serverId,
      username: args.username,
      passwordHash, // NOTE: see caveat below
      inviteToken,
      state: "pending",
    });

    await ctx.db.insert("serverLogs", {
      serverId: args.serverId,
      type: "invite_created",
      createdAt: Date.now(),
    });

    return { credentialId, inviteToken };
  },
});
```

**Caveat worth flagging:** `ctx.scheduler.runAfter(0, ...)` doesn't return a value synchronously to the calling mutation — scheduled functions are fire-and-forget. The pattern above is simplified for readability; the real implementation needs one of:
- Call the Node action *before* the mutation (from a Server Action in Next.js), passing the resulting hash into `createInvite` as an argument, or
- Split into two mutations: create a `pending-hash` placeholder row, then a follow-up internal mutation once the action resolves.

I'd go with the first option — cleaner, and keeps password material out of Convex's mutation retry logic entirely (mutations can retry on OCC conflicts; you don't want to re-hash or double-log on retry).

**File: `app/actions/inviteActions.ts`** (Server Action — the actual entry point)

```ts
"use server";

import bcrypt from "bcryptjs";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function createInviteAction(
  serverId: string,
  username: string,
  password: string,
) {
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await fetchMutation(api.invites.createInviteWithHash, {
      serverId,
      username,
      passwordHash,
    });
    return { success: true, ...result };
  } catch (err) {
    console.error("createInviteAction failed", err);
    return { success: false, error: "Could not create invite." };
  }
}
```

`createInviteWithHash` is the same mutation as above, just taking `passwordHash` directly instead of `password` — no Node dependency inside Convex needed at all this way.

**Step 2: Claim (burn) — the transactional part**

```ts
export const claimInvite = mutation({
  args: { inviteToken: v.string(), username: v.string(), passwordHash: v.string() },
  handler: async (ctx, args) => {
    const credential = await ctx.db
      .query("userCredentials")
      .withIndex("by_token", (q) => q.eq("inviteToken", args.inviteToken))
      .unique();

    if (!credential || credential.state === "burned") {
      // Same error for "not found" and "already burned" — don't leak which
      throw new Error("Invalid or already-used invite.");
    }

    // Verify credentials match (hash comparison happens in the Server Action
    // before calling this, since bcrypt.compare also needs Node — see below)

    await ctx.db.patch(credential._id, {
      state: "burned",
      claimedAt: Date.now(),
    });

    const sessionToken = crypto.randomUUID();
    const sessionId = await ctx.db.insert("sessions", {
      serverId: credential.serverId,
      credentialId: credential._id,
      sessionToken,
      createdAt: Date.now(),
      revoked: false,
    });

    await ctx.db.patch(credential._id, { sessionId });

    await ctx.db.insert("serverLogs", {
      serverId: credential.serverId,
      type: "invite_claimed",
      createdAt: Date.now(),
    });

    return { sessionToken };
  },
});
```

Because the read (`by_token` lookup) and the write (`patch` to `burned`) happen inside the same Convex mutation, Convex's optimistic concurrency control guarantees that if two claim attempts race, the second one re-reads `state: "burned"` and throws — no separate row-locking needed. This is the one place where Convex's transaction model is a genuine advantage over a naive Postgres implementation (which needs an explicit `SELECT ... FOR UPDATE` to get the same guarantee).

The actual bcrypt compare has to happen where Node is available — either in the Server Action (fetch the hash via a query first, compare, then call `claimInvite` only on success) or in a Convex `"use node"` action. Given you already need Node for hashing, keeping compare in the Server Action is one less moving piece:

```ts
"use server";

export async function claimInviteAction(
  inviteToken: string,
  username: string,
  password: string,
) {
  const credential = await fetchQuery(api.invites.getByToken, { inviteToken });
  if (!credential || credential.username !== username) {
    return { success: false, error: "Invalid or already-used invite." };
  }
  const valid = await bcrypt.compare(password, credential.passwordHash);
  if (!valid) return { success: false, error: "Invalid or already-used invite." };

  const { sessionToken } = await fetchMutation(api.invites.claimInvite, {
    inviteToken,
    username,
  });

  // set httpOnly cookie here with sessionToken, then redirect
  return { success: true };
}
```

---

## 4. Function Surface (Convex queries/mutations/actions)

Organized by domain — each of these is its own file under `convex/` per your file-size rule (150–200 lines/file):

**`convex/servers.ts`**
- `bookServer` (mutation) — creates a server row, sets `bookedAt`/`expiresAt` from `durationTier`
- `getServerDashboard` (query) — storage used, time remaining, status — owner-only
- `sweepExpired` (internal mutation) — cron target, §2
- `archiveExpired` (internal mutation) — second sweep, hard-delete after grace window

**`convex/invites.ts`**
- `createInviteWithHash` (mutation) — §3
- `getByToken` (query) — used by claim flow, returns only what's needed to verify (never the raw hash to a member-facing client, only within the Server Action's server-side fetch)
- `claimInvite` (mutation) — §3
- `revokeCredential` (mutation) — admin removes a member mid-lease; revokes their `sessions` row too

**`convex/messages.ts`**
- `sendMessage` (mutation) — admin or session-holder posts; validates session against `serverId` and `revoked: false` first
- `listMessages` (query, reactive) — member-facing version strips `senderCredentialId`; admin-facing version can include it for moderation
- Shared helper: `requireActiveSession(ctx, sessionToken, serverId)` — every message/credential function calls this first; centralizes the Max Privacy check instead of re-writing it per function (per §1's note)

**`convex/logs.ts`**
- `listServerLogs` (query) — owner-only, paginated

**Next.js Server Actions (`app/actions/`)**
- `inviteActions.ts` — `createInviteAction`, `claimInviteAction` (§3)
- `bookingActions.ts` — `bookServerAction` (payment/checkout hook, if you're charging per booking)
- `dashboardActions.ts` — thin wrappers only where you need to keep something off the public Convex API surface (Convex functions are callable directly from the client too, so most reads can skip this layer entirely and use `useQuery` directly in client components)

---

## Open questions for next pass
1. **Storage cap enforcement** — is `storageUsedBytes` just message text length, or does aPlot support file/image attachments? Changes whether you need Convex file storage + a separate quota check on upload.
2. **Payment** — is booking a paid action (Stripe) gating `bookServer`, or is this internal/free for now?
3. **Admin's own identity** — Clerk gives you the admin's real account, but do *other admins on the same team* need visibility into each other's servers, or is it strictly one-owner-per-server?
