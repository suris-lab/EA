export type EventCategory = "school" | "tutor" | "medical" | "family" | "other";

export const CATEGORIES: { value: EventCategory; label: string; color: string; dot: string; hex: string }[] = [
  { value: "school", label: "School 學校", color: "bg-blue-500", dot: "bg-blue-500", hex: "#3b82f6" },
  { value: "tutor", label: "Playgroup 遊戲班", color: "bg-purple-500", dot: "bg-purple-500", hex: "#a855f7" },
  { value: "medical", label: "Medical 醫療", color: "bg-orange-500", dot: "bg-orange-500", hex: "#f97316" },
  { value: "family", label: "Family 家庭", color: "bg-pink-500", dot: "bg-pink-500", hex: "#ec4899" },
  { value: "other", label: "Other 其他", color: "bg-gray-400", dot: "bg-gray-400", hex: "#9ca3af" },
];

export function getCategoryColor(cat: EventCategory | string | undefined | null): string {
  return CATEGORIES.find((c) => c.value === cat)?.dot ?? "bg-brand-500";
}

export function getCategoryHex(cat: EventCategory | string | undefined | null): string {
  return CATEGORIES.find((c) => c.value === cat)?.hex ?? "#3362fc";
}

export function getCategoryLabel(cat: EventCategory | string | undefined | null): string {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? "Other";
}

export type PrepZone = "head" | "body" | "feet" | "bag";

export interface PrepItem {
  id: string;
  label: string;
  isCustom?: boolean;
}

export type PreparationData = Partial<Record<PrepZone, PrepItem[]>> & { stroller?: PrepItem[] };

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
  preparation?: PreparationData | null;
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
  preparation?: PreparationData | null;
  source: "manual" | "photo";
}
