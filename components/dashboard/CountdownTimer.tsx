interface CountdownTimerProps {
  msRemaining: number;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h remaining`;
  }
  return `${hours}h remaining`;
}

export function CountdownTimer({ msRemaining }: CountdownTimerProps) {
  const label = formatRemaining(msRemaining);
  const isExpiringSoon = msRemaining > 0 && msRemaining < 6 * 60 * 60 * 1000;

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <p className="text-sm font-medium">Lease</p>
      <p className={`text-lg font-semibold ${isExpiringSoon ? "text-destructive" : ""}`}>
        {label}
      </p>
      <p className="text-xs text-muted-foreground">
        Refresh the page for the latest time remaining.
      </p>
    </div>
  );
}
