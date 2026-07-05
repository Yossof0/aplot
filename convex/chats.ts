import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createChat = mutation({
  args: { serverId: v.id("servers"), name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const server = await ctx.db.get(args.serverId);
    if (!server || server.ownerId !== identity.subject) {
      throw new Error("Server not found or you do not have access.");
    }
    if (server.status !== "active") {
      throw new Error("Cannot add a chat to a server that is not active.");
    }

    const existingChats = await ctx.db
      .query("chats")
      .withIndex("by_server", (q) => q.eq("serverId", args.serverId))
      .collect();

    if (existingChats.length >= server.chatCapacity) {
      throw new Error(
        `This server is capped at ${server.chatCapacity} chats. Delete one first or book a larger capacity next time.`,
      );
    }

    const chatId = await ctx.db.insert("chats", {
      serverId: args.serverId,
      name: args.name,
      createdAt: Date.now(),
    });

    await ctx.db.insert("serverLogs", {
      serverId: args.serverId,
      chatId,
      type: "chat_created",
      createdAt: Date.now(),
    });

    return { chatId };
  },
});

export const listChatsForServer = query({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const server = await ctx.db.get(args.serverId);
    if (!server || server.ownerId !== identity.subject) {
      throw new Error("Server not found or you do not have access.");
    }

    return await ctx.db
      .query("chats")
      .withIndex("by_server", (q) => q.eq("serverId", args.serverId))
      .collect();
  },
});

export const deleteChat = mutation({
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

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_chat_createdAt", (q) => q.eq("chatId", args.chatId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    const credentials = await ctx.db
      .query("userCredentials")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();
    for (const credential of credentials) {
      await ctx.db.delete(credential._id);
    }

    await ctx.db.delete(args.chatId);

    await ctx.db.insert("serverLogs", {
      serverId: chat.serverId,
      type: "chat_deleted",
      createdAt: Date.now(),
    });
  },
});
