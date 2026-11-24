"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveSection } from "./InvitationShell";
import { copy } from "@/config/copy";

/**
 * Smart Navigation & Auto-Scroll Button:
 * - When tapped, smoothly and calmly glides down through the invitation automatically.
 * - Tapping while gliding or touching/scrolling manually pauses auto-scroll.
 * - When at the bottom, tapping returns smoothly to the top.
 */
export function SectionNav() {
  const { index, count } = useActiveSection();
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const autoScrollRef = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Check if scrolled near the bottom of the page
  useEffect(() => {
    const handleScrollCheck = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const atBottom = window.scrollY >= Math.max(10, maxScroll - 40);
      setIsAtBottom(atBottom);
      if (atBottom && autoScrollRef.current) {
        stopAutoScroll();
      }
    };

    window.addEventListener("scroll", handleScrollCheck, { passive: true });
    handleScrollCheck();
    return () => window.removeEventListener("scroll", handleScrollCheck);
  }, []);

  const stopAutoScroll = () => {
    if (!autoScrollRef.current) return;
    autoScrollRef.current = false;
    setIsAutoScrolling(false);
    document.documentElement.style.scrollSnapType = "";
  };

  const startAutoScroll = () => {
    if (autoScrollRef.current) return;
    autoScrollRef.current = true;
    setIsAutoScrolling(true);
    // Disable scroll-snap during continuous glide so it flows without friction
    document.documentElement.style.scrollSnapType = "none";

    let lastTime = performance.now();
    // 78 pixels per second: calm, relaxing, luxurious pace
    const speed = 78;

    const step = (now: number) => {
      if (!autoScrollRef.current) return;
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (currentScroll >= maxScroll - 3) {
        stopAutoScroll();
        setIsAtBottom(true);
        return;
      }

      const nextScroll = currentScroll + speed * delta;
      window.scrollTo(0, nextScroll);
      requestAnimationFrame(step);
    };

    requestAnimationFrame((now) => {
      lastTime = now;
      requestAnimationFrame(step);
    });
  };

  // User manual intervention pauses auto-scroll so they retain full natural control
  useEffect(() => {
    const onUserInterrupt = (e: Event) => {
      if (!autoScrollRef.current) return;
      if (btnRef.current?.contains(e.target as Node)) return;
      stopAutoScroll();
    };

    const events = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    events.forEach((ev) => window.addEventListener(ev, onUserInterrupt, { passive: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, onUserInterrupt));
  }, []);

  const handleClick = () => {
    if (isAutoScrolling) {
      stopAutoScroll();
      return;
    }

    if (isAtBottom) {
      stopAutoScroll();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    startAutoScroll();
  };

  const isLast = isAtBottom || (count > 0 && index >= count - 1);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      aria-label={
        isAutoScrolling
          ? "إيقاف التمرير التلقائي"
          : isLast
          ? copy.ui.prev
          : "بدء التمرير التلقائي بهدوء للأسفل"
      }
      className={`focus-gold fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-50 grid h-14 w-14 place-items-center rounded-full border shadow-[0_10px_24px_-14px_rgb(99_34_56/0.35)] backdrop-blur-md transition-all active:scale-95 ${
        isAutoScrolling
          ? "border-[var(--gold)] bg-ivory text-gold ring-2 ring-[rgb(179_89_120/0.4)]"
          : "border-[var(--card-border)] bg-[rgb(255_248_250/0.8)] text-gold"
      }`}
    >
      <AnimatePresence mode="wait">
        {isAutoScrolling ? (
          <motion.div
            key="pause"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="flex items-center gap-1"
            title="إيقاف التمرير"
          >
            <span className="h-4 w-1 rounded-full bg-gold" />
            <span className="h-4 w-1 rounded-full bg-gold" />
          </motion.div>
        ) : (
          <motion.svg
            key="arrow"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            animate={{
              rotate: isLast ? 180 : 0,
              y: isLast ? 0 : [0, 3, 0],
            }}
            transition={{
              rotate: { duration: 0.4 },
              y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
            }}
            aria-hidden
          >
            <path
              d="M12 4v15M6 13l6 6 6-6"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}
