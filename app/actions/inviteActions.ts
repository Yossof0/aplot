"use server";

import bcrypt from "bcryptjs";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import type { Id } from "@/convex/_generated/dataModel";

const SALT_ROUNDS = 12;
const SESSION_COOKIE_NAME = "aplot_session";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createInviteAction(
  serverId: Id<"servers">,
  username: string,
  password: string,
): Promise<ActionResult<{ inviteToken: string }>> {
  const { userId, getToken } = await auth();
  if (!userId) return { success: false, error: "Not authenticated." };
  const token = await getToken({ template: "convex" });
  if (!token) return { success: false, error: "Not authenticated." };

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await fetchMutation(
      api.invites.createInviteWithHash,
      { serverId, username, passwordHash },
      { token },
    );
    return { success: true, data: { inviteToken: result.inviteToken } };
  } catch (err) {
    console.error("createInviteAction failed", err);
    const message = err instanceof Error ? err.message : "Could not create invite.";
    return { success: false, error: message };
  }
}

export async function claimInviteAction(
  inviteToken: string,
  username: string,
  password: string,
): Promise<ActionResult<{ serverId: string }>> {
  try {
    const credential = await fetchQuery(api.invites.getByToken, { inviteToken });
    if (!credential || credential.username !== username) {
      return { success: false, error: "Invalid or already-used invite." };
    }

    const valid = await bcrypt.compare(password, credential.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid or already-used invite." };
    }

    const { sessionToken } = await fetchMutation(api.invites.claimInvite, {
      inviteToken,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      // No maxAge set here deliberately — session validity is enforced
      // server-side via the `revoked` flag and server `status`, not cookie
      // expiry. A stolen but expired-server cookie is already useless.
    });

    return { success: true, data: { serverId: credential.serverId } };
  } catch (err) {
    console.error("claimInviteAction failed", err);
    return { success: false, error: "Invalid or already-used invite." };
  }
}
