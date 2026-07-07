"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Book",
    body: "Pick a plan, a lease duration, and a storage cap. Your admin dashboard is ready the moment you confirm.",
  },
  {
    number: "02",
    title: "Create rooms",
    body: "Add chats inside that server, up to your plan's capacity. Each one is a fully separate conversation.",
  },
  {
    number: "03",
    title: "Invite",
    body: "Set a username and password per person, per chat. Send them the link however you'd send anything else.",
  },
  {
    number: "04",
    title: "They connect once",
    body: "The invite works exactly one time. The moment it's claimed, the credential is destroyed — no reuse, no sharing.",
  },
  {
    number: "05",
    title: "It expires",
    body: "When the lease runs out, the server and everything in it tears down automatically. Nothing left to find later.",
  },
];

export function HowItWorks() {
  return (
    <div className="w-full max-w-3xl space-y-8">
      <p className="text-xs tracking-widest font-mono text-accent text-center">
        BASIC SETUP TUTORIAL
      </p>
      <div className="space-y-6">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
            className="flex gap-5 items-start text-left"
          >
            <span className="font-serif text-2xl font-semibold shrink-0 w-10 text-accent">
              {step.number}
            </span>
            <div>
              <p className="font-medium text-ink">{step.title}</p>
              <p className="text-sm leading-relaxed mt-1 text-muted">{step.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
