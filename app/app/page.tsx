"use client";

import {
  Bell,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  LayoutGrid,
  Lock,
  MessageSquareText,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Users2,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type AppView = "overview" | "channels" | "members" | "security" | "settings";

const sidebarItems: Array<{
  label: string;
  icon: typeof LayoutGrid;
  view: AppView;
}> = [
  { label: "Overview", icon: LayoutGrid, view: "overview" },
  { label: "Channels", icon: MessageSquareText, view: "channels" },
  { label: "Members", icon: Users2, view: "members" },
  { label: "Access Keys", icon: KeyRound, view: "overview" },
  { label: "Security", icon: ShieldCheck, view: "security" },
  { label: "Settings", icon: Settings, view: "settings" },
];

const activityFeed = [
  {
    title: "Admin revoked a stale invitation",
    meta: "2 minutes ago · Access key burned",
  },
  {
    title: "New private server created for the launch team",
    meta: "18 minutes ago · 7 day lease",
  },
  {
    title: "Member visibility remains isolated",
    meta: "1 hour ago · Max Privacy active",
  },
];

const accessKeys = [
  { id: "AK-104", status: "Active", expires: "12h left" },
  { id: "AK-103", status: "Used", expires: "Consumed" },
  { id: "AK-102", status: "Pending", expires: "24h left" },
];

const members = [
  { name: "Mina", role: "Ops lead", status: "Online", access: "Admin" },
  { name: "Jules", role: "Event manager", status: "Synced", access: "Ops" },
  {
    name: "Ari",
    role: "Security reviewer",
    status: "Reviewing",
    access: "Viewer",
  },
];

const auditLogs = [
  { action: "Key rotated", user: "Mina", time: "12m ago", impact: "High" },
  {
    action: "Lease extended",
    user: "Jules",
    time: "33m ago",
    impact: "Medium",
  },
  { action: "Access revoked", user: "Ari", time: "1h ago", impact: "Low" },
];

const queueItems = [
  { label: "Review new access request", time: "3 min ago" },
  { label: "Approve temporary lease extension", time: "12 min ago" },
  { label: "Archive resolved launch thread", time: "41 min ago" },
];

const initialThreadMessages = [
  { author: "Mina", body: "Launch updates are ready to go live.", time: "Now" },
  {
    author: "Admin",
    body: "Share the access key only with the ops crew.",
    time: "2m",
  },
  {
    author: "Ari",
    body: "Privacy checks are confirmed. No exposure paths remain.",
    time: "5m",
  },
];

const onboardingSteps = [
  { title: "Create a private server", done: true },
  { title: "Invite the launch team", done: true },
  { title: "Set lease window and retention", done: false },
  { title: "Review access credentials", done: false },
];

const settingsItems = [
  { label: "Anonymous mode", value: "Enabled" },
  { label: "Invite approvals", value: "Required" },
  { label: "Retention", value: "30 days" },
];

const viewMeta: Record<
  AppView,
  { eyebrow: string; title: string; description: string }
> = {
  overview: {
    eyebrow: "Operations center",
    title: "Launch Ops · Private Broadcast",
    description: "Secure live workspace for launch coordination.",
  },
  channels: {
    eyebrow: "Channel workspace",
    title: "Threaded collaboration rooms",
    description: "Dedicated private rooms for launch, ops, and review.",
  },
  members: {
    eyebrow: "Member management",
    title: "Trusted team roster",
    description: "See who is active, pending, and synced.",
  },
  security: {
    eyebrow: "Security posture",
    title: "Audit-ready access controls",
    description: "Visibility into permissions, leases, and revocations.",
  },
  settings: {
    eyebrow: "Workspace settings",
    title: "Fine-tuned delivery controls",
    description: "Keep retention, approvals, and privacy aligned.",
  },
};

export default function ProductApp() {
  const [threadMessages, setThreadMessages] = useState(initialThreadMessages);
  const [messageDraft, setMessageDraft] = useState("We’re ready to go live.");
  const [messageSent, setMessageSent] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAccess, setInviteAccess] = useState("Ops");
  const [inviteCode, setInviteCode] = useState("AK-105 · pending approval");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardName, setWizardName] = useState("Launch Ops");
  const [wizardLease, setWizardLease] = useState("7 days");
  const [wizardPrivacy, setWizardPrivacy] = useState("Strict");
  const [activeView, setActiveView] = useState<AppView>("overview");
  const [workspaceReady, setWorkspaceReady] = useState(true);
  const [settingsState, setSettingsState] = useState({
    anonymousMode: true,
    inviteApprovals: true,
    retention: "30 days",
  });

  const handleSendMessage = () => {
    const trimmed = messageDraft.trim();
    if (!trimmed) return;

    setThreadMessages((prev) => [
      ...prev,
      { author: "You", body: trimmed, time: "Just now" },
    ]);
    setMessageDraft("");
    setMessageSent(true);
    window.setTimeout(() => setMessageSent(false), 1600);
  };

  const handleCreateInvite = () => {
    const cleanedEmail = inviteEmail.trim() || "ops@launch.example";
    setInviteCode(`AK-106 · ${cleanedEmail} · ${inviteAccess}`);
    setInviteEmail("");
    setInviteAccess("Ops");
  };

  const toggleSetting = (key: "anonymousMode" | "inviteApprovals") => {
    setSettingsState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeViewMeta = viewMeta[activeView];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_24%),linear-gradient(135deg,_#07111f,_#02070e)] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <aside className="w-full rounded-[28px] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/20 backdrop-blur lg:w-72">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 font-semibold text-slate-950">
              ▲
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                aPlot Workspace
              </div>
              <div className="text-xs text-slate-400">Private operations</div>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveView(item.view)}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-200"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              );
            })}
          </nav>

          <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
              <Lock className="h-4 w-4" />
              Max Privacy enabled
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Every member is isolated and cannot discover one another.
            </p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-slate-950/70 p-4 shadow-xl shadow-black/20 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
                Live workspace
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white">
                {activeViewMeta.title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => setWizardOpen(true)}
                className="rounded-full bg-gradient-to-r from-cyan-400 to-sky-200 text-slate-950 hover:opacity-90"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                New server
              </Button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white">
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </header>

          {!workspaceReady && (
            <section className="mt-6 rounded-[28px] border border-dashed border-cyan-400/30 bg-cyan-500/10 p-5 shadow-xl shadow-black/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
                    First workspace
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    You have not created a workspace yet.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Start with a private server to unlock channels, members, and
                    security controls.
                  </p>
                </div>
                <Button
                  onClick={() => setWizardOpen(true)}
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-sky-200 text-slate-950 hover:opacity-90"
                >
                  Create your first server
                </Button>
              </div>
            </section>
          )}

          <section className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
                    Operations center
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    Secure channel is active and healthy
                  </h2>
                </div>
                <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-300">
                  Online
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm text-slate-400">Active channels</div>
                  <div className="mt-1 text-2xl font-semibold text-white">
                    4
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm text-slate-400">Pending access</div>
                  <div className="mt-1 text-2xl font-semibold text-white">
                    3
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm text-slate-400">Lease window</div>
                  <div className="mt-1 text-2xl font-semibold text-white">
                    7d
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
                  <Sparkles className="h-4 w-4" />
                  Admin channel preview
                </div>
                <div className="mt-4 space-y-3">
                  <div className="max-w-[85%] rounded-2xl bg-cyan-500/15 p-3 text-sm text-slate-200">
                    We’re sharing the latest update now.
                  </div>
                  <div className="ml-auto max-w-[85%] rounded-2xl bg-white/10 p-3 text-sm text-slate-200">
                    Understood. I only see the admin stream.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Access keys
                </h3>
                <span className="text-sm text-slate-400">3 total</span>
              </div>
              <div className="mt-4 space-y-3">
                {accessKeys.map((key) => (
                  <div
                    key={key.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{key.id}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {key.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      {key.expires}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                <div className="flex items-center gap-2 font-semibold">
                  <Zap className="h-4 w-4" />
                  One-click revoke available
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
                  {activeViewMeta.eyebrow}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {activeViewMeta.description}
                </h3>
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
                Live product view
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {activeView === "overview" && (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">Playback ready</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      12 messages queued
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">
                      Revocation speed
                    </div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      &lt; 30 sec
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">
                      Retention policy
                    </div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      30 day vault
                    </div>
                  </div>
                </>
              )}

              {activeView === "channels" && (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">Launch room</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      3 live threads
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">Ops room</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      2 private sub-channels
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">Review room</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      Auto-archive enabled
                    </div>
                  </div>
                </>
              )}

              {activeView === "members" && (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">Active roster</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      8 trusted members
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">
                      Pending invites
                    </div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      2 approvals pending
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">Role sync</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      Auto-synced
                    </div>
                  </div>
                </>
              )}

              {activeView === "security" && (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">Device trust</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      100% verified
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">Audit logs</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      24 events today
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">Key rotation</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      Next in 4 days
                    </div>
                  </div>
                </>
              )}

              {activeView === "settings" && (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">
                      Privacy defaults
                    </div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      Strict by default
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">Approval flow</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      Human review
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm text-slate-400">Export window</div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      7 days
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {activeView === "security"
                    ? "Security audit"
                    : "Activity feed"}
                </h3>
                <span className="text-sm text-slate-400">
                  {activeView === "security" ? "Audit trail" : "Real-time"}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {activeView === "security"
                  ? auditLogs.map((item) => (
                      <div
                        key={item.action}
                        className="rounded-2xl border border-white/10 bg-white/5 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-white">
                            {item.action}
                          </div>
                          <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-200">
                            {item.impact}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          {item.user} · {item.time}
                        </div>
                      </div>
                    ))
                  : activityFeed.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-white/10 bg-white/5 p-3"
                      >
                        <div className="font-medium text-white">
                          {item.title}
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          {item.meta}
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {activeView === "members" ? "Members directory" : "Members"}
                </h3>
                <span className="text-sm text-slate-400">3 active</span>
              </div>
              {activeView === "members" ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
                  <div className="grid grid-cols-[1.2fr_0.8fr_0.6fr] bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <span>Member</span>
                    <span>Role</span>
                    <span>Status</span>
                  </div>
                  {members.map((member) => (
                    <div
                      key={member.name}
                      className="grid grid-cols-[1.2fr_0.8fr_0.6fr] items-center border-t border-white/10 px-3 py-3 text-sm"
                    >
                      <div>
                        <div className="font-medium text-white">
                          {member.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {member.access} access
                        </div>
                      </div>
                      <div className="text-slate-300">{member.role}</div>
                      <div className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-center text-xs font-medium text-emerald-300">
                        {member.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3"
                    >
                      <div>
                        <div className="font-medium text-white">
                          {member.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {member.role}
                        </div>
                      </div>
                      <div className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                        {member.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-cyan-500/5 p-3">
                <div className="text-sm font-semibold text-white">
                  Pending queue
                </div>
                <div className="mt-3 space-y-2">
                  {queueItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
                    >
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-slate-400">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
                    Channel thread
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    Launch coordination
                  </h3>
                </div>
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
                  Live
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {threadMessages.map((message) => (
                  <div
                    key={message.body}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-white">
                        {message.author}
                      </span>
                      <span className="text-slate-400">{message.time}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {message.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                <textarea
                  rows={3}
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  placeholder="Write a private update..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-400">
                    {messageSent
                      ? "Message sent to the channel"
                      : "Visible only to the active server"}
                  </span>
                  <Button
                    onClick={handleSendMessage}
                    className="rounded-full bg-gradient-to-r from-cyan-400 to-sky-200 text-slate-950 hover:opacity-90"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Invite members
                  </h3>
                  <span className="text-sm text-slate-400">1 click</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                    Share a one-time key with your launch crew.
                  </div>
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                    {inviteCode}
                  </div>
                  <Button
                    onClick={() => setInviteModalOpen(true)}
                    className="w-full rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create invite
                  </Button>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {activeView === "settings"
                      ? "Workspace controls"
                      : "Server settings"}
                  </h3>
                  <Settings className="h-4 w-4 text-slate-400" />
                </div>
                {activeView === "settings" ? (
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300">
                      <span>Anonymous mode</span>
                      <button
                        type="button"
                        onClick={() => toggleSetting("anonymousMode")}
                        className={`relative h-6 w-11 rounded-full transition ${settingsState.anonymousMode ? "bg-cyan-400/80" : "bg-white/10"}`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${settingsState.anonymousMode ? "left-5" : "left-0.5"}`}
                        />
                      </button>
                    </label>
                    <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300">
                      <span>Invite approvals</span>
                      <button
                        type="button"
                        onClick={() => toggleSetting("inviteApprovals")}
                        className={`relative h-6 w-11 rounded-full transition ${settingsState.inviteApprovals ? "bg-cyan-400/80" : "bg-white/10"}`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${settingsState.inviteApprovals ? "left-5" : "left-0.5"}`}
                        />
                      </button>
                    </label>
                    <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-300">
                      <span>Retention</span>
                      <select
                        value={settingsState.retention}
                        onChange={(event) =>
                          setSettingsState((prev) => ({
                            ...prev,
                            retention: event.target.value,
                          }))
                        }
                        className="rounded-full border border-white/10 bg-slate-950/70 px-2 py-1 text-sm text-slate-200 outline-none"
                      >
                        <option value="7 days">7 days</option>
                        <option value="30 days">30 days</option>
                        <option value="90 days">90 days</option>
                      </select>
                    </label>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {settingsItems.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
                      >
                        <span className="text-slate-300">{item.label}</span>
                        <span className="text-slate-400">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Plan & billing
                  </h3>
                  <span className="text-sm text-slate-400">Team Secure</span>
                </div>
                <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                  $49/month · 3 active servers
                </div>
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                  Includes 2,000 private messages and one-click key revocation.
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-sm">
                  <span className="text-slate-300">
                    Usage: 1,240 / 2,000 msgs
                  </span>
                  <Button className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10">
                    Upgrade
                  </Button>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Onboarding
                  </h3>
                  <span className="text-sm text-slate-400">4 steps</span>
                </div>
                <div className="mt-4 space-y-2">
                  {onboardingSteps.map((step) => (
                    <div
                      key={step.title}
                      className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
                    >
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          step.done ? "text-emerald-300" : "text-slate-500"
                        }`}
                      />
                      <span
                        className={step.done ? "text-white" : "text-slate-400"}
                      >
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-950/95 p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
                  Invite member
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  Share a private access key
                </h3>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="member@example.com"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none"
              />
              <select
                value={inviteAccess}
                onChange={(event) => setInviteAccess(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none"
              >
                <option value="Ops">Ops access</option>
                <option value="Admin">Admin access</option>
                <option value="Viewer">Viewer access</option>
              </select>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                {inviteCode}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setInviteModalOpen(false)}
                className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvite}
                className="rounded-full bg-gradient-to-r from-cyan-400 to-sky-200 text-slate-950 hover:opacity-90"
              >
                Generate invite
              </Button>
            </div>
          </div>
        </div>
      )}

      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-slate-950/95 p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
                  Create server
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  {wizardStep === 0 && "Name your private server"}
                  {wizardStep === 1 && "Choose the lease window"}
                  {wizardStep === 2 && "Set the privacy level"}
                </h3>
              </div>
              <button
                onClick={() => setWizardOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300"
              >
                Cancel
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {wizardStep === 0 && (
                <input
                  value={wizardName}
                  onChange={(event) => setWizardName(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none"
                  placeholder="e.g. Launch Ops"
                />
              )}

              {wizardStep === 1 && (
                <select
                  value={wizardLease}
                  onChange={(event) => setWizardLease(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none"
                >
                  <option value="3 days">3 days</option>
                  <option value="7 days">7 days</option>
                  <option value="14 days">14 days</option>
                  <option value="30 days">30 days</option>
                </select>
              )}

              {wizardStep === 2 && (
                <select
                  value={wizardPrivacy}
                  onChange={(event) => setWizardPrivacy(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none"
                >
                  <option value="Strict">Strict</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Open">Open</option>
                </select>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                {wizardStep === 0 &&
                  "Pick a clear internal label for your server."}
                {wizardStep === 1 &&
                  "Choose how long the channel should stay active."}
                {wizardStep === 2 &&
                  "Control how visible members are to one another."}
              </div>
            </div>

            <div className="mt-5 flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setWizardStep((prev) => Math.max(prev - 1, 0))}
                className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Back
              </Button>
              {wizardStep < 2 ? (
                <Button
                  onClick={() => setWizardStep((prev) => prev + 1)}
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-sky-200 text-slate-950 hover:opacity-90"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setWizardOpen(false);
                    setWizardStep(0);
                    setWorkspaceReady(true);
                    setActiveView("overview");
                  }}
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-sky-200 text-slate-950 hover:opacity-90"
                >
                  Create server
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
