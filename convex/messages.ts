import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireActiveSession, toMemberSafeMessage } from "./lib/session";

export const sendMessage = mutation({
  args: {
    serverId: v.id("servers"),
    body: v.string(),
    // Member path only. Admin identity comes from ctx.auth, never a client arg.
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let senderRole: "admin" | "member";
    let senderCredentialId;

    const identity = await ctx.auth.getUserIdentity();

    if (identity) {
      const server = await ctx.db.get(args.serverId);
      if (!server || server.ownerId !== identity.subject) {
        throw new Error("You do not have access to this server.");
      }
      senderRole = "admin";
    } else if (args.sessionToken) {
      const session = await requireActiveSession(
        ctx,
        args.sessionToken,
        args.serverId,
      );
      senderRole = "member";
      senderCredentialId = session.credentialId;
    } else {
      throw new Error("Missing sender identity.");
    }

    const bodyBytes = new TextEncoder().encode(args.body).length;

    const server = await ctx.db.get(args.serverId);
    if (!server) throw new Error("Server not found.");

    const capBytes = server.storageTierMb * 1024 * 1024;
    if (server.storageUsedBytes + bodyBytes > capBytes) {
      throw new Error("Server storage cap reached.");
    }

    await ctx.db.insert("chatMessages", {
      serverId: args.serverId,
      senderRole,
      senderCredentialId,
      body: args.body,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.serverId, {
      storageUsedBytes: server.storageUsedBytes + bodyBytes,
    });

    await ctx.db.insert("serverLogs", {
      serverId: args.serverId,
      type: "message_sent",
      createdAt: Date.now(),
    });
  },
});

// Member-facing: reactive, strips senderCredentialId per Max Privacy.
export const listMessagesForMember = query({
  args: { serverId: v.id("servers"), sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireActiveSession(ctx, args.sessionToken, args.serverId);

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_server_createdAt", (q) => q.eq("serverId", args.serverId))
      .order("asc")
      .collect();

    return messages.map(toMemberSafeMessage);
  },
});

// Admin-facing: full rows, for moderation.
export const listMessagesForAdmin = query({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated.");

    const server = await ctx.db.get(args.serverId);
    if (!server || server.ownerId !== identity.subject) {
      throw new Error("You do not have access to this server.");
    }

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_server_createdAt", (q) => q.eq("serverId", args.serverId))
      .order("asc")
      .collect();
  },
});
