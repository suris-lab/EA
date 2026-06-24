export type EventCategory = "school" | "tutor" | "medical" | "family" | "other";

export const CATEGORIES: { value: EventCategory; label: string; color: string; dot: string }[] = [
  { value: "school", label: "School", color: "bg-blue-500", dot: "bg-blue-500" },
  { value: "tutor", label: "Playgroup", color: "bg-purple-500", dot: "bg-purple-500" },
  { value: "medical", label: "Medical", color: "bg-orange-500", dot: "bg-orange-500" },
  { value: "family", label: "Family", color: "bg-pink-500", dot: "bg-pink-500" },
  { value: "other", label: "Other", color: "bg-gray-400", dot: "bg-gray-400" },
];

export function getCategoryColor(cat: EventCategory | string | undefined | null): string {
  return CATEGORIES.find((c) => c.value === cat)?.dot ?? "bg-brand-500";
}

export interface CalendarEvent {
  id: string;
  title: string;
  start_date: string;
  end_date?: string | null;
  all_day?: boolean;
  location?: string | null;
  description?: string | null;
  recurrence?: RecurrenceRule | null;
  series_id?: string | null;
  category?: EventCategory | null;
  source: "manual" | "photo";
  created_at: string;
}

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  daysOfWeek?: number[];
  endDate?: string;
  count?: number;
  noEnd?: boolean;
}

export interface CreateEventPayload {
  title: string;
  start_date: string;
  end_date?: string | null;
  all_day?: boolean;
  location?: string | null;
  description?: string | null;
  recurrence?: RecurrenceRule | null;
  series_id?: string | null;
  category?: EventCategory | null;
  source: "manual" | "photo";
}
