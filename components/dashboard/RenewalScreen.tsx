"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PLAN_CONFIG, type PlanTier, type DurationTier } from "@/convex/lib/plans";
import type { Id } from "@/convex/_generated/dataModel";

const DURATION_LABELS: Record<string, string> = {
  "3d": "3 days", "5d": "5 days", "7d": "7 days",
  "14d": "14 days", "21d": "21 days", "30d": "30 days",
  "1w": "1 week", "2w": "2 weeks", "3w": "3 weeks",
  "1m": "1 month", "2m": "2 months", "3m": "3 months",
  "4m": "4 months", "5m": "5 months", "6m": "6 months",
};

function formatMs(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h`;
}

export function RenewalScreen({
  serverId,
  planTier,
  graceMsRemaining,
}: {
  serverId: Id<"servers">;
  planTier: PlanTier;
  graceMsRemaining: number;
}) {
  const renewServer = useMutation(api.servers.renewServer);
  const config = PLAN_CONFIG[planTier];
  const [durationTier, setDurationTier] = useState<DurationTier>(config.durationTiers[0]);
  const [isRenewing, setIsRenewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRenew() {
    setError(null);
    setIsRenewing(true);
    try {
      await renewServer({ serverId, durationTier });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not renew.");
    } finally {
      setIsRenewing(false);
    }
  }

  return (
    <div className="max-w-md mx-auto pt-16 space-y-4 text-center">
      <p className="font-serif text-xl font-semibold text-ink">Lease expired</p>
      <p className="text-sm text-muted">
        This server is in its grace period — <strong>{formatMs(graceMsRemaining)}</strong> left
        before everything is permanently deleted. Chats and members are inaccessible until you renew.
      </p>

      <label className="text-sm space-y-1 block text-left">
        <span className="text-muted">New lease duration</span>
        <select
          value={durationTier}
          onChange={(e) => setDurationTier(e.target.value as DurationTier)}
          className="w-full rounded-md border border-line px-3 py-2 bg-paper text-ink"
        >
          {config.durationTiers.map((tier) => (
            <option key={tier} value={tier}>{DURATION_LABELS[tier]}</option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleRenew}
        disabled={isRenewing}
        className="w-full rounded-md bg-accent text-accent-ink px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isRenewing ? "Renewing..." : "Renew now"}
      </button>
    </div>
  );
}
