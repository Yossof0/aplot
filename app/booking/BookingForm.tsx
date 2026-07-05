"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bookServerAction } from "@/app/actions/bookingActions";

type DurationTier = "3d" | "7d" | "2w" | "3w" | "1m";
type StorageTierMb = 25 | 50 | 100 | 250;

const DURATION_OPTIONS: { value: DurationTier; label: string }[] = [
  { value: "3d", label: "3 days" },
  { value: "7d", label: "7 days" },
  { value: "2w", label: "2 weeks" },
  { value: "3w", label: "3 weeks" },
  { value: "1m", label: "1 month" },
];

const STORAGE_OPTIONS: StorageTierMb[] = [25, 50, 100, 250];

export function BookingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [durationTier, setDurationTier] = useState<DurationTier>("7d");
  const [storageTierMb, setStorageTierMb] = useState<StorageTierMb>(50);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await bookServerAction(name, durationTier, storageTierMb);
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
        <label className="text-sm font-medium">Lease duration</label>
        <select
          value={durationTier}
          onChange={(e) => setDurationTier(e.target.value as DurationTier)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          {DURATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Storage cap</label>
        <select
          value={storageTierMb}
          onChange={(e) =>
            setStorageTierMb(Number(e.target.value) as StorageTierMb)
          }
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          {STORAGE_OPTIONS.map((mb) => (
            <option key={mb} value={mb}>
              {mb} MB
            </option>
          ))}
        </select>
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
