export type PlanTier = "basic" | "pro";

export type DurationTier =
  | "3d" | "5d" | "7d" | "14d" | "21d" | "30d" // basic
  | "1w" | "2w" | "3w" | "1m" | "2m" | "3m" | "4m" | "5m" | "6m"; // pro

export type StorageTierMb =
  | 3 | 5 | 10 | 15 | 20 | 25 // basic (25 also valid for pro, see below)
  | 50 | 75 | 100 | 125 | 150 | 175 | 200 | 225 | 250; // pro

export const PLAN_CONFIG: Record<
  PlanTier,
  { durationTiers: DurationTier[]; storageTiersMb: StorageTierMb[]; maxChats: number }
> = {
  basic: {
    durationTiers: ["3d", "5d", "7d", "14d", "21d", "30d"],
    storageTiersMb: [3, 5, 10, 15, 20, 25],
    maxChats: 3,
  },
  pro: {
    durationTiers: ["1w", "2w", "3w", "1m", "2m", "3m", "4m", "5m", "6m"],
    storageTiersMb: [25, 50, 75, 100, 125, 150, 175, 200, 225, 250],
    maxChats: 10,
  },
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DURATION_TO_MS: Record<DurationTier, number> = {
  "3d": 3 * DAY_MS,
  "5d": 5 * DAY_MS,
  "7d": 7 * DAY_MS,
  "14d": 14 * DAY_MS,
  "21d": 21 * DAY_MS,
  "30d": 30 * DAY_MS,
  "1w": 7 * DAY_MS,
  "2w": 14 * DAY_MS,
  "3w": 21 * DAY_MS,
  "1m": 30 * DAY_MS,
  "2m": 60 * DAY_MS,
  "3m": 90 * DAY_MS,
  "4m": 120 * DAY_MS,
  "5m": 150 * DAY_MS,
  "6m": 180 * DAY_MS,
};

export function computeExpiresAt(bookedAt: number, tier: DurationTier): number {
  return bookedAt + DURATION_TO_MS[tier];
}

export function msRemaining(expiresAt: number, now: number = Date.now()): number {
  return Math.max(0, expiresAt - now);
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }
  return `${hours}h remaining`;
}

/**
 * Validates a booking combo against plan rules. Call this in bookServer
 * before writing anything — the client dropdowns should already filter to
 * valid options, but never trust that server-side.
 */
export function validateBookingConfig(
  planTier: PlanTier,
  durationTier: DurationTier,
  storageTierMb: StorageTierMb,
  chatCapacity: number,
): string | null {
  const config = PLAN_CONFIG[planTier];

  if (!config.durationTiers.includes(durationTier)) {
    return `${durationTier} is not a valid duration for the ${planTier} plan.`;
  }
  if (!config.storageTiersMb.includes(storageTierMb)) {
    return `${storageTierMb}MB is not a valid storage tier for the ${planTier} plan.`;
  }
  if (chatCapacity < 1 || chatCapacity > config.maxChats) {
    return `Chat capacity must be between 1 and ${config.maxChats} for the ${planTier} plan.`;
  }
  return null;
}
