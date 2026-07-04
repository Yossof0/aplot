"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const LOG_LABELS: Record<string, string> = {
  invite_created: "Invite created",
  invite_claimed: "Invite claimed",
  member_removed: "Member removed",
  message_sent: "Message sent",
  server_expired: "Server expired",
  server_archived: "Server archived",
};

export function ActivityLog({ serverId }: { serverId: Id<"servers"> }) {
  const logs = useQuery(api.logs.listServerLogs, { serverId });

  if (logs === undefined) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Loading activity...</div>;
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <p className="text-sm font-medium">Activity</p>
      {logs.length === 0 && (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      )}
      <ul className="space-y-1">
        {logs.map((log) => (
          <li key={log._id} className="text-xs text-muted-foreground flex justify-between">
            <span>{LOG_LABELS[log.type] ?? log.type}</span>
            <span>{new Date(log.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
