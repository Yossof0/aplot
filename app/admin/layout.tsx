import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/");

  const token = await getToken();
  if (!token) redirect("/");

  const isAdmin = await fetchQuery(api.admin.isCurrentUserAdmin, {}, { token });
  if (!isAdmin) redirect("/");

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
