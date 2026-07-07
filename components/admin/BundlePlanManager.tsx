"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function BundlePlanManager() {
  const bundles = useQuery(api.admin.listAllBundlePlans);
  const createBundle = useMutation(api.admin.createBundlePlan);
  const updateBundle = useMutation(api.admin.updateBundlePlan);
  const deleteBundle = useMutation(api.admin.deleteBundlePlan);
  const seedDefaults = useMutation(api.admin.seedDefaults);

  const [form, setForm] = useState({
    planTier: "basic" as "basic" | "pro",
    label: "",
    storageTierMb: 0,
    chatCapacity: 1,
    priceCents: 0,
    discountPercent: 0,
  });
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createBundle(form);
      setForm({ planTier: "basic", label: "", storageTierMb: 0, chatCapacity: 1, priceCents: 0, discountPercent: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create bundle.");
    }
  }

  async function toggleActive(bundleId: Id<"bundlePlans">, isActive: boolean) {
    await updateBundle({ bundleId, isActive: !isActive });
  }

  async function handleDelete(bundleId: Id<"bundlePlans">) {
    await deleteBundle({ bundleId });
  }

  async function handlePriceEdit(bundleId: Id<"bundlePlans">, priceCents: number) {
    await updateBundle({ bundleId, priceCents });
  }

  async function handleDiscountEdit(bundleId: Id<"bundlePlans">, discountPercent: number) {
    await updateBundle({ bundleId, discountPercent });
  }

  if (bundles === undefined) {
    return <p className="text-sm text-muted">Loading bundles...</p>;
  }

  return (
    <div className="space-y-6">
      {bundles.length === 0 && (
        <button
          onClick={() => seedDefaults()}
          className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink"
        >
          Seed default pricing + 12 bundles
        </button>
      )}

      <div className="space-y-3">
        {bundles.map((bundle) => (
          <div key={bundle._id} className="rounded-lg border border-line p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink">
                {bundle.label} <span className="text-muted text-xs">({bundle.planTier})</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(bundle._id, bundle.isActive)}
                  className="text-xs text-muted hover:text-ink"
                >
                  {bundle.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(bundle._id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-xs text-muted">
              {bundle.storageTierMb}MB · Up to {bundle.chatCapacity} chats
            </p>
            <div className="flex gap-3 items-center text-sm">
              <label className="flex items-center gap-2">
                <span className="text-muted text-xs">Price (cents)</span>
                <input
                  type="number"
                  defaultValue={bundle.priceCents}
                  onBlur={(e) => handlePriceEdit(bundle._id, Number(e.target.value))}
                  className="w-24 rounded-md border border-line px-2 py-1 text-ink bg-paper"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-muted text-xs">Extra discount %</span>
                <input
                  type="number"
                  defaultValue={bundle.discountPercent ?? 0}
                  onBlur={(e) => handleDiscountEdit(bundle._id, Number(e.target.value))}
                  className="w-20 rounded-md border border-line px-2 py-1 text-ink bg-paper"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} className="rounded-lg border border-line p-4 space-y-3">
        <p className="font-medium text-ink">Add a new bundle</p>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.planTier}
            onChange={(e) => setForm((f) => ({ ...f, planTier: e.target.value as "basic" | "pro" }))}
            className="rounded-md border border-line px-3 py-2 text-sm bg-paper text-ink"
          >
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
          </select>
          <input
            type="text"
            placeholder="Label"
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            required
            className="rounded-md border border-line px-3 py-2 text-sm bg-paper text-ink"
          />
          <input
            type="number"
            placeholder="Storage MB"
            value={form.storageTierMb}
            onChange={(e) => setForm((f) => ({ ...f, storageTierMb: Number(e.target.value) }))}
            required
            className="rounded-md border border-line px-3 py-2 text-sm bg-paper text-ink"
          />
          <input
            type="number"
            placeholder="Chat capacity"
            value={form.chatCapacity}
            onChange={(e) => setForm((f) => ({ ...f, chatCapacity: Number(e.target.value) }))}
            required
            className="rounded-md border border-line px-3 py-2 text-sm bg-paper text-ink"
          />
          <input
            type="number"
            placeholder="Price (cents)"
            value={form.priceCents}
            onChange={(e) => setForm((f) => ({ ...f, priceCents: Number(e.target.value) }))}
            required
            className="rounded-md border border-line px-3 py-2 text-sm bg-paper text-ink"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="rounded-md bg-accent text-accent-ink px-4 py-2 text-sm font-medium">
          Add bundle
        </button>
      </form>
    </div>
  );
}
