import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { InviteForm } from "@/components/dashboard/InviteForm";
import { MemberList } from "@/components/dashboard/MemberList";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

export default async function ChatDashboardPage({
  params,
}: {
  params: Promise<{ serverId: string; chatId: string }>;
}) {
  const { serverId, chatId } = await params;
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");

  const token = await getToken({ template: "convex" });
  if (!token) redirect("/sign-in");

  // Cheapest ownership check available: re-use getServerDashboard and
  // confirm this chatId actually belongs to the server in the URL.
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

  const chat = dashboard.chats.find((c) => c._id === chatId);
  if (!chat) redirect(`/dashboard/${serverId}`);

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/dashboard/${serverId}`} className="text-xs text-muted-foreground hover:underline">
          ← {dashboard.name}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{chat.name}</h1>
      </div>

      <Link
        href={`/chat/${chatId}`}
        className="inline-block rounded-md border px-4 py-2 text-sm hover:bg-muted"
      >
        Open message stream →
      </Link>

      <InviteForm chatId={chatId as Id<"chats">} />
      <MemberList chatId={chatId as Id<"chats">} />
      <ActivityLog serverId={serverId as Id<"servers">} />
    </div>
  );
}
