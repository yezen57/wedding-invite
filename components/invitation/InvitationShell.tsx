"use client";

import { MotionConfig } from "framer-motion";
import { createContext, useContext, useEffect, useState } from "react";
import { FixedOrnaments } from "./Ornaments";
import { MusicPlayer } from "./MusicPlayer";
import { SectionNav } from "./SectionNav";

export type OrnamentMode = "full" | "soft" | "minimal";

type Ctx = { index: number; count: number; mode: OrnamentMode };
const ActiveCtx = createContext<Ctx>({ index: 0, count: 0, mode: "full" });
export const useActiveSection = () => useContext(ActiveCtx);

/** Tracks which [data-snap] section is in view; hosts the fixed frame, player and nav. */
export function InvitationShell({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Ctx>({ index: 0, count: 0, mode: "full" });

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-snap]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          setState({
            index: sections.indexOf(el),
            count: sections.length,
            mode: (el.dataset.ornament as OrnamentMode) || "soft",
          });
        }
      },
      // a section is "active" when it crosses the middle of the screen
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    setState((s) => ({ ...s, count: sections.length }));
    return () => io.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ActiveCtx.Provider value={state}>
        <FixedOrnaments />
        <main className="relative">{children}</main>
        <MusicPlayer />
        <SectionNav />
      </ActiveCtx.Provider>
    </MotionConfig>
  );
}
