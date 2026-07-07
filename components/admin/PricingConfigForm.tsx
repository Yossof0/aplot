"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function PricingConfigForm() {
  const config = useQuery(api.pricingQueries.getPricingConfig);
  const updateConfig = useMutation(api.admin.updatePricingConfig);

  const [form, setForm] = useState({
    baseFeeCents: 0,
    perMbCents: 0,
    perChatSlotCents: 0,
    perDayCents: 0,
    basicDiscountPercent: 0,
    proDiscountPercent: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  function updateField(key: keyof typeof form, value: number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await updateConfig(form);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save pricing.");
    } finally {
      setSaving(false);
    }
  }

  if (config === undefined) {
    return <p className="text-sm text-muted">Loading pricing config...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-line p-5 space-y-4">
      <p className="font-medium text-ink">Base rates (cents)</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Base fee" value={form.baseFeeCents} onChange={(v) => updateField("baseFeeCents", v)} />
        <Field label="Per MB" value={form.perMbCents} onChange={(v) => updateField("perMbCents", v)} />
        <Field label="Per chat slot" value={form.perChatSlotCents} onChange={(v) => updateField("perChatSlotCents", v)} />
        <Field label="Per day" value={form.perDayCents} onChange={(v) => updateField("perDayCents", v)} />
      </div>

      <p className="font-medium text-ink pt-2">Discounts on custom (non-bundle) pricing</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Basic plan %" value={form.basicDiscountPercent} onChange={(v) => updateField("basicDiscountPercent", v)} />
        <Field label="Pro plan %" value={form.proDiscountPercent} onChange={(v) => updateField("proDiscountPercent", v)} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-accent">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-accent text-accent-ink px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save pricing"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-sm space-y-1 block">
      <span className="text-muted">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-line px-3 py-2 text-ink bg-paper"
      />
    </label>
  );
}
