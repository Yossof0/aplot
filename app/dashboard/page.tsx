import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { ServerList } from "@/components/dashboard/ServerList";

export default async function DashboardIndexPage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");

  const token = await getToken();
  if (!token) redirect("/sign-in");

  const servers = await fetchQuery(
    api.servers.listServersForOwner,
    {},
    { token },
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your servers</h1>
        <p className="text-sm text-muted-foreground">
          Every server you&apos;ve booked, active or expired.
        </p>
      </div>
      <ServerList servers={servers} />
    </div>
  );
}
