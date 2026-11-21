"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { wedding, weddingInstant, formatTimeAr, dateDots } from "@/config/wedding";
import { copy } from "@/config/copy";
import { Divider, TopOrnament } from "./Ornaments";
import { Reveal, SectionTitle } from "./Reveal";
import { VenueMedia } from "./VenueMedia";

const ease = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────── 1. Cover ───────────────────────── */
export function Cover({ guestName, partySize }: { guestName?: string | null; partySize?: number }) {
  return (
    <section data-snap data-ornament="full" className="snap-section">
      <TopOrnament />
      <div className="mt-16 flex flex-col items-center text-center">
        <motion.p
          className="font-display text-lg text-taupe"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          {copy.cover.bismillah}
        </motion.p>

        {guestName && (
          <motion.p
            className="mt-6 text-base text-bronze"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease }}
          >
            {copy.pass.greeting} <span className="font-bold">{guestName}</span>
            {partySize ? <span className="block text-sm text-taupe mt-1">({copy.pass.partySize(partySize)})</span> : null}
          </motion.p>
        )}

        <motion.p
          className="mt-6 max-w-[19rem] text-[1.02rem] leading-8 text-taupe"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease }}
        >
          {copy.cover.intro}
        </motion.p>

        <motion.h1
          className="mt-8 font-display leading-none"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 1, ease }}
        >
          <span className="gold-text block text-[4.6rem] sm:text-[6rem] pb-2">{wedding.groom}</span>
          <span className="block font-serif text-4xl text-gold my-1">{copy.cover.and}</span>
          <span className="gold-text block text-[4.6rem] sm:text-[6rem] pb-2">{wedding.bride}</span>
        </motion.h1>

        <motion.div
          className="mt-8 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.5 }}
        >
          <span className="h-px w-16 bg-linear-to-l from-transparent via-[var(--gold)] to-transparent" />
          <p className="text-xl font-medium tracking-wide text-bronze">{copy.cover.dateLine}</p>
          <p className="font-serif text-lg tracking-[0.35em] text-gold">{dateDots()}</p>
          <span className="h-px w-16 bg-linear-to-l from-transparent via-[var(--gold)] to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────── 2. Calendar ───────────────────────── */
function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0 = Sunday
  const startIdx = (first + 1) % 7; // week starts on Saturday
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = Array(startIdx).fill(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function CalendarSection() {
  const { year, month, day } = wedding.date;
  const cells = monthGrid(year, month);
  return (
    <section data-snap data-ornament="soft" className="snap-section">
      <Divider className="mb-8" />
      <Reveal className="text-center">
        <p className="text-sm text-taupe">{copy.calendar.timeLabel}</p>
        <p className="mt-1 font-display text-4xl text-gold">{formatTimeAr(wedding.ceremonyStart)}</p>
      </Reveal>

      <Reveal delay={0.15} className="paper-card mt-7 w-full max-w-[22rem] px-5 pb-6 pt-5">
        <h2 className="text-center font-display text-3xl text-bronze">{copy.calendar.monthTitle}</h2>
        <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
          {copy.calendar.weekdays.map((w) => (
            <span key={w} className="pb-2 text-[0.68rem] font-medium text-taupe">
              {w}
            </span>
          ))}
          {cells.map((d, i) => (
            <span key={i} className="grid aspect-square place-items-center">
              {d === day ? (
                <span className="relative grid h-9 w-9 place-items-center">
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full border border-[var(--gold)]"
                    animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                  />
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--sand),var(--gold)_60%,var(--bronze))] text-sm font-bold text-ivory shadow-[0_6px_14px_-6px_rgb(142_107_59/0.7)]">
                    {d}
                  </span>
                </span>
              ) : (
                <span className={`text-sm ${d ? "text-bronze/80" : ""}`}>{d ?? ""}</span>
              )}
            </span>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.25} className="mt-7 flex flex-col items-center gap-5">
        <p className="font-display text-2xl text-bronze">{copy.calendar.note}</p>
        <a href="/calendar.ics" className="paper-btn" download>
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
            <path d="M3.5 9.5h17M8 3v4M16 3v4M12 12.5v5M9.5 15h5" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {copy.calendar.addToCalendar}
        </a>
      </Reveal>
    </section>
  );
}

/* ───────────────────────── 3. Countdown ───────────────────────── */
function diff(target: number, now: number) {
  const s = Math.max(0, Math.floor((target - now) / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, done: s === 0 };
}

export function Countdown() {
  const target = weddingInstant(wedding.ceremonyStart).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const t = now === null ? null : diff(target, now);
  const items = [
    { v: t?.d, l: copy.countdown.days },
    { v: t?.h, l: copy.countdown.hours },
    { v: t?.m, l: copy.countdown.minutes },
    { v: t?.s, l: copy.countdown.seconds },
  ];

  return (
    <section data-snap data-ornament="minimal" className="snap-section">
      <Divider className="mb-8" />
      <SectionTitle>{copy.countdown.title}</SectionTitle>
      <Reveal delay={0.15} className="mt-9 grid w-full max-w-[24rem] grid-cols-4 gap-2.5 sm:gap-4" role="timer" aria-live="off">
        {items.map((it) => (
          <div key={it.l} className="paper-card flex aspect-[3/4] flex-col items-center justify-center [--r:1rem]">
            <span className="gold-text font-serif text-[2.1rem] font-semibold leading-none tabular-nums sm:text-5xl">
              {it.v === undefined ? "--" : String(it.v).padStart(2, "0")}
            </span>
            <span className="mt-2 text-xs text-taupe">{it.l}</span>
          </div>
        ))}
      </Reveal>
      <Reveal delay={0.3}>
        <p className="mt-9 font-display text-2xl text-bronze">{t?.done ? copy.countdown.done : copy.countdown.subtitle}</p>
      </Reveal>
    </section>
  );
}

/* ───────────────────────── 4. Venue ───────────────────────── */
export function Venue() {
  return (
    <section data-snap data-ornament="soft" className="snap-section">
      <Divider className="mb-5" />
      <SectionTitle>{copy.venue.title}</SectionTitle>

      <Reveal delay={0.1} className="paper-card mt-5 w-full max-w-[17.5rem] sm:max-w-[20rem] p-2">
        <VenueMedia />
      </Reveal>

      <Reveal delay={0.2} className="mt-4 text-center">
        <p className="text-xs text-taupe">{copy.venue.subtitle}</p>
        <p className="font-display text-4xl sm:text-5xl text-bronze">{wedding.venue.nameAr}</p>
        <p className="mt-0.5 font-serif text-xl sm:text-2xl font-medium tracking-[0.5em] text-gold" dir="ltr">
          {wedding.venue.nameEn}
        </p>
      </Reveal>

      <Reveal delay={0.3} className="mt-4">
        <a href={wedding.venue.mapUrl} target="_blank" rel="noopener noreferrer" className="paper-btn text-sm py-2.5 px-5">
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
            <circle cx="12" cy="10" r="2.3" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
          </svg>
          {copy.venue.openMap}
        </a>
      </Reveal>

      {wedding.venue.mapEmbedUrl && (
        <Reveal delay={0.35} className="paper-card mt-5 w-full max-w-[20rem] p-2">
          <iframe
            src={wedding.venue.mapEmbedUrl}
            title={copy.venue.title}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block aspect-[4/3] w-full rounded-[1.35rem] border-0 sepia-[.25]"
          />
        </Reveal>
      )}
    </section>
  );
}

/* ───────────────────────── 5. Schedule ───────────────────────── */
export function Schedule() {
  return (
    <section data-snap data-ornament="minimal" className="snap-section">
      <Divider className="mb-8" />
      <SectionTitle sub={copy.schedule.subtitle}>{copy.schedule.title}</SectionTitle>

      <ol className="relative mt-9 w-full max-w-[20rem]">
        <span aria-hidden className="absolute inset-y-3 right-1/2 w-px translate-x-1/2 bg-linear-to-b from-transparent via-[var(--sand)] to-transparent" />
        {wedding.schedule.map((s, i) => (
          <motion.li key={s.time} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8, delay: i * 0.08, ease }} className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3.5">
            <span className="text-right font-serif text-xl font-semibold text-gold tabular-nums order-3">
              {s.time.split(":").map(Number).map((n, k) => (k === 0 ? (n % 12 || 12) : String(n).padStart(2, "0"))).join(":")}
              <span className="ms-1 font-body text-xs text-taupe">{formatTimeAr(s.time).endsWith("م") ? "م" : "ص"}</span>
            </span>
            <span className="order-2 grid h-3.5 w-3.5 place-items-center rounded-full border border-[var(--gold)] bg-paper">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            </span>
            <span className="order-1 text-left text-[1.02rem] text-bronze">{s.label}</span>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

/* ───────────────────────── 8. Closing ───────────────────────── */
export function Closing() {
  return (
    <section data-snap data-ornament="full" className="snap-section">
      <Divider className="mb-8" />
      <SectionTitle>{copy.closing.title}</SectionTitle>
      <Reveal delay={0.15}>
        <p className="mt-5 max-w-[20rem] text-center text-[1.05rem] leading-9 text-taupe">{copy.closing.text}</p>
      </Reveal>
      <Reveal delay={0.3} className="mt-10 text-center">
        <p className="font-display text-5xl leading-snug">
          <span className="gold-text">{wedding.groom}</span>
          <span className="mx-3 font-serif text-3xl text-gold">&</span>
          <span className="gold-text">{wedding.bride}</span>
        </p>
        <p className="mt-3 font-serif text-xl tracking-[0.35em] text-gold" dir="ltr">
          {dateDots()}
        </p>
      </Reveal>
    </section>
  );
}
