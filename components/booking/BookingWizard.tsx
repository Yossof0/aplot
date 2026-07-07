"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bookServerAction } from "@/app/actions/bookingActions";
import { BookingStepName } from "./BookingStepName";
import { BookingStepPlan } from "./BookingStepPlan";
import { BookingStepConfirm } from "./BookingStepConfirm";
import type { PlanTier, DurationTier, StorageTierMb } from "@/convex/lib/plans";

export function BookingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [planTier, setPlanTier] = useState<PlanTier>("basic");
  const [durationTier, setDurationTier] = useState<DurationTier>("3d");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handlePlanChange(tier: PlanTier) {
    setPlanTier(tier);
    setDurationTier(tier === "basic" ? "3d" : "1w");
  }

  async function handleConfirm(storageTierMb: StorageTierMb, chatCapacity: number) {
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted">
        {[1, 2, 3].map((n) => (
          <span key={n} className={n === step ? "text-accent font-medium" : ""}>
            {n}{n < 3 ? " → " : ""}
          </span>
        ))}
      </div>

      {step === 1 && (
        <BookingStepName name={name} onChange={setName} onNext={() => setStep(2)} />
      )}

      {step === 2 && (
        <BookingStepPlan
          planTier={planTier}
          durationTier={durationTier}
          onPlanChange={handlePlanChange}
          onDurationChange={setDurationTier}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <BookingStepConfirm
          planTier={planTier}
          durationTier={durationTier}
          onBack={() => setStep(2)}
          onConfirm={handleConfirm}
          isSubmitting={isSubmitting}
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
