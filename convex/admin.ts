import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { DEFAULT_RATES, DEFAULT_BUNDLE_SEEDS, computeBaseConfigPriceCents } from "./lib/pricing";

// Single source of truth for who can access the admin panel. Checked
// server-side against the verified Clerk identity — never trust a
// client-supplied "isAdmin" flag for this.
const ADMIN_EMAIL = "yossef2989@gmail.com";

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || identity.email !== ADMIN_EMAIL) {
    throw new Error("Not authorized.");
  }
  return identity;
}

export const isCurrentUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.email === ADMIN_EMAIL;
  },
});

export const updatePricingConfig = mutation({
  args: {
    baseFeeCents: v.number(),
    perMbCents: v.number(),
    perChatSlotCents: v.number(),
    perDayCents: v.number(),
    basicDiscountPercent: v.number(),
    proDiscountPercent: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.basicDiscountPercent < 0 || args.basicDiscountPercent > 100) {
      throw new Error("Basic discount must be between 0 and 100.");
    }
    if (args.proDiscountPercent < 0 || args.proDiscountPercent > 100) {
      throw new Error("Pro discount must be between 0 and 100.");
    }

    const existing = await ctx.db.query("pricingConfig").first();
    const payload = { ...args, updatedAt: Date.now() };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("pricingConfig", payload);
    }
  },
});

export const listAllBundlePlans = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const bundles = await ctx.db.query("bundlePlans").collect();
    return bundles.sort((a, b) => a.order - b.order);
  },
});

export const createBundlePlan = mutation({
  args: {
    planTier: v.union(v.literal("basic"), v.literal("pro")),
    label: v.string(),
    storageTierMb: v.number(),
    chatCapacity: v.number(),
    priceCents: v.number(),
    discountPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("bundlePlans").collect();
    const maxOrder = existing.reduce((max, b) => Math.max(max, b.order), -1);
    await ctx.db.insert("bundlePlans", { ...args, isActive: true, order: maxOrder + 1 });
  },
});

export const updateBundlePlan = mutation({
  args: {
    bundleId: v.id("bundlePlans"),
    label: v.optional(v.string()),
    storageTierMb: v.optional(v.number()),
    chatCapacity: v.optional(v.number()),
    priceCents: v.optional(v.number()),
    discountPercent: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { bundleId, ...patch } = args;
    await ctx.db.patch(bundleId, patch);
  },
});

export const deleteBundlePlan = mutation({
  args: { bundleId: v.id("bundlePlans") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.bundleId);
  },
});

// One-time setup: populates default rates + the original 12 bundles if the
// tables are empty. Safe to call repeatedly — it's a no-op once seeded.
export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const existingConfig = await ctx.db.query("pricingConfig").first();
    if (!existingConfig) {
      await ctx.db.insert("pricingConfig", { ...DEFAULT_RATES, updatedAt: Date.now() });
    }

    const existingBundles = await ctx.db.query("bundlePlans").collect();
    if (existingBundles.length === 0) {
      let order = 0;
      for (const seed of DEFAULT_BUNDLE_SEEDS) {
        const priceCents = Math.round(
          computeBaseConfigPriceCents(DEFAULT_RATES, seed.storageTierMb, seed.chatCapacity) * 0.9,
        );
        await ctx.db.insert("bundlePlans", {
          planTier: seed.planTier,
          label: seed.label,
          storageTierMb: seed.storageTierMb,
          chatCapacity: seed.chatCapacity,
          priceCents,
          isActive: true,
          order: order++,
        });
      }
    }
  },
});
