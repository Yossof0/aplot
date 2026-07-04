import {
  Globe,
  Mail,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Max Privacy Engine",
    description:
      "Members never see one another’s names, profiles, or contact details, creating a truly isolated communication space.",
    icon: ShieldCheck,
  },
  {
    title: "Flexible Booking Windows",
    description:
      "Lease a private server for 3 days, 7 days, 2 weeks, 3 weeks, or 1 month depending on the mission.",
    icon: TimerReset,
  },
  {
    title: "Single-Use Access Keys",
    description:
      "Admin-issued credentials burn after first successful use to eliminate credential sharing and sprawl.",
    icon: Users,
  },
  {
    title: "Live Admin Dashboard",
    description:
      "Monitor storage, lease time, activity logs, and revoke access instantly from a single control panel.",
    icon: Sparkles,
  },
];

const stats = [
  { value: "100%", label: "Anonymous member access" },
  { value: "1-time", label: "Burn-on-claim credentials" },
  { value: "5 tiers", label: "Booking windows from 3 days to 1 month" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_28%),linear-gradient(135deg,_#07111f,_#02070e)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="sticky top-4 z-20 flex items-center justify-between rounded-full border border-white/10 bg-slate-950/65 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur">
          <a
            href="#"
            className="flex items-center gap-3 text-lg font-semibold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 font-bold text-slate-950">
              ▲
            </span>
            <span>aPlot</span>
          </a>
          <nav className="flex items-center gap-4 text-sm text-slate-400 sm:gap-5">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#privacy" className="transition hover:text-white">
              Privacy
            </a>
            <a
              href="#contact"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition hover:bg-white/10 hover:text-white"
            >
              Contact
            </a>
          </nav>
        </header>

        <section className="grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Private messaging for temporary, high-trust teams
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[0.94] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
              Run secure, anonymous group conversations without exposing your
              people.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400/90">
              aPlot gives businesses a private communication surface for events,
              projects, and response teams with a strict Max Privacy engine that
              keeps every member isolated and invisible to one another.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-gradient-to-r from-cyan-400 to-sky-200 px-5 text-slate-950 hover:opacity-90"
              >
                <a href="#contact">Book a private server</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:border-cyan-400/30"
              >
                <a href="#features">Explore features</a>
              </Button>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-slate-400">
              <li>• Zero lateral visibility between members</li>
              <li>• One-time invite credentials that self-burn</li>
              <li>• Lease a private server for 3 days to 1 month</li>
            </ul>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/80 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Live server
                </span>
                <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
                  24h left
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                <span>Access: secured</span>
                <span>Visibility: private</span>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">
                Private Broadcast Channel
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                Admin-led messaging with isolated member access and no profile
                discovery.
              </p>
              <div className="mt-5 space-y-3">
                <div className="max-w-[85%] rounded-2xl bg-cyan-500/15 p-3 text-sm text-slate-200">
                  We’re sharing the latest update now.
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl bg-white/10 p-3 text-sm text-slate-200">
                  Understood. I only see the admin stream.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="privacy"
          className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:grid-cols-3 sm:p-6"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-slate-950/40 p-5"
            >
              <div className="text-2xl font-semibold text-white">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </section>

        <section id="features" className="py-16">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Why teams choose aPlot
            </p>
            <h2 className="text-3xl font-semibold leading-[1.03] tracking-[-0.025em] text-white sm:text-4xl">
              Built for privacy-sensitive communication that still feels fast
              and simple.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-950/70"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Built for modern operations
            </p>
            <h2 className="text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-white sm:text-4xl">
              From live events to internal response teams, aPlot keeps
              communication controlled and private.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400/90">
              Whether you run a short-term initiative, a temporary crisis
              channel, or a closed expert network, aPlot makes it easy to stand
              up a private server without exposing your team members to each
              other.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              "Event operations",
              "Crisis communication",
              "Private project boards",
              "Confidential partner networks",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm font-medium text-slate-200 shadow-sm shadow-black/10"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="py-16 text-center">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/8 to-cyan-500/8 px-8 py-12 shadow-2xl shadow-cyan-950/20">
            <h2 className="text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-white sm:text-4xl">
              Bring privacy-first messaging to your next launch.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-400/90">
              Launch a controlled, temporary, and anonymous communication
              channel in minutes.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 px-6 text-slate-950 shadow-lg shadow-cyan-950/20 hover:opacity-95"
            >
              <a href="mailto:hello@aplot.app">Request early access</a>
            </Button>
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-sm text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Yossof0. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://yossof0.github.io"
              target="_blank"
              rel="noreferrer"
              title="Website"
            >
              <Globe className="h-5 w-5 transition-colors hover:text-white" />
            </a>
            <a
              href="https://www.facebook.com/YossofABD"
              target="_blank"
              rel="noreferrer"
              title="Facebook"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current transition-colors hover:text-white"
              >
                <path d="M13.5 20v-8h2.7l.4-3h-3.1V3.5c0-.9.2-1.5 1.5-1.5h1.6V.1C16.3.1 15.3 0 14 0c-2.4 0-4 1.5-4 4.2V9H7.2v3h2.8v8h3.5Z" />
              </svg>
            </a>
            <a
              href="https://x.com/OverClock33"
              target="_blank"
              rel="noreferrer"
              title="X (Twitter)"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current transition-colors hover:text-white"
              >
                <path d="M18.9 2H22l-6.8 7.8L23.3 22h-6.2l-4.8-6.3L6.8 22H3.6l7.3-8.4L.7 2h6.4l4.3 5.7L18.9 2Zm-1.1 18h1.2L6.2 4H4.9l13 16Z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@overclock33"
              target="_blank"
              rel="noreferrer"
              title="YouTube"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current transition-colors hover:text-white"
              >
                <path d="M23.5 6.2a3.1 3.1 0 0 0-2.2-2.2C19.6 3.3 12 3.3 12 3.3s-7.6 0-9.3.7A3.1 3.1 0 0 0 .5 6.2C0 7.9 0 12 0 12s0 4.1.5 5.8a3.1 3.1 0 0 0 2.2 2.2c1.7.7 9.3.7 9.3.7s7.6 0 9.3-.7a3.1 3.1 0 0 0 2.2-2.2c.5-1.7.5-5.8.5-5.8s0-4.1-.5-5.8ZM9.6 15.5V8.5l6.2 3.5-6.2 3.5Z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/yossof-abdelwahed-20b2b1408"
              target="_blank"
              rel="noreferrer"
              title="LinkedIn"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current transition-colors hover:text-white"
              >
                <path d="M6.94 8.5A1.56 1.56 0 1 0 6.94 5.38a1.56 1.56 0 0 0 0 3.12ZM5.5 9.69h2.88V19H5.5V9.69Zm4.63 0h2.76v1.28h.04c.38-.72 1.32-1.48 2.72-1.48 2.91 0 3.45 1.92 3.45 4.41V19h-2.88v-8.48c0-2.02-.03-4.63-2.82-4.63-2.83 0-3.26 2.2-3.26 4.47V19H10.13V9.69Z" />
              </svg>
            </a>
            <a
              href="https://github.com/Yossof0"
              target="_blank"
              rel="noreferrer"
              title="GitHub"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current transition-colors hover:text-white"
              >
                <path d="M12 .3a12 12 0 0 0-3.8 23.1c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.4-1.3-5.4-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.4.1-3 0 0 1-.3 3.2 1.2a11.1 11.1 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.7.1 3 .8.8 1.2 1.8 1.2 3.1 0 4.5-2.8 5.5-5.4 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
              </svg>
            </a>
            <a href="mailto:yossef2989@gmail.com" title="Email">
              <Mail className="h-5 w-5 transition-colors hover:text-white" />
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
