"use client";

import { motion } from "framer-motion";
import { PLAN_CONFIG } from "@/convex/lib/plans";

const DURATION_LABELS: Record<string, string> = {
  "3d": "3 days", "5d": "5 days", "7d": "7 days",
  "14d": "14 days", "21d": "21 days", "30d": "30 days",
  "1w": "1 week", "2w": "2 weeks", "3w": "3 weeks",
  "1m": "1 month", "2m": "2 months", "3m": "3 months",
  "4m": "4 months", "5m": "5 months", "6m": "6 months",
};

function formatDurationRange(tiers: string[]): string {
  return `${DURATION_LABELS[tiers[0]]} – ${DURATION_LABELS[tiers[tiers.length - 1]]}`;
}

function formatStorageRange(tiersMb: number[]): string {
  return `${tiersMb[0]}MB – ${tiersMb[tiersMb.length - 1]}MB`;
}

export function PlanComparison() {
  return (
    <div className="w-full max-w-3xl space-y-8">
      <p className="text-xs tracking-widest font-mono text-accent text-center">PLANS</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(["basic", "pro"] as const).map((tier, i) => {
          const config = PLAN_CONFIG[tier];
          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
              whileHover={{ y: -3 }}
              className="rounded-lg border border-line p-6 space-y-4 text-left bg-paper transition-colors hover:border-ink/30"
            >
              <p className="font-serif text-lg font-semibold capitalize text-ink">{tier}</p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Lease duration</dt>
                  <dd className="text-ink">{formatDurationRange(config.durationTiers)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Storage cap</dt>
                  <dd className="text-ink">{formatStorageRange(config.storageTiersMb)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Chats per server</dt>
                  <dd className="text-ink">Up to {config.maxChats}</dd>
                </div>
              </dl>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
