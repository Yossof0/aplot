"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

type DurationTier = "3d" | "7d" | "2w" | "3w" | "1m";
type StorageTierMb = 25 | 50 | 100 | 250;

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function bookServerAction(
  name: string,
  durationTier: DurationTier,
  storageTierMb: StorageTierMb,
): Promise<ActionResult<{ serverId: string; expiresAt: number }>> {
  const { userId, getToken } = await auth();
  if (!userId) return { success: false, error: "Not authenticated." };
  const token = await getToken({ template: "convex" });
  if (!token) return { success: false, error: "Not authenticated." };

  // TODO: gate this behind a Stripe checkout session once billing exists.
  // Verify payment succeeded (webhook-confirmed) before calling bookServer,
  // rather than trusting a client-supplied "paid: true" flag.

  try {
    const result = await fetchMutation(
      api.servers.bookServer,
      { name, durationTier, storageTierMb },
      { token },
    );
    return { success: true, data: result };
  } catch (err) {
    console.error("bookServerAction failed", err);
    const message = err instanceof Error ? err.message : "Could not book server.";
    return { success: false, error: message };
  }
}
