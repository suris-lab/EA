"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORIES, type EventCategory } from "@/types/event";
import { addMinutesToDateTime, minutesBetween, toTimestamp } from "@/lib/date-utils";

const DURATIONS = [
  { label: "Drop by", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hr", minutes: 60 },
  { label: "1.5 hr", minutes: 90 },
  { label: "2 hr", minutes: 120 },
  { label: "3 hr", minutes: 180 },
];

const WEEKDAYS = [
  { short: "S", value: 0 }, { short: "M", value: 1 }, { short: "T", value: 2 },
  { short: "W", value: 3 }, { short: "T", value: 4 }, { short: "F", value: 5 }, { short: "S", value: 6 },
];

export interface FormState {
  title: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  location: string;
  description: string;
  category: EventCategory;
  recurrence: string;
  recInterval: number;
  recDays: number[];
  recEndMode: "date" | "none";
  recurrenceEnd: string;
}

export function useFormState(initial?: Partial<FormState>): FormState & {
  set: <K extends keyof FormState>(key: K, val: FormState[K]) => void;
  setAll: (s: Partial<FormState>) => void;
  selectedDuration: number | null;
  setSelectedDuration: (d: number | null) => void;
  endBeforeStart: boolean;
  recurrenceEndInvalid: boolean;
  canSave: boolean;
  handleDuration: (minutes: number) => void;
  handleDateChange: (val: string) => void;
  handleTimeChange: (val: string) => void;
  handleEndDateChange: (val: string) => void;
  handleEndTimeChange: (val: string) => void;
  toggleDay: (day: number) => void;
  recSummary: string;
} {
  const [state, setState] = useState<FormState>({
    title: "", date: "", time: "", endDate: "", endTime: "",
    allDay: false, location: "", description: "", category: "school",
    recurrence: "none", recInterval: 1, recDays: [], recEndMode: "date", recurrenceEnd: "",
    ...initial,
  });
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setState((s) => ({ ...s, [key]: val }));
  }, []);

  const setAll = useCallback((partial: Partial<FormState>) => {
    setState((s) => ({ ...s, ...partial }));
  }, []);

  const applyDuration = useCallback((startDate: string, startTime: string, minutes: number) => {
    if (!startDate || !startTime) return;
    const r = addMinutesToDateTime(startDate, startTime, minutes);
    setState((s) => ({ ...s, endDate: r.date, endTime: r.time }));
  }, []);

  const handleDuration = (minutes: number) => {
    setSelectedDuration(minutes);
    if (state.date && state.time) applyDuration(state.date, state.time, minutes);
  };

  const handleDateChange = (val: string) => {
    setState((s) => {
      const next = { ...s, date: val };
      if (selectedDuration && s.time) {
        const r = addMinutesToDateTime(val, s.time, selectedDuration);
        next.endDate = r.date; next.endTime = r.time;
      } else if (s.endDate && s.endTime && s.time) {
        const gap = minutesBetween(s.date, s.time, s.endDate, s.endTime);
        if (gap > 0) { const r = addMinutesToDateTime(val, s.time, gap); next.endDate = r.date; next.endTime = r.time; }
      }
      return next;
    });
  };

  const handleTimeChange = (val: string) => {
    setState((s) => {
      const next = { ...s, time: val };
      if (selectedDuration && s.date) {
        const r = addMinutesToDateTime(s.date, val, selectedDuration);
        next.endDate = r.date; next.endTime = r.time;
      } else if (s.endDate && s.endTime && s.date) {
        const gap = minutesBetween(s.date, s.time, s.endDate, s.endTime);
        if (gap > 0) { const r = addMinutesToDateTime(s.date, val, gap); next.endDate = r.date; next.endTime = r.time; }
      }
      return next;
    });
  };

  const handleEndDateChange = (val: string) => {
    set("endDate", val);
    if (selectedDuration && state.date && state.time) {
      const actual = minutesBetween(state.date, state.time, val, state.endTime || state.time);
      if (actual !== selectedDuration) setSelectedDuration(null);
    }
  };

  const handleEndTimeChange = (val: string) => {
    set("endTime", val);
    if (selectedDuration && state.date && state.time) {
      const actual = minutesBetween(state.date, state.time, state.endDate || state.date, val);
      if (actual !== selectedDuration) setSelectedDuration(null);
    }
  };

  const toggleDay = (day: number) => {
    setState((s) => ({ ...s, recDays: s.recDays.includes(day) ? s.recDays.filter((d) => d !== day) : [...s.recDays, day] }));
  };

  const endDateBeforeStart = state.allDay && state.date && state.endDate && state.endDate < state.date;
  const endTimeBeforeStart = !state.allDay && state.date && state.endDate && state.time && state.endTime &&
    toTimestamp(state.endDate, state.endTime) <= toTimestamp(state.date, state.time);
  const endBeforeStart = !!(endDateBeforeStart || endTimeBeforeStart);

  const hasRecEnd = state.recurrence !== "none" && state.recEndMode === "date" && state.recurrenceEnd;
  const effectiveEndDate = state.endDate || state.date;
  const effectiveEndTime = state.endTime || state.time || "23:59";
  const recurrenceEndInvalid = !!(hasRecEnd && effectiveEndDate &&
    toTimestamp(state.recurrenceEnd, "23:59") <= toTimestamp(effectiveEndDate, effectiveEndTime));

  const canSave = !!(state.title.trim() && state.date && !endBeforeStart && !recurrenceEndInvalid);

  const recSummary = state.recurrence !== "none"
    ? describeRecurrence(state.recurrence, state.recInterval, state.recDays, state.recEndMode === "none", state.recurrenceEnd)
    : "";

  return {
    ...state, set, setAll, selectedDuration, setSelectedDuration,
    endBeforeStart, recurrenceEndInvalid, canSave,
    handleDuration, handleDateChange, handleTimeChange, handleEndDateChange, handleEndTimeChange,
    toggleDay, recSummary,
  };
}

function describeRecurrence(freq: string, interval: number, days: number[], noEnd: boolean, endDate: string): string {
  let desc = "";
  if (freq === "daily") desc = interval === 1 ? "Every day" : `Every ${interval} days`;
  else if (freq === "weekly") {
    const dayNames = days.sort().map((d) => WEEKDAYS[d]?.short || "");
    const prefix = interval === 1 ? "Every week" : `Every ${interval} weeks`;
    desc = dayNames.length > 0 ? `${prefix} on ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].filter((_,i) => days.includes(i)).join(", ")}` : prefix;
  } else if (freq === "monthly") desc = interval === 1 ? "Every month" : `Every ${interval} months`;
  else if (freq === "yearly") desc = interval === 1 ? "Every year" : `Every ${interval} years`;
  if (noEnd) desc += " (no end date)";
  else if (endDate) desc += ` until ${endDate}`;
  else desc += " for 1 year";
  return desc;
}

interface EventFormFieldsProps {
  form: ReturnType<typeof useFormState>;
  showRecurrence?: boolean;
}

export default function EventFormFields({ form, showRecurrence = true }: EventFormFieldsProps) {
  const [recentLocations, setRecentLocations] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("ea-recent-locations") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        const locs: string[] = [];
        const seen = new Set<string>();
        for (const e of [...(data.events ?? [])].reverse()) {
          const loc = (e.location ?? "").trim();
          if (loc && !seen.has(loc.toLowerCase())) { seen.add(loc.toLowerCase()); locs.push(loc); if (locs.length >= 4) break; }
        }
        if (locs.length > 0) { setRecentLocations(locs); localStorage.setItem("ea-recent-locations", JSON.stringify(locs)); }
      })
      .catch(() => {});
  }, []);

  const inputClass = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const errorInputClass = "w-full rounded-lg border border-red-300 bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100";

  return (
    <div className="space-y-3">
      {/* Title */}
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Event Title</label>
        <input type="text" placeholder="e.g. Sports Day" value={form.title} onChange={(e) => form.set("title", e.target.value)} className={inputClass} />
      </div>

      {/* Category */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Category</label>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button key={cat.value} type="button" onClick={() => form.set("category", cat.value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                form.category === cat.value ? `${cat.color} text-white shadow-sm` : "border border-border bg-surface text-text-secondary active:bg-gray-100"
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* All day */}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="formAllDay" checked={form.allDay} onChange={(e) => form.set("allDay", e.target.checked)} className="h-4 w-4 rounded border-border text-brand-500 focus:ring-brand-400" />
        <label htmlFor="formAllDay" className="text-xs font-medium text-text-secondary">All day</label>
      </div>

      {/* Duration presets */}
      {!form.allDay && (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">Duration</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Duration">
            {DURATIONS.map((d) => (
              <button key={d.minutes} type="button" onClick={() => form.handleDuration(d.minutes)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition-all ${
                  form.selectedDuration === d.minutes ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25" : "border border-border bg-surface text-text-secondary active:bg-gray-100"
                }`} style={{ minHeight: 44, minWidth: 44 }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start date/time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Start Date</label>
          <input type="date" value={form.date} onChange={(e) => form.handleDateChange(e.target.value)} className={inputClass} />
        </div>
        {!form.allDay && (
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Start Time</label>
            <input type="time" value={form.time} onChange={(e) => form.handleTimeChange(e.target.value)} className={inputClass} />
          </div>
        )}
      </div>

      {/* End date/time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">End Date</label>
          <input type="date" value={form.endDate} min={form.date || undefined} onChange={(e) => form.handleEndDateChange(e.target.value)} className={form.endBeforeStart ? errorInputClass : inputClass} />
        </div>
        {!form.allDay && (
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">End Time</label>
            <input type="time" value={form.endTime} onChange={(e) => form.handleEndTimeChange(e.target.value)} className={form.endBeforeStart ? errorInputClass : inputClass} />
          </div>
        )}
      </div>
      {form.endBeforeStart && (
        <p className="text-xs text-red-500">{form.allDay ? "End date must be the same as or later than start date." : "End time must be later than start time."}</p>
      )}

      {/* Location */}
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Location</label>
        {recentLocations.length > 0 && (
          <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
            {recentLocations.map((loc) => (
              <button key={loc} type="button" onClick={() => form.set("location", loc)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  form.location === loc ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25" : "border border-border bg-surface text-text-secondary active:bg-gray-100"
                }`}>
                {loc}
              </button>
            ))}
          </div>
        )}
        <input type="text" placeholder="e.g. School Hall" value={form.location} onChange={(e) => form.set("location", e.target.value)} className={inputClass} />
      </div>

      {/* Recurrence */}
      {showRecurrence && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Repeat</label>
            <select value={form.recurrence} onChange={(e) => { form.set("recurrence", e.target.value); if (e.target.value !== "weekly") form.set("recDays", []); }} className={inputClass}>
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {form.recurrence !== "none" && (
            <>
              {form.recurrence === "weekly" ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-text-secondary">Repeat on</label>
                    <div className="flex gap-1">
                      {[{ s: "S", v: 0 }, { s: "M", v: 1 }, { s: "T", v: 2 }, { s: "W", v: 3 }, { s: "T", v: 4 }, { s: "F", v: 5 }, { s: "S", v: 6 }].map((wd) => (
                        <button key={wd.v} type="button" onClick={() => form.toggleDay(wd.v)}
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                            form.recDays.includes(wd.v) ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25" : "border border-border bg-surface text-text-secondary active:bg-gray-100"
                          }`}>{wd.s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-secondary">Frequency</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">Every</span>
                      <input type="number" min={1} max={99} value={form.recInterval} onChange={(e) => form.set("recInterval", Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 rounded-lg border border-border bg-surface px-2 py-2 text-center text-sm text-text-primary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                      <span className="text-sm text-text-secondary">{form.recInterval === 1 ? "week" : "weeks"}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">Frequency</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">Every</span>
                    <input type="number" min={1} max={99} value={form.recInterval} onChange={(e) => form.set("recInterval", Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 rounded-lg border border-border bg-surface px-2 py-2 text-center text-sm text-text-primary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                    <span className="text-sm text-text-secondary">
                      {form.recurrence === "daily" ? (form.recInterval === 1 ? "day" : "days") :
                       form.recurrence === "monthly" ? (form.recInterval === 1 ? "month" : "months") :
                       (form.recInterval === 1 ? "year" : "years")}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Ends</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="recEndMode" checked={form.recEndMode === "date"} onChange={() => form.set("recEndMode", "date")} className="h-4 w-4 border-border text-brand-500 focus:ring-brand-400" />
                    <span className="text-xs text-text-secondary">On date</span>
                  </label>
                  {form.recEndMode === "date" && (
                    <input type="date" value={form.recurrenceEnd} min={form.endDate || form.date || undefined} onChange={(e) => form.set("recurrenceEnd", e.target.value)}
                      className={form.recurrenceEndInvalid ? `${errorInputClass} ml-6` : `${inputClass} ml-6`} />
                  )}
                  {form.recEndMode === "date" && form.recurrenceEndInvalid && (
                    <p className="ml-6 text-xs text-red-500">Repeat until must be later than the event end time.</p>
                  )}
                  {form.recEndMode === "date" && !form.recurrenceEndInvalid && !form.recurrenceEnd && (
                    <p className="ml-6 text-xs text-text-muted">Leave empty to repeat for 1 year</p>
                  )}
                  <label className="flex items-center gap-2">
                    <input type="radio" name="recEndMode" checked={form.recEndMode === "none"} onChange={() => form.set("recEndMode", "none")} className="h-4 w-4 border-border text-brand-500 focus:ring-brand-400" />
                    <span className="text-xs text-text-secondary">No end date (up to 2 years)</span>
                  </label>
                </div>
              </div>

              {form.recSummary && (
                <div className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">{form.recSummary}</div>
              )}
            </>
          )}
        </>
      )}

      {/* Notes */}
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Notes</label>
        <textarea rows={2} placeholder="Optional details..." value={form.description} onChange={(e) => form.set("description", e.target.value)} className={`${inputClass} resize-none`} />
      </div>
    </div>
  );
}
