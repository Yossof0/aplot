import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createInviteWithHash = mutation({
  args: {
    chatId: v.id("chats"),
    username: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found.");

    const server = await ctx.db.get(chat.serverId);
    if (!server || server.ownerId !== identity.subject) {
      throw new Error("You do not have access to this chat.");
    }
    if (server.status !== "active") {
      throw new Error("Cannot invite to a chat on a server that is not active.");
    }

    const existing = await ctx.db
      .query("userCredentials")
      .withIndex("by_chat_username", (q) =>
        q.eq("chatId", args.chatId).eq("username", args.username),
      )
      .unique();
    if (existing) {
      throw new Error("That username is already in use on this chat.");
    }

    const inviteToken = crypto.randomUUID();

    const credentialId = await ctx.db.insert("userCredentials", {
      chatId: args.chatId,
      username: args.username,
      passwordHash: args.passwordHash,
      inviteToken,
      state: "pending",
    });

    await ctx.db.insert("serverLogs", {
      serverId: chat.serverId,
      chatId: args.chatId,
      type: "invite_created",
      createdAt: Date.now(),
    });

    return { credentialId, inviteToken };
  },
});

export const getByToken = query({
  args: { inviteToken: v.string() },
  handler: async (ctx, args) => {
    const credential = await ctx.db
      .query("userCredentials")
      .withIndex("by_token", (q) => q.eq("inviteToken", args.inviteToken))
      .unique();

    if (!credential || credential.state === "burned") return null;

    return {
      credentialId: credential._id,
      chatId: credential.chatId,
      username: credential.username,
      passwordHash: credential.passwordHash,
    };
  },
});

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

    await ctx.db.patch(credential._id, { state: "burned", claimedAt: Date.now() });

    const sessionToken = crypto.randomUUID();
    const sessionId = await ctx.db.insert("sessions", {
      chatId: credential.chatId,
      credentialId: credential._id,
      sessionToken,
      createdAt: Date.now(),
      revoked: false,
    });

    await ctx.db.patch(credential._id, { sessionId });

    const chat = await ctx.db.get(credential.chatId);
    if (chat) {
      await ctx.db.insert("serverLogs", {
        serverId: chat.serverId,
        chatId: credential.chatId,
        type: "invite_claimed",
        createdAt: Date.now(),
      });
    }

    return { sessionToken, chatId: credential.chatId };
  },
});

export const listCredentialsForChat = query({
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

    const credentials = await ctx.db
      .query("userCredentials")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

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

    const chat = await ctx.db.get(credential.chatId);
    if (!chat) throw new Error("Chat not found.");

    const server = await ctx.db.get(chat.serverId);
    if (!server || server.ownerId !== identity.subject) {
      throw new Error("You do not have access to this chat.");
    }

    if (credential.sessionId) {
      await ctx.db.patch(credential.sessionId, { revoked: true });
    }

    await ctx.db.insert("serverLogs", {
      serverId: chat.serverId,
      chatId: chat._id,
      type: "member_removed",
      createdAt: Date.now(),
    });
  },
});
