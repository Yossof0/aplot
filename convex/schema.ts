import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  servers: defineTable({
    ownerId: v.string(), // Clerk user id, verified via ctx.auth — never client-supplied
    name: v.string(),
    planTier: v.union(v.literal("basic"), v.literal("pro")),
    durationTier: v.union(
      v.literal("3d"), v.literal("5d"), v.literal("7d"),
      v.literal("14d"), v.literal("21d"), v.literal("30d"),
      v.literal("1w"), v.literal("2w"), v.literal("3w"),
      v.literal("1m"), v.literal("2m"), v.literal("3m"),
      v.literal("4m"), v.literal("5m"), v.literal("6m"),
    ),
    storageTierMb: v.union(
      v.literal(3), v.literal(5), v.literal(10), v.literal(15),
      v.literal(20), v.literal(25), v.literal(50), v.literal(75),
      v.literal(100), v.literal(125), v.literal(150), v.literal(175),
      v.literal(200), v.literal(225), v.literal(250),
    ),
    chatCapacity: v.number(), // can change via upgradeServerCapacity mid-lease
    storageUsedBytes: v.number(),
    bookedAt: v.number(),
    expiresAt: v.number(),
    graceExpiresAt: v.optional(v.number()), // set when status flips to "grace"
    status: v.union(v.literal("active"), v.literal("grace"), v.literal("archived")),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status_expiresAt", ["status", "expiresAt"])
    .index("by_status_graceExpiresAt", ["status", "graceExpiresAt"]),

  pricingConfig: defineTable({
    baseFeeCents: v.number(),
    perMbCents: v.number(),
    perChatSlotCents: v.number(),
    perDayCents: v.number(),
    basicDiscountPercent: v.number(),
    proDiscountPercent: v.number(),
    updatedAt: v.number(),
  }), // singleton — only ever one row

  bundlePlans: defineTable({
    planTier: v.union(v.literal("basic"), v.literal("pro")),
    label: v.string(),
    storageTierMb: v.number(),
    chatCapacity: v.number(),
    priceCents: v.number(),
    discountPercent: v.optional(v.number()),
    isActive: v.boolean(),
    order: v.number(),
  }).index("by_planTier_order", ["planTier", "order"]),

  chats: defineTable({
    serverId: v.id("servers"),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_server", ["serverId"]),

  serverLogs: defineTable({
    serverId: v.id("servers"),
    chatId: v.optional(v.id("chats")), // set for chat-scoped events
    type: v.union(
      v.literal("chat_created"),
      v.literal("chat_deleted"),
      v.literal("invite_created"),
      v.literal("invite_claimed"),
      v.literal("member_removed"),
      v.literal("message_sent"),
      v.literal("server_expired"),
      v.literal("server_renewed"),
      v.literal("capacity_upgraded"),
      v.literal("server_archived"),
    ),
    detail: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_server", ["serverId"]),

  userCredentials: defineTable({
    chatId: v.id("chats"), // invites are per-chat, not per-server
    username: v.string(),
    passwordHash: v.string(),
    inviteToken: v.string(),
    state: v.union(v.literal("pending"), v.literal("burned")),
    claimedAt: v.optional(v.number()),
    sessionId: v.optional(v.id("sessions")),
  })
    .index("by_chat", ["chatId"])
    .index("by_token", ["inviteToken"])
    .index("by_chat_username", ["chatId", "username"]),

  sessions: defineTable({
    chatId: v.id("chats"),
    credentialId: v.id("userCredentials"),
    sessionToken: v.string(),
    createdAt: v.number(),
    revoked: v.boolean(),
  })
    .index("by_chat", ["chatId"])
    .index("by_token", ["sessionToken"]),

  chatMessages: defineTable({
    chatId: v.id("chats"),
    senderRole: v.union(v.literal("admin"), v.literal("member")),
    senderCredentialId: v.optional(v.id("userCredentials")),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_chat_createdAt", ["chatId", "createdAt"]),
});
