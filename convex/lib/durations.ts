export type DurationTier = "3d" | "7d" | "2w" | "3w" | "1m";

const TIER_TO_MS: Record<DurationTier, number> = {
  "3d": 3 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "2w": 14 * 24 * 60 * 60 * 1000,
  "3w": 21 * 24 * 60 * 60 * 1000,
  "1m": 30 * 24 * 60 * 60 * 1000, // fixed 30-day month; avoids calendar-month ambiguity
};

export function computeExpiresAt(bookedAt: number, tier: DurationTier): number {
  return bookedAt + TIER_TO_MS[tier];
}

export function msRemaining(
  expiresAt: number,
  now: number = Date.now(),
): number {
  return Math.max(0, expiresAt - now);
}

export function formatRemaining(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h remaining`;
  }
  return `${hours}h remaining`;
}
