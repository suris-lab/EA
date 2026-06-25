"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORIES, type EventCategory, type PreparationData } from "@/types/event";
import { addMinutesToDateTime, minutesBetween, toTimestamp } from "@/lib/date-utils";
import PrepReminderSection from "./PrepReminderSection";

const DURATIONS = [
  { label: "Drop by", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hr", minutes: 60 },
  { label: "1.5 hr", minutes: 90 },
  { label: "2 hr", minutes: 120 },
  { label: "3 hr", minutes: 180 },
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
  preparation: PreparationData;
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
    preparation: {},
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
    const prefix = interval === 1 ? "Every week" : `Every ${interval} weeks`;
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].filter((_,i) => days.includes(i));
    desc = dayNames.length > 0 ? `${prefix} on ${dayNames.join(", ")}` : prefix;
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
    if (localStorage.getItem("ea-locations-custom")) return;
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

  const inputClass = "w-full rounded-2xl border border-border bg-surface-dim px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-400 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-100";
  const errorInputClass = "w-full rounded-2xl border border-red-300 bg-surface-dim px-4 py-3.5 text-sm text-text-primary transition-colors focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100";

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">Title</label>
        <input type="text" placeholder="e.g. Sports Day" value={form.title} onChange={(e) => form.set("title", e.target.value)} className={inputClass} />
      </div>

      {/* Category */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">Category</label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button key={cat.value} type="button" onClick={() => form.set("category", cat.value)}
              className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-semibold transition-all ${
                form.category === cat.value ? `${cat.color} text-white shadow-sm` : "border border-border bg-surface-dim text-text-secondary active:bg-gray-100"
              }`}
              style={{ minHeight: 40 }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location — moved after Category */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">Location</label>
        {recentLocations.length > 0 && (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {recentLocations.map((loc) => (
              <button key={loc} type="button" onClick={() => form.set("location", form.location === loc ? "" : loc)}
                className={`group shrink-0 rounded-2xl px-4 py-2 text-xs font-semibold transition-all ${
                  form.location === loc ? "bg-brand-500 text-white shadow-sm" : "border border-border bg-surface-dim text-text-secondary active:bg-gray-100"
                }`}>
                <span className="flex items-center gap-1.5">
                  {loc}
                  <span
                    onClick={(e) => { e.stopPropagation(); const updated = recentLocations.filter((l) => l !== loc); setRecentLocations(updated); localStorage.setItem("ea-recent-locations", JSON.stringify(updated)); localStorage.setItem("ea-locations-custom", "1"); if (form.location === loc) form.set("location", ""); }}
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] leading-none transition-colors ${form.location === loc ? "bg-white/25 text-white" : "bg-gray-200 text-gray-500"}`}
                  >
                    ×
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input type="text" placeholder="e.g. School Hall" value={form.location} onChange={(e) => form.set("location", e.target.value)} className={inputClass} />
          {form.location.trim() && !recentLocations.some((l) => l.toLowerCase() === form.location.trim().toLowerCase()) && (
            <button
              type="button"
              onClick={() => {
                const loc = form.location.trim();
                const updated = [loc, ...recentLocations].slice(0, 6);
                setRecentLocations(updated);
                localStorage.setItem("ea-recent-locations", JSON.stringify(updated));
                localStorage.setItem("ea-locations-custom", "1");
              }}
              className="shrink-0 rounded-2xl border border-brand-300 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-600 transition-all active:bg-brand-100"
            >
              + Save
            </button>
          )}
        </div>
      </div>

      {/* All day toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-dim px-4 py-3.5">
        <span className="text-sm font-medium text-text-primary">All day</span>
        <button
          type="button"
          role="switch"
          aria-checked={form.allDay}
          onClick={() => form.set("allDay", !form.allDay)}
          className={`relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full transition-colors duration-200 ${form.allDay ? "bg-brand-500" : "bg-gray-300"}`}
        >
          <span className={`inline-block h-[27px] w-[27px] rounded-full bg-white shadow transition-transform duration-200 ${form.allDay ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
        </button>
      </div>

      {/* Duration presets */}
      {!form.allDay && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">Duration</label>
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Duration">
            {DURATIONS.map((d) => (
              <button key={d.minutes} type="button" onClick={() => form.handleDuration(d.minutes)}
                className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-semibold transition-all ${
                  form.selectedDuration === d.minutes ? "bg-brand-500 text-white shadow-sm" : "border border-border bg-surface-dim text-text-secondary active:bg-gray-100"
                }`} style={{ minHeight: 40 }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">Start</label>
        <div className={`flex gap-2 ${form.allDay ? "" : ""}`}>
          <input type="date" value={form.date} onChange={(e) => form.handleDateChange(e.target.value)} className={`${inputClass} ${!form.allDay ? "flex-[1.2]" : ""}`} />
          {!form.allDay && (
            <input type="time" value={form.time} onChange={(e) => form.handleTimeChange(e.target.value)} className={`${inputClass} flex-1`} />
          )}
        </div>
      </div>

      {/* End */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">End</label>
        <div className="flex gap-2">
          <input type="date" value={form.endDate} min={form.date || undefined} onChange={(e) => form.handleEndDateChange(e.target.value)} className={`${form.endBeforeStart ? errorInputClass : inputClass} ${!form.allDay ? "flex-[1.2]" : ""}`} />
          {!form.allDay && (
            <input type="time" value={form.endTime} onChange={(e) => form.handleEndTimeChange(e.target.value)} className={`${form.endBeforeStart ? errorInputClass : inputClass} flex-1`} />
          )}
        </div>
      </div>
      {form.endBeforeStart && (
        <p className="text-xs text-red-500">{form.allDay ? "End date must be the same as or later than start date." : "End time must be later than start time."}</p>
      )}

      {/* Recurrence */}
      {showRecurrence && (
        <>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">Repeat</label>
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
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">Repeat on</label>
                    <div className="flex gap-1.5">
                      {[{ s: "S", v: 0 }, { s: "M", v: 1 }, { s: "T", v: 2 }, { s: "W", v: 3 }, { s: "T", v: 4 }, { s: "F", v: 5 }, { s: "S", v: 6 }].map((wd) => (
                        <button key={wd.v} type="button" onClick={() => form.toggleDay(wd.v)}
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-bold transition-all ${
                            form.recDays.includes(wd.v) ? "bg-brand-500 text-white shadow-sm" : "border border-border bg-surface-dim text-text-secondary active:bg-gray-100"
                          }`}>{wd.s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">Frequency</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">Every</span>
                      <input type="number" min={1} max={99} value={form.recInterval} onChange={(e) => form.set("recInterval", Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 rounded-2xl border border-border bg-surface-dim px-3 py-3 text-center text-sm text-text-primary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                      <span className="text-sm text-text-secondary">{form.recInterval === 1 ? "week" : "weeks"}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">Frequency</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">Every</span>
                    <input type="number" min={1} max={99} value={form.recInterval} onChange={(e) => form.set("recInterval", Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 rounded-2xl border border-border bg-surface-dim px-3 py-3 text-center text-sm text-text-primary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                    <span className="text-sm text-text-secondary">
                      {form.recurrence === "daily" ? (form.recInterval === 1 ? "day" : "days") :
                       form.recurrence === "monthly" ? (form.recInterval === 1 ? "month" : "months") :
                       (form.recInterval === 1 ? "year" : "years")}
                    </span>
                  </div>
                </div>
              )}

              {/* End mode — pill toggle */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">Ends</label>
                <div className="mb-3 inline-flex rounded-2xl border border-border bg-surface-dim p-1">
                  <button type="button" onClick={() => form.set("recEndMode", "date")}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${form.recEndMode === "date" ? "bg-brand-500 text-white shadow-sm" : "text-text-secondary"}`}>
                    On date
                  </button>
                  <button type="button" onClick={() => form.set("recEndMode", "none")}
                    className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${form.recEndMode === "none" ? "bg-brand-500 text-white shadow-sm" : "text-text-secondary"}`}>
                    No end
                  </button>
                </div>
                {form.recEndMode === "date" && (
                  <>
                    <input type="date" value={form.recurrenceEnd} min={form.endDate || form.date || undefined} onChange={(e) => form.set("recurrenceEnd", e.target.value)}
                      className={form.recurrenceEndInvalid ? errorInputClass : inputClass} />
                    {form.recurrenceEndInvalid && (
                      <p className="mt-1 text-xs text-red-500">Repeat until must be later than the event end time.</p>
                    )}
                    {!form.recurrenceEndInvalid && !form.recurrenceEnd && (
                      <p className="mt-1 text-xs text-text-muted">Leave empty to repeat for 1 year</p>
                    )}
                  </>
                )}
                {form.recEndMode === "none" && (
                  <p className="text-xs text-text-muted">Repeats for up to 2 years</p>
                )}
              </div>

              {form.recSummary && (
                <div className="rounded-2xl bg-brand-50 px-4 py-3 text-xs font-medium text-brand-700">{form.recSummary}</div>
              )}
            </>
          )}
        </>
      )}

      {/* Preparation Reminder */}
      <PrepReminderSection
        category={form.category}
        preparation={form.preparation}
        onUpdate={(data) => form.set("preparation", data)}
      />

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">Notes</label>
        <textarea rows={3} placeholder="Optional details..." value={form.description} onChange={(e) => form.set("description", e.target.value)} className={`${inputClass} resize-none`} />
      </div>
    </div>
  );
}
