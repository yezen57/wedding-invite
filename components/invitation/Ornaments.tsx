"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { useActiveSection, type OrnamentMode } from "./InvitationShell";

type Kind = "corner" | "side" | "top" | "divider";

const DIMS: Record<Kind, { w: number; h: number }> = {
  corner: { w: 1200, h: 1209 },
  side: { w: 313, h: 4096 },
  top: { w: 1600, h: 568 },
  divider: { w: 1400, h: 100 },
};

/* ───────── Simple gold SVG fallbacks (used only if an image file is missing) ───────── */
function FallbackSvg({ kind, className, style }: { kind: Kind; className?: string; style?: React.CSSProperties }) {
  const stroke = { stroke: "var(--gold)", fill: "none", strokeWidth: 1.4, strokeLinecap: "round" as const };
  const leaf = { fill: "var(--gold)", opacity: 0.55 };
  if (kind === "divider")
    return (
      <svg viewBox="0 0 280 20" className={className} style={style} aria-hidden>
        <path d="M10 10 H118 M162 10 H270" {...stroke} />
        <path d="M120 10 q10 -9 20 0 q10 9 20 0" {...stroke} />
        <circle cx="140" cy="10" r="3" fill="var(--gold)" />
      </svg>
    );
  if (kind === "top")
    return (
      <svg viewBox="0 0 300 100" className={className} style={style} aria-hidden>
        <path d="M150 0 C150 40 110 50 70 40 C40 32 25 15 10 5 M150 0 C150 40 190 50 230 40 C260 32 275 15 290 5" {...stroke} />
        <ellipse cx="150" cy="48" rx="7" ry="11" {...leaf} />
        <ellipse cx="95" cy="44" rx="5" ry="9" transform="rotate(-50 95 44)" {...leaf} />
        <ellipse cx="205" cy="44" rx="5" ry="9" transform="rotate(50 205 44)" {...leaf} />
      </svg>
    );
  if (kind === "side")
    return (
      <svg viewBox="0 0 40 400" preserveAspectRatio="none" className={className} style={style} aria-hidden>
        <path d="M14 0 C30 40 0 80 14 120 C30 160 0 200 14 240 C30 280 0 320 14 360 C24 380 14 400 14 400" {...stroke} />
        {[40, 120, 200, 280, 360].map((y) => (
          <ellipse key={y} cx="24" cy={y} rx="4" ry="8" transform={`rotate(35 24 ${y})`} {...leaf} />
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden>
      <path d="M195 20 C190 110 140 170 20 195" {...stroke} />
      <path d="M190 80 C160 120 130 150 80 170" {...stroke} />
      <circle cx="150" cy="150" r="16" {...leaf} />
      <circle cx="120" cy="170" r="10" {...leaf} />
      <ellipse cx="185" cy="60" rx="6" ry="12" {...leaf} />
    </svg>
  );
}

/* ───────── Single ornament image with multiply blending + SVG fallback ───────── */
export function OrnamentImage({
  kind,
  className = "",
  style,
  priority,
  sizes,
}: {
  kind: Kind;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <FallbackSvg kind={kind} className={`ornament ${className}`} style={style} />;
  return (
    <Image
      src={`/ornaments/${kind}.webp`}
      alt=""
      aria-hidden
      width={DIMS[kind].w}
      height={DIMS[kind].h}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      sizes={sizes}
      draggable={false}
      onError={() => setFailed(true)}
      className={`ornament ${className}`}
      style={style}
    />
  );
}

/* ───────── Fixed frame: side strips + bottom corners. Reacts to the active section. ───────── */
const MODES: Record<OrnamentMode, { corner: number; cornerOpacity: number; side: number }> = {
  full: { corner: 1, cornerOpacity: 1, side: 0.9 },
  soft: { corner: 0.78, cornerOpacity: 0.7, side: 0.65 },
  minimal: { corner: 0.6, cornerOpacity: 0.4, side: 0.45 },
};

export function FixedOrnaments() {
  const { mode } = useActiveSection();
  const m = MODES[mode];
  const ease = [0.22, 1, 0.36, 1] as const;

  /*
   * IMPORTANT: every wrapper that has opacity/transform forms an isolated group, so the
   * multiply blend is placed on the OUTERMOST element of each ornament (BLEND), and each
   * ornament is its own fixed layer (so a corner's white never masks a side strip).
   */
  return (
    <>
      {/* side strips – partly tucked off-screen on phones */}
      <motion.div
        aria-hidden
        style={BLEND}
        className="pointer-events-none fixed inset-y-0 left-0 -translate-x-[40%] sm:translate-x-0 sm:left-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: m.side }}
        transition={{ duration: 1.6, ease }}
      >
        <OrnamentImage kind="side" sizes="80px" className="h-[100svh] w-auto max-sm:opacity-60" priority />
      </motion.div>
      <motion.div
        aria-hidden
        style={BLEND}
        className="pointer-events-none fixed inset-y-0 right-0 translate-x-[40%] sm:translate-x-0 sm:right-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: m.side }}
        transition={{ duration: 1.6, ease }}
      >
        <OrnamentImage kind="side" sizes="80px" className="h-[100svh] w-auto -scale-x-100 max-sm:opacity-60" priority />
      </motion.div>

      {/* bottom corners */}
      <motion.div
        aria-hidden
        style={{ ...BLEND, transformOrigin: "100% 100%" }}
        className="pointer-events-none fixed bottom-0 right-0"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: m.cornerOpacity, scale: m.corner }}
        transition={{ duration: 1.4, ease, delay: 0.3 }}
      >
        <OrnamentImage kind="corner" sizes="(max-width: 640px) 150px, 300px" className="block w-[36vw] max-w-[300px] min-w-[120px] h-auto max-sm:opacity-70" />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ ...BLEND, transformOrigin: "0% 100%" }}
        className="pointer-events-none fixed bottom-0 left-0"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: m.cornerOpacity, scale: m.corner }}
        transition={{ duration: 1.4, ease, delay: 0.3 }}
      >
        <OrnamentImage kind="corner" sizes="(max-width: 640px) 150px, 300px" className="block w-[36vw] max-w-[300px] min-w-[120px] h-auto -scale-x-100 max-sm:opacity-70" />
      </motion.div>
    </>
  );
}

const BLEND: React.CSSProperties = { mixBlendMode: "multiply" };

export function TopOrnament() {
  return (
    <motion.div
      aria-hidden
      style={BLEND}
      className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <OrnamentImage kind="top" priority sizes="(max-width: 640px) 90vw, 620px" className="w-[88vw] max-w-[620px] h-auto" />
    </motion.div>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return (
    <motion.div
      aria-hidden
      style={BLEND}
      className={`pointer-events-none flex justify-center ${className}`}
      initial={{ opacity: 0, scaleX: 0.6 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <OrnamentImage kind="divider" sizes="360px" className="w-[68vw] max-w-[340px] h-auto" />
    </motion.div>
  );
}
