"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function RedactedHeadline() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="font-serif text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05] text-ink"
    >
      Everyone in the room.
      <br />
      Nobody{" "}
      <span className="relative inline-block align-baseline">
        <span
          className={`transition-opacity duration-300 ${revealed ? "opacity-100" : "opacity-0"}`}
        >
          who they are.
        </span>
        <span
          aria-hidden="true"
          className={`absolute inset-0 bg-ink rounded-sm transition-transform duration-500 ease-out origin-left ${
            revealed ? "scale-x-0" : "scale-x-100"
          }`}
        />
      </span>
    </motion.h1>
  );
}
