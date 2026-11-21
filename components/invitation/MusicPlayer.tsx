"use client";

import { useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import { copy } from "@/config/copy";

/**
 * Vinyl record player. Never autoplays on load: playback starts on the user's
 * first interaction with the page (tap/click/key), from `musicStartSeconds`.
 */
export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const started = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const play = async () => {
    const a = audioRef.current;
    if (!a) return false;
    try {
      if (!started.current) a.currentTime = wedding.music.musicStartSeconds;
      await a.play();
      started.current = true;
      return true;
    } catch {
      return false;
    }
  };

  // first user gesture anywhere on the page starts the music (once)
  useEffect(() => {
    const events = ["pointerup", "touchend", "keydown"] as const;
    const onFirst = async (e: Event) => {
      if (started.current) return cleanup();
      if (btnRef.current?.contains(e.target as Node)) return; // the button handles itself
      if (await play()) cleanup();
    };
    const cleanup = () => events.forEach((ev) => window.removeEventListener(ev, onFirst));
    events.forEach((ev) => window.addEventListener(ev, onFirst, { passive: true }));
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) await play();
    else a.pause();
  };

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50">
      <audio
        ref={audioRef}
        src={wedding.music.src}
        preload="metadata"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setUnavailable(true)}
      />
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        disabled={unavailable}
        aria-label={playing ? copy.ui.pause : copy.ui.play}
        aria-pressed={playing}
        className="focus-gold relative grid h-14 w-14 place-items-center rounded-full shadow-[0_10px_24px_-10px_rgb(142_107_59/0.6)] disabled:opacity-40"
      >
        {/* record */}
        <span data-playing={playing} className="vinyl absolute inset-0 rounded-full ring-1 ring-[rgb(177_138_78/0.5)]" />
        {/* gold label + icon */}
        <span className="relative grid h-6 w-6 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--sand),var(--gold)_55%,var(--bronze))] ring-1 ring-[rgb(255_248_238/0.5)]">
          {playing ? (
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
              <rect x="2.5" y="2" width="2.4" height="8" rx=".6" fill="var(--ivory)" />
              <rect x="7.1" y="2" width="2.4" height="8" rx=".6" fill="var(--ivory)" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 translate-x-[0.5px]" aria-hidden>
              <path d="M3.5 2.2v7.6L10 6z" fill="var(--ivory)" />
            </svg>
          )}
        </span>
        {/* tonearm hint when playing */}
        <span
          aria-hidden
          className={`absolute -top-1 -left-1 h-3 w-3 rounded-full border border-[var(--gold)] bg-[var(--ivory)] transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
        />
      </button>
    </div>
  );
}
