"use client";

import { motion } from "framer-motion";

const REASONS = [
  { title: "No dark patterns", body: "No engagement metrics, no read receipts, no typing indicators to game. Nothing to optimize for except getting your team talking and getting the room to disappear cleanly." },
  { title: "Nothing to subpoena", body: "Once a lease's grace period ends, the data doesn't exist anymore — not soft-deleted, not archived. Gone from the database." },
  { title: "Built for temporary, not permanent", body: "This isn't Slack with an expiry bolted on. Every part of it — invites, storage caps, lease lengths — is designed around the assumption that the room won't last forever." },
];

export function WhyTrustUs() {
  return (
    <div className="w-full max-w-3xl space-y-8">
      <p className="text-xs tracking-widest font-mono text-accent text-center">
        WHY TEAMS TRUST US
      </p>
      <div className="space-y-6">
        {REASONS.map((reason, i) => (
          <motion.div
            key={reason.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
            className="border-l-2 border-accent pl-4 text-left"
          >
            <p className="font-medium text-ink">{reason.title}</p>
            <p className="text-sm leading-relaxed mt-1 text-muted">{reason.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
