"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import type { PlanTier, DurationTier, StorageTierMb } from "@/convex/lib/plans";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function bookServerAction(
  name: string,
  planTier: PlanTier,
  durationTier: DurationTier,
  storageTierMb: StorageTierMb,
  chatCapacity: number,
): Promise<ActionResult<{ serverId: string; expiresAt: number }>> {
  const { userId, getToken } = await auth();
  if (!userId) return { success: false, error: "Not authenticated." };
  const token = await getToken();
  if (!token) return { success: false, error: "Not authenticated." };

  // TODO: gate this behind a Stripe checkout session once billing exists.
  try {
    const result = await fetchMutation(
      api.servers.bookServer,
      { name, planTier, durationTier, storageTierMb, chatCapacity },
      { token },
    );
    return { success: true, data: result };
  } catch (err) {
    console.error("bookServerAction failed", err);
    const message = err instanceof Error ? err.message : "Could not book server.";
    return { success: false, error: message };
  }
}
