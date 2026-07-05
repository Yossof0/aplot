import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
