"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { bookServerAction } from "@/app/actions/bookingActions";
import { PLAN_CONFIG, type PlanTier, type DurationTier, type StorageTierMb } from "@/convex/lib/plans";

const DURATION_LABELS: Record<DurationTier, string> = {
  "3d": "3 days", "5d": "5 days", "7d": "7 days",
  "14d": "14 days", "21d": "21 days", "30d": "30 days",
  "1w": "1 week", "2w": "2 weeks", "3w": "3 weeks",
  "1m": "1 month", "2m": "2 months", "3m": "3 months",
  "4m": "4 months", "5m": "5 months", "6m": "6 months",
};

export function BookingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [planTier, setPlanTier] = useState<PlanTier>("basic");
  const config = useMemo(() => PLAN_CONFIG[planTier], [planTier]);

  const [durationTier, setDurationTier] = useState<DurationTier>(config.durationTiers[0]);
  const [storageTierMb, setStorageTierMb] = useState<StorageTierMb>(config.storageTiersMb[0]);
  const [chatCapacity, setChatCapacity] = useState(1);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handlePlanChange(next: PlanTier) {
    setPlanTier(next);
    const nextConfig = PLAN_CONFIG[next];
    setDurationTier(nextConfig.durationTiers[0]);
    setStorageTierMb(nextConfig.storageTiersMb[0]);
    setChatCapacity(1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await bookServerAction(name, planTier, durationTier, storageTierMb, chatCapacity);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(`/dashboard/${result.data.serverId}`);
    } catch {
      setError("Something went wrong booking this server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Server name</label>
        <input
          type="text"
          placeholder="e.g. Q3 Crisis Comms"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Plan</label>
        <div className="grid grid-cols-2 gap-3">
          {(["basic", "pro"] as PlanTier[]).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => handlePlanChange(tier)}
              className={`rounded-md border px-4 py-3 text-sm text-left capitalize ${
                planTier === tier ? "border-primary bg-primary/5" : ""
              }`}
            >
              <div className="font-medium">{tier}</div>
              <div className="text-xs text-muted-foreground">
                Up to {PLAN_CONFIG[tier].maxChats} chats
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Lease duration</label>
        <select
          value={durationTier}
          onChange={(e) => setDurationTier(e.target.value as DurationTier)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          {config.durationTiers.map((tier) => (
            <option key={tier} value={tier}>
              {DURATION_LABELS[tier]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Storage cap</label>
        <select
          value={storageTierMb}
          onChange={(e) => setStorageTierMb(Number(e.target.value) as StorageTierMb)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          {config.storageTiersMb.map((mb) => (
            <option key={mb} value={mb}>
              {mb} MB
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Chat capacity ({chatCapacity} of {config.maxChats})
        </label>
        <input
          type="range"
          min={1}
          max={config.maxChats}
          value={chatCapacity}
          onChange={(e) => setChatCapacity(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          More chats cost more — this is locked for the full lease once booked.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isSubmitting ? "Booking..." : "Book server"}
      </button>
    </form>
  );
}
