import { MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Validates that a session token is active, unrevoked, and scoped to the
 * given server. Every query/mutation that touches chatMessages or
 * userCredentials for a claimed (non-admin) caller MUST call this first.
 * Centralizing it here means the Max Privacy check lives in one place
 * instead of being re-implemented per function.
 */
export async function requireActiveSession(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string,
  serverId: Id<"servers">,
) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("sessionToken", sessionToken))
    .unique();

  if (!session || session.revoked) {
    throw new Error("Session is invalid or has been revoked.");
  }
  if (session.serverId !== serverId) {
    throw new Error("Session is not valid for this server.");
  }

  const server = await ctx.db.get(serverId);
  if (!server || server.status !== "active") {
    throw new Error("This server is no longer active.");
  }

  return session;
}

/**
 * Strips fields a member must never see, per the Max Privacy engine.
 * Admin-facing reads should NOT use this — they get the full row.
 */
export function toMemberSafeMessage<
  T extends { senderCredentialId?: Id<"userCredentials"> },
>(message: T): Omit<T, "senderCredentialId"> {
  const { senderCredentialId: _drop, ...safe } = message;
  return safe;
}
