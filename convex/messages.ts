import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireActiveSession, toMemberSafeMessage } from "./lib/session";

export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    body: v.string(),
    sessionToken: v.optional(v.string()), // member path only
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found.");

    let senderRole: "admin" | "member";
    let senderCredentialId;

    const identity = await ctx.auth.getUserIdentity();

    if (identity) {
      const server = await ctx.db.get(chat.serverId);
      if (!server || server.ownerId !== identity.subject) {
        throw new Error("You do not have access to this chat.");
      }
      senderRole = "admin";
    } else if (args.sessionToken) {
      const session = await requireActiveSession(ctx, args.sessionToken, args.chatId);
      senderRole = "member";
      senderCredentialId = session.credentialId;
    } else {
      throw new Error("Missing sender identity.");
    }

    const bodyBytes = new TextEncoder().encode(args.body).length;

    const server = await ctx.db.get(chat.serverId);
    if (!server) throw new Error("Server not found.");

    const capBytes = server.storageTierMb * 1024 * 1024;
    if (server.storageUsedBytes + bodyBytes > capBytes) {
      throw new Error("Server storage cap reached.");
    }

    await ctx.db.insert("chatMessages", {
      chatId: args.chatId,
      senderRole,
      senderCredentialId,
      body: args.body,
      createdAt: Date.now(),
    });

    await ctx.db.patch(chat.serverId, {
      storageUsedBytes: server.storageUsedBytes + bodyBytes,
    });

    await ctx.db.insert("serverLogs", {
      serverId: chat.serverId,
      chatId: args.chatId,
      type: "message_sent",
      createdAt: Date.now(),
    });
  },
});

export const listMessagesForMember = query({
  args: { chatId: v.id("chats"), sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, args.sessionToken, args.chatId);

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_chat_createdAt", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();

    return messages.map(toMemberSafeMessage);
  },
});

export const listMessagesForAdmin = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found.");

    const server = await ctx.db.get(chat.serverId);
    if (!server || server.ownerId !== identity.subject) {
      throw new Error("You do not have access to this chat.");
    }

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_chat_createdAt", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
  },
});
