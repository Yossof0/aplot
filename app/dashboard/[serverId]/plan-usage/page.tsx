"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { PLAN_CONFIG, type DurationTier, type StorageTierMb } from "@/convex/lib/plans";
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
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h remaining`;
  return `${hours}h remaining`;
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-line/50 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-accent"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, percent)}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

export default function PlanUsagePage() {
  const params = useParams<{ serverId: string }>();
  const serverId = params.serverId as Id<"servers">;

  const dashboard = useQuery(api.servers.getServerDashboard, { serverId });
  const renewServer = useMutation(api.servers.renewServer);
  const upgradeCapacity = useMutation(api.servers.upgradeServerCapacity);

  const [renewDuration, setRenewDuration] = useState<DurationTier | null>(null);
  const [upgradeStorage, setUpgradeStorage] = useState<StorageTierMb | null>(null);
  const [upgradeChats, setUpgradeChats] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (dashboard === undefined) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const config = PLAN_CONFIG[dashboard.planTier];
  const storagePercent = (dashboard.storageUsedBytes / dashboard.storageCapBytes) * 100;
  const chatsPercent = (dashboard.chatsUsed / dashboard.chatCapacity) * 100;

  async function handleRenew() {
    if (!renewDuration) return;
    setBusy(true);
    setMessage(null);
    try {
      await renewServer({ serverId, durationTier: renewDuration });
      setMessage("Lease renewed.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not renew.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpgrade() {
    const storageTierMb = upgradeStorage ?? dashboard.storageTierMb;
    const chatCapacity = upgradeChats ?? dashboard.chatCapacity;
    setBusy(true);
    setMessage(null);
    try {
      await upgradeCapacity({ serverId, storageTierMb, chatCapacity });
      setMessage("Capacity upgraded.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not upgrade.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-xl font-semibold text-ink">Plan &amp; Usage</h1>

      <div className="rounded-lg border border-line p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Storage</span>
          <span className="text-ink">{storagePercent.toFixed(0)}% used</span>
        </div>
        <ProgressBar percent={storagePercent} />
      </div>

      <div className="rounded-lg border border-line p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Chats</span>
          <span className="text-ink">{dashboard.chatsUsed} / {dashboard.chatCapacity}</span>
        </div>
        <ProgressBar percent={chatsPercent} />
      </div>

      <div className="rounded-lg border border-line p-4 space-y-3">
        <p className="text-sm text-muted">{formatMs(dashboard.msRemaining)}</p>
        <div className="flex gap-2">
          <select
            defaultValue=""
            onChange={(e) => setRenewDuration(e.target.value as DurationTier)}
            className="flex-1 rounded-md border border-line px-3 py-2 text-sm bg-paper text-ink"
          >
            <option value="" disabled>Extend by...</option>
            {config.durationTiers.map((tier) => (
              <option key={tier} value={tier}>{DURATION_LABELS[tier]}</option>
            ))}
          </select>
          <button
            onClick={handleRenew}
            disabled={busy || !renewDuration}
            className="rounded-md bg-accent text-accent-ink px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Renew
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-line p-4 space-y-3">
        <p className="text-sm font-medium text-ink">Upgrade capacity</p>
        <p className="text-xs text-muted">Storage and chat slots can only go up, never down.</p>
        <div className="grid grid-cols-2 gap-2">
          <select
            defaultValue={dashboard.storageTierMb}
            onChange={(e) => setUpgradeStorage(Number(e.target.value) as StorageTierMb)}
            className="rounded-md border border-line px-3 py-2 text-sm bg-paper text-ink"
          >
            {config.storageTiersMb
              .filter((mb) => mb >= dashboard.storageTierMb)
              .map((mb) => (
                <option key={mb} value={mb}>{mb} MB</option>
              ))}
          </select>
          <input
            type="number"
            min={dashboard.chatCapacity}
            max={config.maxChats}
            defaultValue={dashboard.chatCapacity}
            onChange={(e) => setUpgradeChats(Number(e.target.value))}
            className="rounded-md border border-line px-3 py-2 text-sm bg-paper text-ink"
          />
        </div>
        <button
          onClick={handleUpgrade}
          disabled={busy}
          className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
        >
          Upgrade
        </button>
      </div>

      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}
