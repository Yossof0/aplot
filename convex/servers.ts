import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import {
  computeExpiresAt,
  msRemaining,
  validateBookingConfig,
  type PlanTier,
  type DurationTier,
  type StorageTierMb,
} from "./lib/plans";

const ARCHIVE_GRACE_MS = 24 * 60 * 60 * 1000;

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

export const bookServer = mutation({
  args: {
    name: v.string(),
    planTier: v.union(v.literal("basic"), v.literal("pro")),
    durationTier: durationTierValidator,
    storageTierMb: storageTierValidator,
    chatCapacity: v.number(),
    // TODO: accept a payment intent / checkout session id once billing exists.
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

export const getServerDashboard = query({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const server = await ctx.db.get(args.serverId);
    if (!server || server.ownerId !== identity.subject) {
      throw new Error("Server not found or you do not have access.");
    }

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
      msRemaining: msRemaining(server.expiresAt),
      expiresAt: server.expiresAt,
      chatCapacity: server.chatCapacity,
      chatsUsed: chats.length,
      chats: chats.map((c) => ({ _id: c._id, name: c.name, createdAt: c.createdAt })),
    };
  },
});

export const sweepExpired = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const candidates = await ctx.db
      .query("servers")
      .withIndex("by_status_expiresAt", (q) => q.eq("status", "active").lt("expiresAt", now))
      .collect();

    for (const server of candidates) {
      await ctx.db.patch(server._id, { status: "expired" });
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
    const cutoff = Date.now() - ARCHIVE_GRACE_MS;
    const candidates = await ctx.db
      .query("servers")
      .withIndex("by_status_expiresAt", (q) => q.eq("status", "expired").lt("expiresAt", cutoff))
      .collect();

    for (const server of candidates) {
      const chats = await ctx.db
        .query("chats")
        .withIndex("by_server", (q) => q.eq("serverId", server._id))
        .collect();

      for (const chat of chats) {
        const messages = await ctx.db
          .query("chatMessages")
          .withIndex("by_chat_createdAt", (q) => q.eq("chatId", chat._id))
          .collect();
        for (const message of messages) {
          await ctx.db.delete(message._id);
        }
      }

      await ctx.db.patch(server._id, { status: "archived" });
      await ctx.db.insert("serverLogs", {
        serverId: server._id,
        type: "server_archived",
        createdAt: Date.now(),
      });
    }
  },
});
