import { PLAN_CONFIG, type PlanTier, type DurationTier } from "@/convex/lib/plans";

const DURATION_LABELS: Record<string, string> = {
  "3d": "3 days", "5d": "5 days", "7d": "7 days",
  "14d": "14 days", "21d": "21 days", "30d": "30 days",
  "1w": "1 week", "2w": "2 weeks", "3w": "3 weeks",
  "1m": "1 month", "2m": "2 months", "3m": "3 months",
  "4m": "4 months", "5m": "5 months", "6m": "6 months",
};

interface BookingStepPlanProps {
  planTier: PlanTier;
  durationTier: DurationTier;
  onPlanChange: (tier: PlanTier) => void;
  onDurationChange: (tier: DurationTier) => void;
  onBack: () => void;
  onNext: () => void;
}

export function BookingStepPlan({
  planTier,
  durationTier,
  onPlanChange,
  onDurationChange,
  onBack,
  onNext,
}: BookingStepPlanProps) {
  const config = PLAN_CONFIG[planTier];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink">Plan</label>
        <div className="grid grid-cols-2 gap-3">
          {(["basic", "pro"] as PlanTier[]).map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => onPlanChange(tier)}
              className={`rounded-md border px-4 py-3 text-sm text-left capitalize ${
                planTier === tier ? "border-accent bg-accent/5" : "border-line"
              }`}
            >
              <div className="font-medium text-ink">{tier}</div>
              <div className="text-xs text-muted">Up to {PLAN_CONFIG[tier].maxChats} chats</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-ink">Lease duration</label>
        <select
          value={durationTier}
          onChange={(e) => onDurationChange(e.target.value as DurationTier)}
          className="w-full rounded-md border border-line px-3 py-2 text-sm bg-paper text-ink"
        >
          {config.durationTiers.map((tier) => (
            <option key={tier} value={tier}>
              {DURATION_LABELS[tier]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-md border border-line px-4 py-2 text-sm font-medium text-ink"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-md bg-accent text-accent-ink px-4 py-2 text-sm font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
}
