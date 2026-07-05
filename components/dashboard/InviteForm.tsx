"use client";

import { useState } from "react";
import { createInviteAction } from "@/app/actions/inviteActions";
import type { Id } from "@/convex/_generated/dataModel";

export function InviteForm({ chatId }: { chatId: Id<"chats"> }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInviteUrl(null);
    setIsSubmitting(true);

    try {
      const result = await createInviteAction(chatId, username, password);
      if (!result.success) {
        setError(result.error);
        return;
      }
      const url = `${window.location.origin}/claim/${result.data.inviteToken}`;
      setInviteUrl(url);
      setUsername("");
      setPassword("");
    } catch {
      setError("Something went wrong creating the invite.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <p className="text-sm font-medium">Add a member</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create invite"}
        </button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {inviteUrl && (
        <div className="rounded-md bg-muted p-3 text-sm break-all">
          <p className="font-medium mb-1">Send this link + the credentials you set:</p>
          {inviteUrl}
        </div>
      )}
    </div>
  );
}
