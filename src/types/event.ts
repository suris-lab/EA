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
  source: "manual" | "photo";
  created_at: string;
}

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  endDate?: string;
  count?: number;
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
  source: "manual" | "photo";
}
