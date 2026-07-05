"use client";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { sessionCookieName } from "@/lib/sessionCookie";
import type { Id } from "@/convex/_generated/dataModel";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;

  const { userId } = await auth();

  const cookieStore = cookies();
  const cookie = cookieStore.get(sessionCookieName(chatId));
  const sessionToken = cookie?.value;

  // Require either an authenticated admin or a member session token.
  if (!userId && !sessionToken) redirect("/sign-in");

  const role = userId ? "admin" : "member";

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col">
        <div className="flex-1 flex flex-col border rounded-md p-4">
          <MessageList
            chatId={chatId as Id<"chats">}
            role={role}
            sessionToken={sessionToken}
          />
          <MessageInput
            chatId={chatId as Id<"chats">}
            role={role}
            sessionToken={sessionToken}
          />
        </div>
      </main>
    </div>
  );
}
