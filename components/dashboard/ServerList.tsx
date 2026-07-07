import Link from "next/link";
import type { Doc } from "@/convex/_generated/dataModel";

export function ServerList({ servers }: { servers: Doc<"servers">[] }) {
  if (servers.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          You haven&apos;t booked a server yet.
        </p>
        <Link
          href="/booking"
          className="inline-block rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
        >
          Book your first server
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {servers.map((server) => (
        <li key={server._id}>
          <Link
            href={`/dashboard/${server._id}`}
            className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted transition-colors"
          >
            <div>
              <p className="font-medium">{server.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {server.status} · {server.planTier} plan
              </p>
            </div>
            <span className="text-xs text-muted-foreground">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
