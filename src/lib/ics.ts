import type { CalendarEvent } from "@/types/event";

function formatICSDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function escapeICS(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}@ea-calendar`;
}

export function generateICS(events: CalendarEvent[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//EA Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:EA Calendar",
  ];

  for (const e of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${e.id || uid()}`);
    lines.push(`DTSTART:${formatICSDate(e.start_date)}`);
    if (e.end_date) {
      lines.push(`DTEND:${formatICSDate(e.end_date)}`);
    } else {
      const end = new Date(e.start_date);
      end.setHours(end.getHours() + 1);
      lines.push(`DTEND:${formatICSDate(end.toISOString())}`);
    }
    lines.push(`SUMMARY:${escapeICS(e.title)}`);
    if (e.location) lines.push(`LOCATION:${escapeICS(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${escapeICS(e.description)}`);
    lines.push(`DTSTAMP:${formatICSDate(new Date().toISOString())}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
