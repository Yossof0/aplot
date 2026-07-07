import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ServerSidebar } from "@/components/dashboard/ServerSidebar";
import { RenewalScreen } from "@/components/dashboard/RenewalScreen";
import type { Id } from "@/convex/_generated/dataModel";

export default async function ServerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");

  const token = await getToken();
  if (!token) redirect("/sign-in");

  let dashboard;
  try {
    dashboard = await fetchQuery(
      api.servers.getServerDashboard,
      { serverId: serverId as Id<"servers"> },
      { token },
    );
  } catch {
    redirect("/dashboard");
  }

  if (dashboard.status === "grace") {
    return (
      <RenewalScreen
        serverId={serverId as Id<"servers">}
        planTier={dashboard.planTier}
        graceMsRemaining={dashboard.graceMsRemaining ?? 0}
      />
    );
  }

  return (
    <div className="flex gap-6 -mx-4">
      <ServerSidebar serverId={serverId as Id<"servers">} />
      <div className="flex-1 px-4">{children}</div>
    </div>
  );
}
