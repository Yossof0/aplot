import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { StorageMeter } from "@/components/dashboard/StorageMeter";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import type { Id } from "@/convex/_generated/dataModel";

export default async function DashboardOverviewPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");
  const token = await getToken();
  if (!token) redirect("/sign-in");

  const dashboard = await fetchQuery(
    api.servers.getServerDashboard,
    { serverId: serverId as Id<"servers"> },
    { token },
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{dashboard.name}</h1>
        <p className="text-sm text-muted-foreground capitalize">
          {dashboard.status} · {dashboard.planTier} plan
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StorageMeter usedBytes={dashboard.storageUsedBytes} capBytes={dashboard.storageCapBytes} />
        <CountdownTimer msRemaining={dashboard.msRemaining} />
      </div>

      <div className="rounded-lg border border-line p-4 text-sm text-muted">
        {dashboard.chatsUsed} of {dashboard.chatCapacity} chat slots used. Manage chats and invites under
        {" "}<strong>User Management</strong> in the sidebar.
      </div>
    </div>
  );
}
