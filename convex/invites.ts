import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Password hashing happens in the Next.js Server Action (Node runtime),
// this mutation only ever receives an already-hashed value.
export const createInviteWithHash = mutation({
  args: {
    serverId: v.id("servers"),
    username: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const server = await ctx.db.get(args.serverId);
    if (!server || server.ownerId !== identity.subject) {
      throw new Error("Server not found or you do not have access.");
    }
    if (server.status !== "active") {
      throw new Error("Cannot invite to a server that is not active.");
    }

    const existing = await ctx.db
      .query("userCredentials")
      .withIndex("by_server_username", (q) =>
        q.eq("serverId", args.serverId).eq("username", args.username),
      )
      .unique();
    if (existing) {
      throw new Error("That username is already in use on this server.");
    }

    const inviteToken = crypto.randomUUID();

    const credentialId = await ctx.db.insert("userCredentials", {
      serverId: args.serverId,
      username: args.username,
      passwordHash: args.passwordHash,
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

// Returns only what the claim flow needs to verify credentials.
// Never expose this query result directly to a client component —
// it's meant to be called from the Server Action, server-side only.
export const getByToken = query({
  args: { inviteToken: v.string() },
  handler: async (ctx, args) => {
    const credential = await ctx.db
      .query("userCredentials")
      .withIndex("by_token", (q) => q.eq("inviteToken", args.inviteToken))
      .unique();

    if (!credential || credential.state === "burned") {
      return null;
    }

    return {
      credentialId: credential._id,
      serverId: credential.serverId,
      username: credential.username,
      passwordHash: credential.passwordHash,
    };
  },
});

// Password compare already happened in the Server Action before this is
// called. The read + write here are in the same transaction, so a
// concurrent double-claim on the same token will have its second call
// see state: "burned" already and fail — no separate locking needed.
export const claimInvite = mutation({
  args: { inviteToken: v.string() },
  handler: async (ctx, args) => {
    const credential = await ctx.db
      .query("userCredentials")
      .withIndex("by_token", (q) => q.eq("inviteToken", args.inviteToken))
      .unique();

    if (!credential || credential.state === "burned") {
      throw new Error("Invalid or already-used invite.");
    }

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

export const listCredentialsForServer = query({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const server = await ctx.db.get(args.serverId);
    if (!server || server.ownerId !== identity.subject) {
      throw new Error("You do not have access to this server.");
    }

    const credentials = await ctx.db
      .query("userCredentials")
      .withIndex("by_server", (q) => q.eq("serverId", args.serverId))
      .collect();

    // passwordHash never leaves this function — admin only needs state/username.
    return credentials.map((c) => ({
      _id: c._id,
      username: c.username,
      state: c.state,
      claimedAt: c.claimedAt,
    }));
  },
});

export const revokeCredential = mutation({
  args: { credentialId: v.id("userCredentials") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const credential = await ctx.db.get(args.credentialId);
    if (!credential) throw new Error("Credential not found.");

    const server = await ctx.db.get(credential.serverId);
    if (!server || server.ownerId !== identity.subject) {
      throw new Error("You do not have access to this server.");
    }

    if (credential.sessionId) {
      await ctx.db.patch(credential.sessionId, { revoked: true });
    }

    await ctx.db.insert("serverLogs", {
      serverId: credential.serverId,
      type: "member_removed",
      createdAt: Date.now(),
    });
  },
});
