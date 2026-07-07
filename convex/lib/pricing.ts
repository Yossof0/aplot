import { PLAN_CONFIG, DAY_MS_LOOKUP, type PlanTier, type DurationTier, type StorageTierMb } from "./plans";

export interface PricingRates {
  baseFeeCents: number;
  perMbCents: number;
  perChatSlotCents: number;
  perDayCents: number;
  basicDiscountPercent: number;
  proDiscountPercent: number;
}

// Lowered from the original placeholder rates ($5/$0.10/$3/$0.50) as a
// starting-point price decrease. Admin panel controls everything from here.
export const DEFAULT_RATES: PricingRates = {
  baseFeeCents: 400,
  perMbCents: 8,
  perChatSlotCents: 250,
  perDayCents: 40,
  basicDiscountPercent: 0,
  proDiscountPercent: 0,
};

function durationToDays(tier: DurationTier): number {
  return DAY_MS_LOOKUP[tier] / (24 * 60 * 60 * 1000);
}

export function computeBaseConfigPriceCents(
  rates: PricingRates,
  storageTierMb: number,
  chatCapacity: number,
): number {
  return rates.baseFeeCents + storageTierMb * rates.perMbCents + chatCapacity * rates.perChatSlotCents;
}

export function computeDurationCostCents(rates: PricingRates, durationTier: DurationTier): number {
  return Math.round(durationToDays(durationTier) * rates.perDayCents);
}

export function computeCustomTotalCents(
  rates: PricingRates,
  planTier: PlanTier,
  storageTierMb: number,
  chatCapacity: number,
  durationTier: DurationTier,
): number {
  const subtotal =
    computeBaseConfigPriceCents(rates, storageTierMb, chatCapacity) +
    computeDurationCostCents(rates, durationTier);
  const discountPercent = planTier === "basic" ? rates.basicDiscountPercent : rates.proDiscountPercent;
  return Math.round(subtotal * (1 - discountPercent / 100));
}

/** Applies a bundle's own discount (if any) on top of its stored price. */
export function applyBundleDiscount(priceCents: number, discountPercent?: number): number {
  if (!discountPercent) return priceCents;
  return Math.round(priceCents * (1 - discountPercent / 100));
}

/** Grace period length before hard deletion, per plan tier. */
export function graceMsForPlan(planTier: PlanTier): number {
  const days = PLAN_CONFIG[planTier].graceDays;
  return days * 24 * 60 * 60 * 1000;
}

// Used only by admin.seedDefaults to populate the DB on first setup.
export const DEFAULT_BUNDLE_SEEDS: { planTier: PlanTier; label: string; storageTierMb: StorageTierMb; chatCapacity: number }[] = [
  { planTier: "basic", label: "Starter", storageTierMb: 3, chatCapacity: 1 },
  { planTier: "basic", label: "Solo", storageTierMb: 5, chatCapacity: 1 },
  { planTier: "basic", label: "Team", storageTierMb: 10, chatCapacity: 2 },
  { planTier: "basic", label: "Team+", storageTierMb: 15, chatCapacity: 2 },
  { planTier: "basic", label: "Growth", storageTierMb: 20, chatCapacity: 3 },
  { planTier: "basic", label: "Growth+", storageTierMb: 25, chatCapacity: 3 },
  { planTier: "pro", label: "Pro Starter", storageTierMb: 25, chatCapacity: 3 },
  { planTier: "pro", label: "Pro Team", storageTierMb: 50, chatCapacity: 5 },
  { planTier: "pro", label: "Pro Team+", storageTierMb: 75, chatCapacity: 6 },
  { planTier: "pro", label: "Pro Growth", storageTierMb: 100, chatCapacity: 7 },
  { planTier: "pro", label: "Pro Scale", storageTierMb: 150, chatCapacity: 8 },
  { planTier: "pro", label: "Pro Scale+", storageTierMb: 250, chatCapacity: 10 },
];
