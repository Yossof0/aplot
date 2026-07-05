"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";

interface ChatListProps {
  serverId: Id<"servers">;
  chats: { _id: Id<"chats">; name: string; createdAt: number }[];
  chatCapacity: number;
}

export function ChatList({ serverId, chats, chatCapacity }: ChatListProps) {
  const router = useRouter();
  const createChat = useMutation(api.chats.createChat);
  const deleteChat = useMutation(api.chats.deleteChat);
  const [newChatName, setNewChatName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const atCapacity = chats.length >= chatCapacity;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newChatName.trim()) return;
    setError(null);
    setIsCreating(true);
    try {
      await createChat({ serverId, name: newChatName });
      setNewChatName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create chat.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(chatId: Id<"chats">) {
    try {
      await deleteChat({ chatId });
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Chats</p>
        <p className="text-xs text-muted-foreground">
          {chats.length} / {chatCapacity} used
        </p>
      </div>

      <ul className="space-y-2">
        {chats.map((chat) => (
          <li key={chat._id} className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
            <button
              onClick={() => router.push(`/dashboard/${serverId}/${chat._id}`)}
              className="text-left hover:underline flex-1"
            >
              {chat.name}
            </button>
            <button
              onClick={() => handleDelete(chat._id)}
              className="text-xs text-destructive hover:underline ml-3"
            >
              Delete
            </button>
          </li>
        ))}
        {chats.length === 0 && (
          <p className="text-sm text-muted-foreground">No chats yet.</p>
        )}
      </ul>

      {atCapacity ? (
        <p className="text-xs text-muted-foreground">
          You&apos;ve used all {chatCapacity} chat slots on this server.
        </p>
      ) : (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            placeholder="New chat name"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {isCreating ? "Adding..." : "Add chat"}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
