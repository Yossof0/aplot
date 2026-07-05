import { MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Validates that a session token is active, unrevoked, and scoped to the
 * given chat. Every query/mutation that touches chatMessages or
 * userCredentials for a claimed (non-admin) caller MUST call this first.
 */
export async function requireActiveSession(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string,
  chatId: Id<"chats">,
) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("sessionToken", sessionToken))
    .unique();

  if (!session || session.revoked) {
    throw new Error("Session is invalid or has been revoked.");
  }
  if (session.chatId !== chatId) {
    throw new Error("Session is not valid for this chat.");
  }

  const chat = await ctx.db.get(chatId);
  if (!chat) throw new Error("This chat no longer exists.");

  const server = await ctx.db.get(chat.serverId);
  if (!server || server.status !== "active") {
    throw new Error("This server is no longer active.");
  }

  return session;
}

export function toMemberSafeMessage<
  T extends { senderCredentialId?: Id<"userCredentials"> },
>(message: T): Omit<T, "senderCredentialId"> {
  const { senderCredentialId: _drop, ...safe } = message;
  return safe;
}
