"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export function MemberList({ chatId }: { chatId: Id<"chats"> }) {
  const credentials = useQuery(api.invites.listCredentialsForChat, { chatId });
  const revokeCredential = useMutation(api.invites.revokeCredential);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function handleRevoke(credentialId: Id<"userCredentials">) {
    setRevokingId(credentialId);
    try {
      await revokeCredential({ credentialId });
    } catch (err) {
      console.error("Failed to revoke credential", err);
    } finally {
      setRevokingId(null);
    }
  }

  if (credentials === undefined) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Loading members...</div>;
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <p className="text-sm font-medium">Members</p>
      {credentials.length === 0 && (
        <p className="text-sm text-muted-foreground">No invites yet.</p>
      )}
      <ul className="space-y-2">
        {credentials.map((c) => (
          <li key={c._id} className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">{c.username}</span>{" "}
              <span className="text-muted-foreground">
                ({c.state === "burned" ? "active" : "pending"})
              </span>
            </div>
            {c.state === "burned" && (
              <button
                onClick={() => handleRevoke(c._id)}
                disabled={revokingId === c._id}
                className="text-xs text-destructive hover:underline disabled:opacity-50"
              >
                {revokingId === c._id ? "Revoking..." : "Revoke access"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
