"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface MessageListProps {
  serverId: Id<"servers">;
  role: "admin" | "member";
  sessionToken?: string;
}

export function MessageList({ serverId, role, sessionToken }: MessageListProps) {
  // Hooks can't be called conditionally, so both queries are declared and
  // one is always skipped via Convex's "skip" pattern based on role.
  const adminMessages = useQuery(
    api.messages.listMessagesForAdmin,
    role === "admin" ? { serverId } : "skip",
  );
  const memberMessages = useQuery(
    api.messages.listMessagesForMember,
    role === "member" && sessionToken ? { serverId, sessionToken } : "skip",
  );

  const messages = role === "admin" ? adminMessages : memberMessages;

  if (messages === undefined) {
    return <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Loading messages...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3 py-2">
      {messages.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">No messages yet.</p>
      )}
      {messages.map((m) => (
        <div
          key={m._id}
          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
            m.senderRole === "admin"
              ? "bg-primary text-primary-foreground"
              : "bg-muted ml-auto"
          }`}
        >
          {m.body}
        </div>
      ))}
    </div>
  );
}
