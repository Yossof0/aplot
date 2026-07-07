"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function SettingsPage() {
  const params = useParams<{ serverId: string }>();
  const serverId = params.serverId as Id<"servers">;
  const router = useRouter();

  const dashboard = useQuery(api.servers.getServerDashboard, { serverId });
  const updateName = useMutation(api.servers.updateServerName);
  const deleteServer = useMutation(api.servers.deleteServer);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (dashboard === undefined) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const currentName = name || dashboard.name;

  async function handleRename() {
    setError(null);
    setSaving(true);
    try {
      await updateName({ serverId, name: currentName });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not rename.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteServer({ serverId });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete server.");
    }
  }

  return (
    <div className="space-y-8 max-w-md">
      <h1 className="text-xl font-semibold text-ink">Settings</h1>

      <div className="rounded-lg border border-line p-4 space-y-3">
        <label className="text-sm space-y-1 block">
          <span className="text-muted">Server name</span>
          <input
            type="text"
            defaultValue={dashboard.name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 bg-paper text-ink"
          />
        </label>
        <button
          onClick={handleRename}
          disabled={saving}
          className="rounded-md bg-accent text-accent-ink px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save name"}
        </button>
      </div>

      <div className="rounded-lg border border-red-500/40 p-4 space-y-3">
        <p className="text-sm font-medium text-red-500">Danger zone</p>
        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="text-sm text-red-500 hover:underline"
          >
            Delete this server
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted">
              This permanently deletes every chat, message, invite, and log. There is no undo.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                className="rounded-md border border-line px-3 py-1.5 text-sm text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md bg-red-500 text-white px-3 py-1.5 text-sm"
              >
                Yes, delete permanently
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
