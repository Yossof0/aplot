"use client";

import { useParams } from "next/navigation";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import type { Id } from "@/convex/_generated/dataModel";

export default function LogsPage() {
  const params = useParams<{ serverId: string }>();
  const serverId = params.serverId as Id<"servers">;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">Activity Logs</h1>
      <ActivityLog serverId={serverId} />
    </div>
  );
}
