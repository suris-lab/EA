export type EventCategory = "school" | "tutor" | "medical" | "family" | "other";

export const CATEGORIES: { value: EventCategory; label: string; color: string; dot: string; hex: string }[] = [
  { value: "school", label: "School 學校", color: "bg-[#007AFF]", dot: "bg-[#007AFF]", hex: "#007AFF" },
  { value: "tutor", label: "Playgroup 遊戲班", color: "bg-[#AF52DE]", dot: "bg-[#AF52DE]", hex: "#AF52DE" },
  { value: "medical", label: "Medical 醫療", color: "bg-[#FF9500]", dot: "bg-[#FF9500]", hex: "#FF9500" },
  { value: "family", label: "Family 家庭", color: "bg-[#FF2D55]", dot: "bg-[#FF2D55]", hex: "#FF2D55" },
  { value: "other", label: "Other 其他", color: "bg-[#8E8E93]", dot: "bg-[#8E8E93]", hex: "#8E8E93" },
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
