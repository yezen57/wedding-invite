import { wedding, weddingInstant } from "@/config/wedding";
import { copy } from "@/config/copy";

export const dynamic = "force-static";

const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

export function GET() {
  const start = weddingInstant(wedding.guestsArrival);
  const end = weddingInstant(wedding.eventEnd);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zaid & Arwa//Wedding//AR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:wedding-${fmt(start)}@zaid-arwa`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(copy.calendar.icsTitle)}`,
    `LOCATION:${esc(`${wedding.venue.nameAr} - ${wedding.venue.nameEn}`)}`,
    `DESCRIPTION:${esc(`${copy.calendar.note}\n${wedding.venue.mapUrl}`)}`,
    `URL:${wedding.venue.mapUrl}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT3H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(copy.calendar.icsTitle)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="zaid-arwa-wedding.ics"',
    },
  });
}
