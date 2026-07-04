interface StorageMeterProps {
  usedBytes: number;
  capBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function StorageMeter({ usedBytes, capBytes }: StorageMeterProps) {
  const percent = Math.min(100, Math.round((usedBytes / capBytes) * 100));
  const isNearLimit = percent >= 85;

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <p className="text-sm font-medium">Storage</p>
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isNearLimit ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {formatBytes(usedBytes)} of {formatBytes(capBytes)} used ({percent}%)
      </p>
    </div>
  );
}
