"use server";

import bcrypt from "bcryptjs";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import type { Id } from "@/convex/_generated/dataModel";

import { sessionCookieName } from "@/lib/sessionCookie";

const SALT_ROUNDS = 12;

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createInviteAction(
  chatId: Id<"chats">,
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
      { chatId, username, passwordHash },
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
): Promise<ActionResult<{ chatId: string }>> {
  try {
    const credential = await fetchQuery(api.invites.getByToken, { inviteToken });
    if (!credential || credential.username !== username) {
      return { success: false, error: "Invalid or already-used invite." };
    }

    const valid = await bcrypt.compare(password, credential.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid or already-used invite." };
    }

    const { sessionToken, chatId } = await fetchMutation(api.invites.claimInvite, {
      inviteToken,
    });

    const cookieStore = await cookies();
    cookieStore.set(sessionCookieName(chatId), sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return { success: true, data: { chatId } };
  } catch (err) {
    console.error("claimInviteAction failed", err);
    return { success: false, error: "Invalid or already-used invite." };
  }
}
