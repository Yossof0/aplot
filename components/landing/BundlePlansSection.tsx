"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { applyBundleDiscount } from "@/convex/lib/pricing";

const TEASER_COUNT = 3; // shown per plan tier before sign-in gate

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function BundlePlansSection({ isSignedIn }: { isSignedIn: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const bundles = useQuery(api.pricingQueries.listActiveBundlePlans);

  if (bundles === undefined) {
    return (
      <div id="pricing" className="w-full max-w-4xl text-center scroll-mt-24">
        <p className="text-sm text-muted">Loading plans...</p>
      </div>
    );
  }

  const basicBundles = bundles.filter((b) => b.planTier === "basic");
  const proBundles = bundles.filter((b) => b.planTier === "pro");

  const visibleBasic = expanded ? basicBundles : basicBundles.slice(0, TEASER_COUNT);
  const visiblePro = expanded ? proBundles : proBundles.slice(0, TEASER_COUNT);

  return (
    <div id="pricing" className="w-full max-w-4xl space-y-8 scroll-mt-24">
      <p className="text-xs tracking-widest font-mono text-accent text-center">
        PLANS &amp; PRICING
      </p>

      <div className="space-y-6">
        <BundleRow title="Basic bundles" bundles={visibleBasic} />
        <BundleRow title="Pro bundles" bundles={visiblePro} />
      </div>

      {!expanded && bundles.length > TEASER_COUNT * 2 && (
        <div className="flex justify-center">
          {isSignedIn ? (
            <button
              onClick={() => setExpanded(true)}
              className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink/40 transition-colors"
            >
              See all {bundles.length} bundles
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink/40 transition-colors">
                Sign in to see all {bundles.length} bundles
              </button>
            </SignInButton>
          )}
        </div>
      )}

      <p className="text-xs text-muted text-center">
        Lease duration is chosen separately at booking — prices above are for storage and chat capacity only. Need something in between? Use the Custom option when booking.
      </p>
    </div>
  );
}

import type { Doc } from "@/convex/_generated/dataModel";

function BundleRow({
  title,
  bundles,
}: {
  title: string;
  bundles: Doc<"bundlePlans">[];
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {bundles.map((bundle) => {
            const finalPrice = applyBundleDiscount(bundle.priceCents, bundle.discountPercent);
            const hasDiscount = Boolean(bundle.discountPercent);
            return (
              <motion.div
                key={bundle._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -3 }}
                className="rounded-lg border border-line p-4 space-y-2 text-left bg-paper hover:border-ink/30 transition-colors"
              >
                <p className="font-medium text-ink">{bundle.label}</p>
                <p className="text-sm text-muted">
                  {bundle.storageTierMb}MB · Up to {bundle.chatCapacity} chats
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="font-serif text-lg font-semibold text-accent">
                    {formatPrice(finalPrice)}
                  </p>
                  {hasDiscount && (
                    <p className="text-xs text-muted line-through">{formatPrice(bundle.priceCents)}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
