import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex items-center">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
