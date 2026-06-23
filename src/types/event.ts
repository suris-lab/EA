export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  location?: string;
  description?: string;
  recurrence?: RecurrenceRule;
  source: "manual" | "photo";
  createdAt: string;
}

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  endDate?: string;
  count?: number;
  daysOfWeek?: number[];
}
