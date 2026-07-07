"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

const SECTIONS = [
  { slug: "", label: "Overview" },
  { slug: "settings", label: "Settings" },
  { slug: "security", label: "Security" },
  { slug: "plan-usage", label: "Plan & Usage" },
  { slug: "users", label: "User Management" },
  { slug: "logs", label: "Activity Logs" },
];

export function ServerSidebar({ serverId }: { serverId: Id<"servers"> }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const base = `/dashboard/${serverId}`;

  return (
    <aside
      className={`shrink-0 border-r border-line transition-all ${collapsed ? "w-14" : "w-48"}`}
    >
      <div className="flex justify-end p-2">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-muted hover:text-ink"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {SECTIONS.map((section) => {
          const href = section.slug ? `${base}/${section.slug}` : base;
          const isActive = pathname === href;
          return (
            <Link
              key={section.slug}
              href={href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                isActive ? "bg-accent/10 text-accent font-medium" : "text-muted hover:text-ink"
              }`}
            >
              {collapsed ? section.label.charAt(0) : section.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
