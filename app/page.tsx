import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { RedactedHeadline } from "@/components/landing/RedactedHeadline";
import { FlagshipFeatures } from "@/components/landing/FlagshipFeatures";
import { FeatureDossier } from "@/components/landing/FeatureDossier";
import { WhyTrustUs } from "@/components/landing/WhyTrustUs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { BundlePlansSection } from "@/components/landing/BundlePlansSection";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default async function HomePage() {
  const { userId, getToken } = await auth();

  let hasServer = false;
  if (userId) {
    try {
      const token = await getToken();
      if (token) {
        const servers = await fetchQuery(api.servers.listServersForOwner, {}, { token });
        hasServer = servers.length > 0;
      }
    } catch {
      // If the check fails, fall back to showing "Get started" rather than erroring the page.
      hasServer = false;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <div className="flex justify-end px-4 py-4">
        <ThemeToggle />
      </div>

      <main className="flex-1 flex flex-col items-center px-4 pb-24 gap-24">
        <div className="flex flex-col items-center gap-6 max-w-2xl text-center">
          <p className="text-xs tracking-[0.2em] font-mono text-accent">
            TIME-BOXED · ZERO LATERAL VISIBILITY
          </p>

          <RedactedHeadline />

          <p className="max-w-md leading-relaxed text-muted">
            SerVault books a private server for your team, on the clock. Invites
            burn the moment they&apos;re claimed. When the lease ends, the
            room disappears — no history to find, nothing left to subpoena.
          </p>

          <div className="flex items-center gap-3 pt-2">
            {!userId && (
              <SignInButton mode="modal">
                <button className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink/40 transition-colors">
                  Sign in
                </button>
              </SignInButton>
            )}

            <a
              href="#pricing"
              className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink hover:border-ink/40 transition-colors"
            >
              Plans &amp; Pricing
            </a>

            {userId ? (
              <Link
                href={hasServer ? "/dashboard" : "/booking"}
                className="rounded-md bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {hasServer ? "Dashboard" : "Book a server"}
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="rounded-md bg-accent text-accent-ink px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
                  Get started
                </button>
              </SignUpButton>
            )}
          </div>
        </div>

        <FlagshipFeatures />

        <div className="w-full max-w-4xl space-y-6 text-center">
          <p className="text-xs tracking-widest font-mono text-accent">WHAT YOU GET</p>
          <FeatureDossier />
        </div>

        <WhyTrustUs />

        <HowItWorks />

        <BundlePlansSection isSignedIn={Boolean(userId)} />

        <div className="flex flex-col items-center gap-4 text-center pt-8">
          <p className="font-serif text-2xl font-semibold text-ink">
            Ready to join?
          </p>
          {userId ? (
            <Link
              href={hasServer ? "/dashboard" : "/booking"}
              className="rounded-md bg-accent text-accent-ink px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {hasServer ? "Go to dashboard" : "Book your first server"}
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="rounded-md bg-accent text-accent-ink px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
                Get started
              </button>
            </SignUpButton>
          )}
        </div>
      </main>

      <div className="border-t border-line">
        <div className="max-w-4xl mx-auto px-4">
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
