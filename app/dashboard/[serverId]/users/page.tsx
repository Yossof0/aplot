"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { ChatList } from "@/components/dashboard/ChatList";
import type { Id } from "@/convex/_generated/dataModel";

export default function UsersPage() {
  const params = useParams<{ serverId: string }>();
  const serverId = params.serverId as Id<"servers">;
  const dashboard = useQuery(api.servers.getServerDashboard, { serverId });

  if (dashboard === undefined) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">User Management</h1>
      <p className="text-sm text-muted-foreground">
        Click into a chat to manage its invites and members.
      </p>
      <ChatList serverId={serverId} chats={dashboard.chats} chatCapacity={dashboard.chatCapacity} />
    </div>
  );
}
