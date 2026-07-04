import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { computeExpiresAt, msRemaining } from "./lib/durations";

const ARCHIVE_GRACE_MS = 24 * 60 * 60 * 1000; // 24h between expire and hard-delete

export const bookServer = mutation({
  args: {
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
    // TODO: accept a payment intent / checkout session id here once billing
    // is wired up. For now booking is unconditional.
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const bookedAt = Date.now();
    const expiresAt = computeExpiresAt(bookedAt, args.durationTier);

    const serverId = await ctx.db.insert("servers", {
      ownerId: identity.subject,
      name: args.name,
      durationTier: args.durationTier,
      storageTierMb: args.storageTierMb,
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

    return {
      name: server.name,
      status: server.status,
      storageUsedBytes: server.storageUsedBytes,
      storageCapBytes: server.storageTierMb * 1024 * 1024,
      msRemaining: msRemaining(server.expiresAt),
      expiresAt: server.expiresAt,
    };
  },
});

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

      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_server", (q) => q.eq("serverId", server._id))
        .filter((q) => q.eq(q.field("revoked"), false))
        .collect();

      for (const session of sessions) {
        await ctx.db.patch(session._id, { revoked: true });
      }
    }
  },
});

export const archiveExpired = internalMutation({
  handler: async (ctx) => {
    const cutoff = Date.now() - ARCHIVE_GRACE_MS;
    const candidates = await ctx.db
      .query("servers")
      .withIndex("by_status_expiresAt", (q) =>
        q.eq("status", "expired").lt("expiresAt", cutoff),
      )
      .collect();

    for (const server of candidates) {
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_server_createdAt", (q) => q.eq("serverId", server._id))
        .collect();

      for (const message of messages) {
        await ctx.db.delete(message._id);
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
