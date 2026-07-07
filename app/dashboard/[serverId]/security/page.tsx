"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function SecurityPage() {
  const params = useParams<{ serverId: string }>();
  const serverId = params.serverId as Id<"servers">;

  const overview = useQuery(api.servers.getSecurityOverview, { serverId });
  const revokeAll = useMutation(api.servers.revokeAllSessions);
  const [isRevoking, setIsRevoking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRevokeAll() {
    setIsRevoking(true);
    setMessage(null);
    try {
      const result = await revokeAll({ serverId });
      setMessage(`Revoked ${result.revokedCount} active session(s).`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not revoke sessions.");
    } finally {
      setIsRevoking(false);
    }
  }

  if (overview === undefined) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-xl font-semibold text-ink">Security</h1>

      <div className="rounded-lg border border-line p-4 space-y-3">
        <p className="text-sm text-muted">
          {overview.activeSessionCount} active member session(s) across {overview.chatCount} chat(s).
        </p>
        <p className="text-xs text-muted">
          Revoking clears every claimed member's access immediately — they'd need a fresh invite to get back in.
          Use this if you suspect a credential was compromised.
        </p>
        <button
          onClick={handleRevokeAll}
          disabled={isRevoking || overview.activeSessionCount === 0}
          className="rounded-md bg-red-500 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isRevoking ? "Revoking..." : "Revoke all active sessions"}
        </button>
        {message && <p className="text-sm text-muted">{message}</p>}
      </div>
    </div>
  );
}
