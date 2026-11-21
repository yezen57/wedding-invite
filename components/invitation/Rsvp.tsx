"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { wedding } from "@/config/wedding";
import { copy } from "@/config/copy";
import { Divider } from "./Ornaments";
import { Reveal, SectionTitle } from "./Reveal";

export function Rsvp({ defaultName = "", token }: { defaultName?: string; token?: string }) {
  const [name, setName] = useState(defaultName);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError(copy.rsvp.errorName);
    if (attending === null) return setError(copy.rsvp.errorChoice);
    setStatus("sending");
    try {
      if (wedding.features.rsvpEnabled) {
        const res = await fetch("/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), attending, message: message.trim(), token }),
        });
        if (!res.ok) throw new Error();
      }
      setStatus("done");
    } catch {
      setStatus("idle");
      setError(copy.rsvp.errorGeneric);
    }
  };

  const choice = (value: boolean, label: string) => {
    const selected = attending === value;
    return (
      <button
        type="button"
        onClick={() => setAttending(value)}
        aria-pressed={selected}
        className={`focus-gold w-full rounded-2xl border px-4 py-4 text-[1.02rem] transition-all duration-300 ${
          selected
            ? "border-[var(--gold)] bg-ivory font-bold text-gold shadow-[0_8px_20px_-14px_rgb(142_107_59/0.6)] ring-1 ring-[var(--gold)]"
            : "border-[var(--card-border)] bg-[rgb(255_252_247/0.6)] text-taupe"
        }`}
      >
        {label}
      </button>
    );
  };

  const field =
    "focus-gold w-full rounded-2xl border border-[var(--card-border)] bg-[rgb(255_252_247/0.75)] px-4 py-3 text-bronze placeholder:text-sand outline-none transition focus:border-[var(--gold)]";

  return (
    <section data-snap data-ornament="minimal" className="snap-section">
      <Divider className="mb-8" />
      <SectionTitle sub={copy.rsvp.subtitle}>{copy.rsvp.title}</SectionTitle>

      <Reveal delay={0.15} className="paper-card mt-7 w-full max-w-[24rem] bg-cream/80 p-6">
        <AnimatePresence mode="wait">
          {status === "done" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center"
            >
              <svg viewBox="0 0 48 48" className="mx-auto h-12 w-12" aria-hidden>
                <circle cx="24" cy="24" r="22" fill="none" stroke="var(--gold)" strokeWidth="1.3" />
                <path d="M15 24.5l6 6 12-13" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-4 font-display text-2xl leading-relaxed text-bronze">{attending ? copy.rsvp.thanksYes : copy.rsvp.thanksNo}</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} exit={{ opacity: 0 }} className="flex flex-col gap-4" noValidate>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-taupe">{copy.rsvp.nameLabel}</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={copy.rsvp.namePlaceholder} maxLength={80} className={field} autoComplete="name" />
              </label>
              <div className="grid grid-cols-1 gap-3">
                {choice(true, copy.rsvp.yes)}
                {choice(false, copy.rsvp.no)}
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-taupe">{copy.rsvp.messageLabel}</span>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={copy.rsvp.messagePlaceholder} rows={3} maxLength={500} className={`${field} resize-none`} />
              </label>
              {error && <p className="text-center text-sm text-bronze" role="alert">{error}</p>}
              <button type="submit" disabled={status === "sending"} className="paper-btn mt-1 w-full py-3.5 text-lg disabled:opacity-60">
                {status === "sending" ? copy.rsvp.sending : copy.rsvp.submit}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </Reveal>
    </section>
  );
}
