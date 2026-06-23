import { createEvents, type EventAttributes } from "ics";
import type { CalendarEvent } from "@/types/event";

function toDateArray(iso: string): [number, number, number, number, number] {
  const d = new Date(iso);
  return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];
}

export function generateICS(events: CalendarEvent[]): string {
  const icsEvents: EventAttributes[] = events.map((e) => ({
    title: e.title,
    start: toDateArray(e.start_date),
    ...(e.end_date ? { end: toDateArray(e.end_date) } : { duration: { hours: 1 } }),
    location: e.location ?? undefined,
    description: e.description ?? undefined,
  }));

  const { value, error } = createEvents(icsEvents);
  if (error) throw error;
  return value ?? "";
}
