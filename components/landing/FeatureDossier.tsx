"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    tag: "LEASES",
    title: "Book by the day, not forever",
    body: "3 days to 6 months. Storage from 3MB to 250MB depending on plan. When the clock hits zero, the server tears itself down — no residue left to find.",
  },
  {
    tag: "INVITES",
    title: "One credential, one use",
    body: "You set a username and password for each person. The moment they log in, that credential is burned — permanently. It can never be used again, by anyone.",
  },
  {
    tag: "VISIBILITY",
    title: "Max Privacy by default",
    body: "No member list. No profiles. No way to see who else is in the room. Everyone sees the admin's feed and nothing else.",
  },
  {
    tag: "ROOMS",
    title: "Multiple chats per server",
    body: "One booked server can hold several separate chat rooms — up to 3 on Basic, 10 on Pro. Each room has its own invites and its own members.",
  },
  {
    tag: "OVERSIGHT",
    title: "Full admin visibility, always",
    body: "As the admin, you see everything: every message, every member, every invite state. Max Privacy hides members from each other — never from you.",
  },
  {
    tag: "AUDIT",
    title: "A running activity log",
    body: "Every invite created, every claim, every removal, every message sent — timestamped and visible on your dashboard for as long as the lease runs.",
  },
];

export function FeatureDossier() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
      {FEATURES.map((feature, i) => (
        <motion.div
          key={feature.tag}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
          whileHover={{ y: -3 }}
          className="rounded-lg border border-line p-5 space-y-3 text-left bg-paper transition-colors hover:border-ink/30"
        >
          <p className="text-xs tracking-widest font-mono text-accent">{feature.tag}</p>
          <p className="font-medium text-ink">{feature.title}</p>
          <p className="text-sm leading-relaxed text-muted">{feature.body}</p>
        </motion.div>
      ))}
    </div>
  );
}
