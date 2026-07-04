"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface MessageInputProps {
  serverId: Id<"servers">;
  role: "admin" | "member";
  sessionToken?: string;
}

export function MessageInput({ serverId, role, sessionToken }: MessageInputProps) {
  const sendMessage = useMutation(api.messages.sendMessage);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    setIsSending(true);

    try {
      // Admin identity is verified server-side via ctx.auth (Clerk token
      // attached automatically by ConvexProviderWithClerk) — sessionToken
      // is only meaningful, and only sent, for the member path.
      await sendMessage(
        role === "member" && sessionToken
          ? { serverId, body, sessionToken }
          : { serverId, body },
      );
      setBody("");
    } catch {
      setError("Message failed to send.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t">
      <input
        type="text"
        placeholder="Type a message..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="flex-1 rounded-md border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={isSending || !body.trim()}
        className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        Send
      </button>
      {error && <p className="text-xs text-destructive absolute">{error}</p>}
    </form>
  );
}
