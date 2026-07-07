"use client";

import { useRouter } from "next/navigation";

export function ServerBookingPrompt() {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-line p-8 text-center space-y-4 bg-paper">
      <p className="font-serif text-xl font-semibold text-ink">
        You don&apos;t have a server yet
      </p>
      <p className="text-sm text-muted max-w-sm mx-auto">
        Book one to get an admin dashboard, invites, and a private chat room for your team.
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => router.push("/")}
          className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink/40 transition-colors"
        >
          Maybe later
        </button>
        <button
          onClick={() => router.push("/booking")}
          className="rounded-md bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Book a server
        </button>
      </div>
    </div>
  );
}
