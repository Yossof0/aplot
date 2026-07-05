import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { StorageMeter } from "@/components/dashboard/StorageMeter";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { InviteForm } from "@/components/dashboard/InviteForm";
import { MemberList } from "@/components/dashboard/MemberList";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import type { Id } from "@/convex/_generated/dataModel";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");

  const token = await getToken({ template: "convex" });
  if (!token) redirect("/sign-in");

  let dashboard;
  try {
    dashboard = await fetchQuery(
      api.servers.getServerDashboard,
      { serverId: serverId as Id<"servers"> },
      { token },
    );
  } catch {
    redirect("/dashboard"); // not found or not owned by this user
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{dashboard.name}</h1>
        <p className="text-sm text-muted-foreground capitalize">{dashboard.status}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StorageMeter
          usedBytes={dashboard.storageUsedBytes}
          capBytes={dashboard.storageCapBytes}
        />
        <CountdownTimer msRemaining={dashboard.msRemaining} />
      </div>

      <InviteForm serverId={serverId as Id<"servers">} />
      <MemberList serverId={serverId as Id<"servers">} />
      <ActivityLog serverId={serverId as Id<"servers">} />
    </div>
  );
}
