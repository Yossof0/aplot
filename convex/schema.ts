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
    bookedAt: v.number(),
    expiresAt: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("archived"),
    ),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status_expiresAt", ["status", "expiresAt"]),

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
    detail: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_server", ["serverId"]),

  userCredentials: defineTable({
    serverId: v.id("servers"),
    username: v.string(),
    passwordHash: v.string(),
    inviteToken: v.string(),
    state: v.union(v.literal("pending"), v.literal("burned")),
    claimedAt: v.optional(v.number()),
    sessionId: v.optional(v.id("sessions")),
  })
    .index("by_server", ["serverId"])
    .index("by_token", ["inviteToken"])
    .index("by_server_username", ["serverId", "username"]),

  sessions: defineTable({
    serverId: v.id("servers"),
    credentialId: v.id("userCredentials"),
    sessionToken: v.string(),
    createdAt: v.number(),
    revoked: v.boolean(),
  })
    .index("by_server", ["serverId"])
    .index("by_token", ["sessionToken"]),

  chatMessages: defineTable({
    serverId: v.id("servers"),
    senderRole: v.union(v.literal("admin"), v.literal("member")),
    senderCredentialId: v.optional(v.id("userCredentials")),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_server_createdAt", ["serverId", "createdAt"]),
});
