"use client";

import { motion } from "framer-motion";

const FLAGSHIP = [
  {
    title: "Burn-on-claim invites",
    body: "Every invite is single-use by construction, not by policy. The moment it's claimed, the credential is deleted from the database — there's nothing left to leak, share, or reuse.",
  },
  {
    title: "Automatic teardown",
    body: "No admin has to remember to delete anything. When a lease expires, a background sweep revokes access, then wipes every message, credential, and log after the grace window.",
  },
  {
    title: "Zero lateral visibility",
    body: "Members can't list, search, or infer who else is in a room. Every query that touches member data is scoped and stripped server-side — this isn't a UI setting, it's enforced at the data layer.",
  },
];

export function FlagshipFeatures() {
  return (
    <div className="w-full max-w-4xl space-y-10">
      <p className="text-xs tracking-widest font-mono text-accent text-center">
        FLAGSHIP FEATURES
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {FLAGSHIP.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
            className="space-y-3 text-left"
          >
            <p className="font-serif text-xl font-semibold text-ink">{item.title}</p>
            <p className="text-sm leading-relaxed text-muted">{item.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
