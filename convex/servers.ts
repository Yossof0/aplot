import { mutation, query, internalMutation, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import {
  computeExpiresAt,
  msRemaining,
  validateBookingConfig,
  PLAN_CONFIG,
  type PlanTier,
  type DurationTier,
  type StorageTierMb,
} from "./lib/plans";
import { graceMsForPlan } from "./lib/pricing";

const durationTierValidator = v.union(
  v.literal("3d"), v.literal("5d"), v.literal("7d"),
  v.literal("14d"), v.literal("21d"), v.literal("30d"),
  v.literal("1w"), v.literal("2w"), v.literal("3w"),
  v.literal("1m"), v.literal("2m"), v.literal("3m"),
  v.literal("4m"), v.literal("5m"), v.literal("6m"),
);

const storageTierValidator = v.union(
  v.literal(3), v.literal(5), v.literal(10), v.literal(15),
  v.literal(20), v.literal(25), v.literal(50), v.literal(75),
  v.literal(100), v.literal(125), v.literal(150), v.literal(175),
  v.literal(200), v.literal(225), v.literal(250),
);

async function requireOwnedServer(ctx: QueryCtx | MutationCtx, serverId: Id<"servers">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated.");
  const server = await ctx.db.get(serverId);
  if (!server || server.ownerId !== identity.subject) {
    throw new Error("Server not found or you do not have access.");
  }
  return { identity, server };
}

export const getSecurityOverview = query({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    await requireOwnedServer(ctx, args.serverId);

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_server", (q) => q.eq("serverId", args.serverId))
      .collect();

    let activeSessionCount = 0;
    for (const chat of chats) {
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
        .filter((q) => q.eq(q.field("revoked"), false))
        .collect();
      activeSessionCount += sessions.length;
    }

    return { activeSessionCount, chatCount: chats.length };
  },
});

export const revokeAllSessions = mutation({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    await requireOwnedServer(ctx, args.serverId);

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_server", (q) => q.eq("serverId", args.serverId))
      .collect();

    let revokedCount = 0;
    for (const chat of chats) {
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
        .filter((q) => q.eq(q.field("revoked"), false))
        .collect();
      for (const session of sessions) {
        await ctx.db.patch(session._id, { revoked: true });
        revokedCount++;
      }
    }

    return { revokedCount };
  },
});

export const bookServer = mutation({
  args: {
    name: v.string(),
    planTier: v.union(v.literal("basic"), v.literal("pro")),
    durationTier: durationTierValidator,
    storageTierMb: storageTierValidator,
    chatCapacity: v.number(),
    // Mocked payment for now — no real charge, just booking directly.
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const validationError = validateBookingConfig(
      args.planTier as PlanTier,
      args.durationTier as DurationTier,
      args.storageTierMb as StorageTierMb,
      args.chatCapacity,
    );
    if (validationError) throw new Error(validationError);

    const bookedAt = Date.now();
    const expiresAt = computeExpiresAt(bookedAt, args.durationTier as DurationTier);

    const serverId = await ctx.db.insert("servers", {
      ownerId: identity.subject,
      name: args.name,
      planTier: args.planTier,
      durationTier: args.durationTier,
      storageTierMb: args.storageTierMb,
      chatCapacity: args.chatCapacity,
      storageUsedBytes: 0,
      bookedAt,
      expiresAt,
      status: "active",
    });

    return { serverId, expiresAt };
  },
});

export const listServersForOwner = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");
    return await ctx.db
      .query("servers")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .collect();
  },
});

export const getServerDashboard = query({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    const { server } = await requireOwnedServer(ctx, args.serverId);

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_server", (q) => q.eq("serverId", args.serverId))
      .collect();

    return {
      name: server.name,
      status: server.status,
      planTier: server.planTier,
      storageUsedBytes: server.storageUsedBytes,
      storageCapBytes: server.storageTierMb * 1024 * 1024,
      storageTierMb: server.storageTierMb,
      msRemaining: msRemaining(server.expiresAt),
      expiresAt: server.expiresAt,
      graceExpiresAt: server.graceExpiresAt,
      graceMsRemaining: server.graceExpiresAt ? msRemaining(server.graceExpiresAt) : null,
      chatCapacity: server.chatCapacity,
      chatsUsed: chats.length,
      chats: chats.map((c) => ({ _id: c._id, name: c.name, createdAt: c.createdAt })),
    };
  },
});

export const updateServerName = mutation({
  args: { serverId: v.id("servers"), name: v.string() },
  handler: async (ctx, args) => {
    await requireOwnedServer(ctx, args.serverId);
    await ctx.db.patch(args.serverId, { name: args.name });
  },
});

export const deleteServer = mutation({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    await requireOwnedServer(ctx, args.serverId);
    await wipeServer(ctx, args.serverId);
  },
});

export const renewServer = mutation({
  args: { serverId: v.id("servers"), durationTier: durationTierValidator },
  handler: async (ctx, args) => {
    const { server } = await requireOwnedServer(ctx, args.serverId);

    if (!PLAN_CONFIG[server.planTier as PlanTier].durationTiers.includes(args.durationTier as DurationTier)) {
      throw new Error(`${args.durationTier} is not a valid duration for the ${server.planTier} plan.`);
    }
    if (server.status === "archived") {
      throw new Error("This server has already been wiped and cannot be renewed.");
    }

    // Renewing always extends from now, whether the server was still active
    // or sitting in its grace period.
    const expiresAt = computeExpiresAt(Date.now(), args.durationTier as DurationTier);

    await ctx.db.patch(args.serverId, {
      durationTier: args.durationTier,
      expiresAt,
      graceExpiresAt: undefined,
      status: "active",
    });

    await ctx.db.insert("serverLogs", {
      serverId: args.serverId,
      type: "server_renewed",
      createdAt: Date.now(),
    });

    return { expiresAt };
  },
});

export const upgradeServerCapacity = mutation({
  args: {
    serverId: v.id("servers"),
    storageTierMb: storageTierValidator,
    chatCapacity: v.number(),
    // Mocked payment for now — applied directly, no real charge.
  },
  handler: async (ctx, args) => {
    const { server } = await requireOwnedServer(ctx, args.serverId);

    if (server.status !== "active") {
      throw new Error("Cannot upgrade a server that isn't active.");
    }

    const config = PLAN_CONFIG[server.planTier as PlanTier];
    if (!config.storageTiersMb.includes(args.storageTierMb as StorageTierMb)) {
      throw new Error(`${args.storageTierMb}MB is not valid for the ${server.planTier} plan.`);
    }
    if (args.chatCapacity < 1 || args.chatCapacity > config.maxChats) {
      throw new Error(`Chat capacity must be between 1 and ${config.maxChats} for the ${server.planTier} plan.`);
    }
    if (args.storageTierMb < server.storageTierMb) {
      throw new Error("Storage cannot be downgraded.");
    }
    if (args.chatCapacity < server.chatCapacity) {
      throw new Error("Chat capacity cannot be downgraded.");
    }

    await ctx.db.patch(args.serverId, {
      storageTierMb: args.storageTierMb,
      chatCapacity: args.chatCapacity,
    });

    await ctx.db.insert("serverLogs", {
      serverId: args.serverId,
      type: "capacity_upgraded",
      createdAt: Date.now(),
    });
  },
});

async function wipeServer(ctx: MutationCtx, serverId: Id<"servers">) {
  const chats = await ctx.db
    .query("chats")
    .withIndex("by_server", (q) => q.eq("serverId", serverId))
    .collect();

  for (const chat of chats) {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_chat_createdAt", (q) => q.eq("chatId", chat._id))
      .collect();
    for (const message of messages) await ctx.db.delete(message._id);

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
      .collect();
    for (const session of sessions) await ctx.db.delete(session._id);

    const credentials = await ctx.db
      .query("userCredentials")
      .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
      .collect();
    for (const credential of credentials) await ctx.db.delete(credential._id);

    await ctx.db.delete(chat._id);
  }

  const logs = await ctx.db
    .query("serverLogs")
    .withIndex("by_server", (q) => q.eq("serverId", serverId))
    .collect();
  for (const log of logs) await ctx.db.delete(log._id);

  await ctx.db.delete(serverId);
}

export const sweepExpired = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const candidates = await ctx.db
      .query("servers")
      .withIndex("by_status_expiresAt", (q) => q.eq("status", "active").lt("expiresAt", now))
      .collect();

    for (const server of candidates) {
      const graceExpiresAt = now + graceMsForPlan(server.planTier as PlanTier);

      await ctx.db.patch(server._id, { status: "grace", graceExpiresAt });
      await ctx.db.insert("serverLogs", {
        serverId: server._id,
        type: "server_expired",
        createdAt: now,
      });

      const chats = await ctx.db
        .query("chats")
        .withIndex("by_server", (q) => q.eq("serverId", server._id))
        .collect();

      for (const chat of chats) {
        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_chat", (q) => q.eq("chatId", chat._id))
          .filter((q) => q.eq(q.field("revoked"), false))
          .collect();
        for (const session of sessions) {
          await ctx.db.patch(session._id, { revoked: true });
        }
      }
    }
  },
});

export const archiveExpired = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const candidates = await ctx.db
      .query("servers")
      .withIndex("by_status_graceExpiresAt", (q) => q.eq("status", "grace").lt("graceExpiresAt", now))
      .collect();

    for (const server of candidates) {
      await wipeServer(ctx, server._id);
    }
  },
});
