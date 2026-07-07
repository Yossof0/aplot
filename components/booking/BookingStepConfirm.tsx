"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PLAN_CONFIG, type PlanTier, type DurationTier, type StorageTierMb } from "@/convex/lib/plans";
import {
  computeCustomTotalCents,
  computeDurationCostCents,
  applyBundleDiscount,
} from "@/convex/lib/pricing";

interface BookingStepConfirmProps {
  planTier: PlanTier;
  durationTier: DurationTier;
  onBack: () => void;
  onConfirm: (storageTierMb: StorageTierMb, chatCapacity: number) => void;
  isSubmitting: boolean;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function BookingStepConfirm({
  planTier,
  durationTier,
  onBack,
  onConfirm,
  isSubmitting,
}: BookingStepConfirmProps) {
  const config = PLAN_CONFIG[planTier];
  const rates = useQuery(api.pricingQueries.getPricingConfig);
  const bundles = useQuery(api.pricingQueries.listActiveBundlePlans);

  const [mode, setMode] = useState<"bundle" | "custom">("bundle");
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [customStorageMb, setCustomStorageMb] = useState<StorageTierMb>(config.storageTiersMb[0]);
  const [customChatCapacity, setCustomChatCapacity] = useState(1);

  const tierBundles = useMemo(
    () => (bundles ?? []).filter((b) => b.planTier === planTier),
    [bundles, planTier],
  );

  const selectedBundle = tierBundles.find((b) => b._id === selectedBundleId) ?? tierBundles[0];

  if (!rates || bundles === undefined) {
    return <p className="text-sm text-muted">Loading pricing...</p>;
  }

  const durationCostCents = computeDurationCostCents(rates, durationTier);

  const bundleTotalCents = selectedBundle
    ? applyBundleDiscount(selectedBundle.priceCents, selectedBundle.discountPercent) + durationCostCents
    : 0;

  const customTotalCents = computeCustomTotalCents(
    rates,
    planTier,
    customStorageMb,
    customChatCapacity,
    durationTier,
  );

  const finalStorageMb = mode === "bundle" ? (selectedBundle?.storageTierMb as StorageTierMb) : customStorageMb;
  const finalChatCapacity = mode === "bundle" ? (selectedBundle?.chatCapacity ?? 1) : customChatCapacity;
  const totalCents = mode === "bundle" ? bundleTotalCents : customTotalCents;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("bundle")}
          className={`flex-1 rounded-md border px-3 py-2 text-sm ${mode === "bundle" ? "border-accent bg-accent/5" : "border-line"}`}
        >
          Bundle
        </button>
        <button
          onClick={() => setMode("custom")}
          className={`flex-1 rounded-md border px-3 py-2 text-sm ${mode === "custom" ? "border-accent bg-accent/5" : "border-line"}`}
        >
          Custom
        </button>
      </div>

      {mode === "bundle" ? (
        <div className="grid grid-cols-1 gap-2">
          {tierBundles.map((bundle) => (
            <button
              key={bundle._id}
              onClick={() => setSelectedBundleId(bundle._id)}
              className={`rounded-md border px-3 py-2 text-left text-sm ${
                (selectedBundle?._id ?? tierBundles[0]?._id) === bundle._id ? "border-accent bg-accent/5" : "border-line"
              }`}
            >
              <div className="flex justify-between">
                <span className="text-ink font-medium">{bundle.label}</span>
                <span className="text-accent">
                  {formatPrice(applyBundleDiscount(bundle.priceCents, bundle.discountPercent))}
                </span>
              </div>
              <span className="text-xs text-muted">
                {bundle.storageTierMb}MB · Up to {bundle.chatCapacity} chats
              </span>
            </button>
          ))}
          {tierBundles.length === 0 && <p className="text-sm text-muted">No bundles available yet.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm space-y-1">
            <span className="text-muted">Storage</span>
            <select
              value={customStorageMb}
              onChange={(e) => setCustomStorageMb(Number(e.target.value) as StorageTierMb)}
              className="w-full rounded-md border border-line px-3 py-2 bg-paper text-ink"
            >
              {config.storageTiersMb.map((mb) => (
                <option key={mb} value={mb}>{mb} MB</option>
              ))}
            </select>
          </label>
          <label className="text-sm space-y-1">
            <span className="text-muted">Chat capacity</span>
            <input
              type="number"
              min={1}
              max={config.maxChats}
              value={customChatCapacity}
              onChange={(e) => setCustomChatCapacity(Number(e.target.value))}
              className="w-full rounded-md border border-line px-3 py-2 bg-paper text-ink"
            />
          </label>
        </div>
      )}

      <div className="rounded-md border border-line p-3 flex justify-between items-baseline">
        <span className="text-sm text-muted">Total</span>
        <span className="font-serif text-xl font-semibold text-accent">{formatPrice(totalCents)}</span>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 rounded-md border border-line px-4 py-2 text-sm font-medium text-ink">
          Back
        </button>
        <button
          onClick={() => onConfirm(finalStorageMb, finalChatCapacity)}
          disabled={isSubmitting || (mode === "bundle" && !selectedBundle)}
          className="flex-1 rounded-md bg-accent text-accent-ink px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isSubmitting ? "Booking..." : "Confirm booking"}
        </button>
      </div>
    </div>
  );
}
