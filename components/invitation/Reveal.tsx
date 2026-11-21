"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/** Soft fade + small slide when entering the viewport. */
export function Reveal({ delay = 0, y = 14, children, ...rest }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Section heading in the decorative Arabic face. */
export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <Reveal className="text-center">
      <h2 className="font-display text-[2.4rem] leading-tight text-bronze sm:text-5xl">{children}</h2>
      {sub && <p className="mt-2 text-[0.95rem] text-taupe">{sub}</p>}
    </Reveal>
  );
}
