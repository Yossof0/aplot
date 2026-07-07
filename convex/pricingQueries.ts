import { query } from "./_generated/server";
import { DEFAULT_RATES } from "./lib/pricing";

export const getPricingConfig = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("pricingConfig").first();
    if (!config) return DEFAULT_RATES;
    return {
      baseFeeCents: config.baseFeeCents,
      perMbCents: config.perMbCents,
      perChatSlotCents: config.perChatSlotCents,
      perDayCents: config.perDayCents,
      basicDiscountPercent: config.basicDiscountPercent,
      proDiscountPercent: config.proDiscountPercent,
    };
  },
});

export const listActiveBundlePlans = query({
  args: {},
  handler: async (ctx) => {
    const bundles = await ctx.db.query("bundlePlans").collect();
    return bundles
      .filter((b) => b.isActive)
      .sort((a, b) => a.order - b.order);
  },
});
