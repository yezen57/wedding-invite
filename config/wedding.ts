/**
 * All wedding data lives here. Edit this file only to change event details.
 */
export const wedding = {
  groom: "زيد",
  bride: "أروى",

  venue: {
    nameAr: "توباز",
    nameEn: "TOPAZ",
    mapUrl: "https://maps.app.goo.gl/6n1Tdg6iuNzvapNc8",
    /** Optional Google Maps *embed* URL (Share → Embed a map → src). Leave empty to hide the map. */
    mapEmbedUrl: "" as string,
    image: "/venue.webp",
    video: "/venue.mp4",
  },

  /** Wedding date (local, at the venue). */
  date: { year: 2026, month: 12, day: 1 },
  /** Venue timezone offset from UTC, in hours (e.g. 3 for UTC+3). */
  utcOffsetHours: 3,

  /** Times in 24h "HH:mm" local to the venue. */
  guestsArrival: "18:00",
  ceremonyStart: "19:00", // countdown target
  eventEnd: "23:30",

  schedule: [
    { time: "18:00", label: "استقبال الضيوف" },
    { time: "19:00", label: "بداية الحفل" },
    { time: "20:30", label: "دخول العروس" },
    { time: "21:00", label: "العشاء" },
    { time: "21:30", label: "الرقص والفعاليات" },
    { time: "23:30", label: "انتهاء الزفاف" },
  ],

  music: {
    src: "/music.mp3",
    /** Start playback from this second. */
    musicStartSeconds: 0,
  },

  features: {
    /** Phase 2: store RSVP replies in the database. When false the form shows a thank-you only. */
    rsvpEnabled: false,
  },
} as const;

export type Wedding = typeof wedding;

const pad = (n: number) => String(n).padStart(2, "0");

/** Returns a real Date (UTC instant) for a local venue time on the wedding day. */
export function weddingInstant(hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const { year, month, day } = wedding.date;
  const sign = wedding.utcOffsetHours >= 0 ? "+" : "-";
  const off = Math.abs(wedding.utcOffsetHours);
  const offH = Math.floor(off);
  const offM = Math.round((off - offH) * 60);
  return new Date(`${year}-${pad(month)}-${pad(day)}T${pad(h)}:${pad(m)}:00${sign}${pad(offH)}:${pad(offM)}`);
}

/** "18:00" → "6:00 م" */
export function formatTimeAr(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "م" : "ص";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${suffix}`;
}

export const dateDots = () => {
  const { year, month, day } = wedding.date;
  return `${pad(day)}.${pad(month)}.${year}`;
};
