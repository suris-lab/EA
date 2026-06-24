export function toLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function eventLocalDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return toLocalDate(new Date(iso));
}

export function toDateValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const match = String(iso).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return toLocalDate(d);
  } catch {
    return "";
  }
}

export function toTimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const match = String(iso).match(/T(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export function toTimestamp(dateStr: string, timeStr: string): number {
  if (!dateStr) return 0;
  const [y, mo, d] = dateStr.split("-").map(Number);
  if (!timeStr) return new Date(y, mo - 1, d).getTime();
  const [h, m] = timeStr.split(":").map(Number);
  return new Date(y, mo - 1, d, h, m).getTime();
}

export function addMinutesToDateTime(dateStr: string, timeStr: string, minutes: number): { date: string; time: string } {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, m] = timeStr.split(":").map(Number);
  const dt = new Date(y, mo - 1, d, h, m + minutes);
  const outDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  const outTime = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
  return { date: outDate, time: outTime };
}

export function minutesBetween(d1: string, t1: string, d2: string, t2: string): number {
  return Math.round((toTimestamp(d2, t2) - toTimestamp(d1, t1)) / 60000);
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function eventsOnDate(events: { start_date: string; end_date?: string | null }[], dateStr: string) {
  return events.filter((e) => {
    const start = eventLocalDate(e.start_date);
    const end = eventLocalDate(e.end_date);
    if (start === dateStr) return true;
    if (end && start && dateStr >= start && dateStr <= end) return true;
    return false;
  });
}
