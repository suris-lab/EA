"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Button from "./Button";
import HolidayReminder from "./HolidayReminder";
import { findHolidaysInRange, type HKHoliday } from "@/lib/hk-holidays";

interface EventFormProps {
  onClose: () => void;
  onSaved: () => void;
}

const DURATIONS = [
  { label: "Drop by", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hr", minutes: 60 },
  { label: "1.5 hr", minutes: 90 },
  { label: "2 hr", minutes: 120 },
];

const WEEKDAYS = [
  { label: "Sun", short: "S", value: 0 },
  { label: "Mon", short: "M", value: 1 },
  { label: "Tue", short: "T", value: 2 },
  { label: "Wed", short: "W", value: 3 },
  { label: "Thu", short: "T", value: 4 },
  { label: "Fri", short: "F", value: 5 },
  { label: "Sat", short: "S", value: 6 },
];

function addMinutesToDateTime(dateStr: string, timeStr: string, minutes: number): { date: string; time: string } {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, m] = timeStr.split(":").map(Number);
  const dt = new Date(y, mo - 1, d, h, m + minutes);
  const outDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  const outTime = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
  return { date: outDate, time: outTime };
}

function toTimestamp(dateStr: string, timeStr: string): number {
  if (!dateStr) return 0;
  const [y, mo, d] = dateStr.split("-").map(Number);
  if (!timeStr) return new Date(y, mo - 1, d).getTime();
  const [h, m] = timeStr.split(":").map(Number);
  return new Date(y, mo - 1, d, h, m).getTime();
}

function minutesBetween(d1: string, t1: string, d2: string, t2: string): number {
  return Math.round((toTimestamp(d2, t2) - toTimestamp(d1, t1)) / 60000);
}

function describeRecurrence(freq: string, interval: number, days: number[], noEnd: boolean, endDate: string): string {
  if (freq === "none") return "";
  let desc = "";
  if (freq === "daily") desc = interval === 1 ? "Every day" : `Every ${interval} days`;
  else if (freq === "weekly") {
    const dayNames = days.sort().map((d) => WEEKDAYS[d].label);
    const prefix = interval === 1 ? "Every week" : `Every ${interval} weeks`;
    desc = dayNames.length > 0 ? `${prefix} on ${dayNames.join(", ")}` : prefix;
  } else if (freq === "monthly") desc = interval === 1 ? "Every month" : `Every ${interval} months`;
  else if (freq === "yearly") desc = interval === 1 ? "Every year" : `Every ${interval} years`;
  if (noEnd) desc += " (no end date)";
  else if (endDate) desc += ` until ${endDate}`;
  else desc += " for 1 year";
  return desc;
}

export default function EventForm({ onClose, onSaved }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [recInterval, setRecInterval] = useState(1);
  const [recDays, setRecDays] = useState<number[]>([]);
  const [recEndMode, setRecEndMode] = useState<"date" | "none">("date");
  const [recurrenceEnd, setRecurrenceEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [holidayWarning, setHolidayWarning] = useState<HKHoliday[]>([]);
  const savingRef = useRef(false);
  const [recentLocations, setRecentLocations] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("ea-recent-locations") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        const locs: string[] = [];
        const seen = new Set<string>();
        for (const e of [...(data.events ?? [])].reverse()) {
          const loc = (e.location ?? "").trim();
          if (loc && !seen.has(loc.toLowerCase())) {
            seen.add(loc.toLowerCase());
            locs.push(loc);
            if (locs.length >= 4) break;
          }
        }
        if (locs.length > 0) {
          setRecentLocations(locs);
          localStorage.setItem("ea-recent-locations", JSON.stringify(locs));
        }
      })
      .catch(() => {});
  }, []);

  const applyDuration = useCallback((startDate: string, startTime: string, minutes: number) => {
    if (!startDate || !startTime) return;
    const result = addMinutesToDateTime(startDate, startTime, minutes);
    setEndDate(result.date);
    setEndTime(result.time);
  }, []);

  const handleDuration = (minutes: number) => {
    setSelectedDuration(minutes);
    if (date && time) applyDuration(date, time, minutes);
  };

  const handleDateChange = (val: string) => {
    setDate(val);
    if (selectedDuration && time) applyDuration(val, time, selectedDuration);
    else if (endDate && endTime && time) {
      const gap = minutesBetween(date, time, endDate, endTime);
      if (gap > 0) { const r = addMinutesToDateTime(val, time, gap); setEndDate(r.date); setEndTime(r.time); }
    }
  };

  const handleTimeChange = (val: string) => {
    setTime(val);
    if (selectedDuration && date) applyDuration(date, val, selectedDuration);
    else if (endDate && endTime && date) {
      const gap = minutesBetween(date, time, endDate, endTime);
      if (gap > 0) { const r = addMinutesToDateTime(date, val, gap); setEndDate(r.date); setEndTime(r.time); }
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (selectedDuration && date && time) {
      const actual = minutesBetween(date, time, val, endTime || time);
      if (actual !== selectedDuration) setSelectedDuration(null);
    }
  };

  const handleEndTimeChange = (val: string) => {
    setEndTime(val);
    if (selectedDuration && date && time) {
      const actual = minutesBetween(date, time, endDate || date, val);
      if (actual !== selectedDuration) setSelectedDuration(null);
    }
  };

  const toggleDay = (day: number) => {
    setRecDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const endDateBeforeStart = allDay && date && endDate && endDate < date;
  const endTimeBeforeStart = !allDay && date && endDate && time && endTime &&
    toTimestamp(endDate, endTime) <= toTimestamp(date, time);
  const endBeforeStart = endDateBeforeStart || endTimeBeforeStart;

  const hasRecEnd = recurrence !== "none" && recEndMode === "date" && recurrenceEnd;
  const effectiveEndDate = endDate || date;
  const effectiveEndTime = endTime || time || "23:59";
  const recurrenceEndInvalid = hasRecEnd && effectiveEndDate &&
    toTimestamp(recurrenceEnd, "23:59") <= toTimestamp(effectiveEndDate, effectiveEndTime);

  const canSave = title.trim() && date && !endBeforeStart && !recurrenceEndInvalid && !saving;

  const handleSaveClick = () => {
    if (!canSave || savingRef.current) return;
    setSaveError(null);
    const holidays = findHolidaysInRange(date, endDate || date);
    if (holidays.length > 0 && holidayWarning.length === 0) {
      setHolidayWarning(holidays);
      return;
    }
    doSave();
  };

  const doSave = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);

    const startDate = allDay || !time ? `${date}T00:00:00` : `${date}T${time}:00`;
    const endDateStr = endDate
      ? allDay || !endTime ? `${endDate}T23:59:59` : `${endDate}T${endTime}:00`
      : null;

    const recurrenceObj = recurrence !== "none"
      ? {
          frequency: recurrence,
          interval: recInterval,
          ...(recurrence === "weekly" && recDays.length > 0 ? { daysOfWeek: recDays } : {}),
          ...(recEndMode === "none" ? { noEnd: true } : {}),
          ...(recEndMode === "date" && recurrenceEnd ? { endDate: recurrenceEnd } : {}),
        }
      : null;

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          start_date: startDate,
          end_date: endDateStr,
          all_day: allDay,
          location: location.trim() || null,
          description: description.trim() || null,
          recurrence: recurrenceObj,
          source: "manual",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSaveError(err.error || "Failed to save event. Please try again.");
        savingRef.current = false;
        setSaving(false);
        return;
      }

      setHolidayWarning([]);
      onSaved();
      onClose();
    } catch {
      setSaveError("Network error. Please check your connection.");
      savingRef.current = false;
      setSaving(false);
    }
  };

  const recSummary = recurrence !== "none"
    ? describeRecurrence(recurrence, recInterval, recDays, recEndMode === "none", recurrenceEnd)
    : "";

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const errorInputClass =
    "w-full rounded-lg border border-red-300 bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100";

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="animate-modal-in flex max-h-[90vh] w-full max-w-md flex-col rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 border-b border-border-light px-6 pb-3 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">New Event</h2>
            <button onClick={onClose} className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-dim hover:text-text-secondary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Event Title</label>
              <input type="text" placeholder="e.g. Sports Day" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="allDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 rounded border-border text-brand-500 focus:ring-brand-400" />
              <label htmlFor="allDay" className="text-xs font-medium text-text-secondary">All day</label>
            </div>

            {!allDay && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Duration</label>
                <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Duration">
                  {DURATIONS.map((d) => (
                    <button key={d.minutes} type="button" onClick={() => handleDuration(d.minutes)}
                      className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition-all ${selectedDuration === d.minutes ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25" : "border border-border bg-surface text-text-secondary active:bg-gray-100"}`}
                      style={{ minHeight: 44, minWidth: 44 }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Start Date</label>
                <input type="date" value={date} onChange={(e) => handleDateChange(e.target.value)} className={inputClass} />
              </div>
              {!allDay && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">Start Time</label>
                  <input type="time" value={time} onChange={(e) => handleTimeChange(e.target.value)} className={inputClass} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">End Date</label>
                <input type="date" value={endDate} min={date || undefined} onChange={(e) => handleEndDateChange(e.target.value)} className={endBeforeStart ? errorInputClass : inputClass} />
              </div>
              {!allDay && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">End Time</label>
                  <input type="time" value={endTime} onChange={(e) => handleEndTimeChange(e.target.value)} className={endBeforeStart ? errorInputClass : inputClass} />
                </div>
              )}
            </div>
            {endBeforeStart && (
              <p className="text-xs text-red-500">{allDay ? "End date must be the same as or later than start date." : "End time must be later than start time."}</p>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Location</label>
              {recentLocations.length > 0 && (
                <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                  {recentLocations.map((loc) => (
                    <button key={loc} type="button" onClick={() => setLocation(loc)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${location === loc ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25" : "border border-border bg-surface text-text-secondary active:bg-gray-100"}`}>
                      {loc}
                    </button>
                  ))}
                </div>
              )}
              <input type="text" placeholder="e.g. School Hall" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
            </div>

            {/* Recurrence */}
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Repeat</label>
              <select value={recurrence} onChange={(e) => { setRecurrence(e.target.value); if (e.target.value !== "weekly") setRecDays([]); }} className={inputClass}>
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {recurrence !== "none" && (
              <>
                {/* Weekly: combined layout */}
                {recurrence === "weekly" ? (
                  <>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-text-secondary">Repeat on</label>
                      <div className="flex gap-1">
                        {WEEKDAYS.map((wd) => (
                          <button key={wd.value} type="button" onClick={() => toggleDay(wd.value)}
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                              recDays.includes(wd.value)
                                ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25"
                                : "border border-border bg-surface text-text-secondary active:bg-gray-100"
                            }`}>
                            {wd.short}
                          </button>
                        ))}
                      </div>
                    </div>
                    {recInterval > 1 && (
                      <p className="text-xs text-text-muted">Repeats every {recInterval} weeks</p>
                    )}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-text-secondary">Frequency</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-secondary">Every</span>
                        <input type="number" min={1} max={99} value={recInterval} onChange={(e) => setRecInterval(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-14 rounded-lg border border-border bg-surface px-2 py-2 text-center text-sm text-text-primary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                        <span className="text-sm text-text-secondary">{recInterval === 1 ? "week" : "weeks"}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-secondary">Frequency</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">Every</span>
                      <input type="number" min={1} max={99} value={recInterval} onChange={(e) => setRecInterval(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 rounded-lg border border-border bg-surface px-2 py-2 text-center text-sm text-text-primary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                      <span className="text-sm text-text-secondary">
                        {recurrence === "daily" ? (recInterval === 1 ? "day" : "days") :
                         recurrence === "monthly" ? (recInterval === 1 ? "month" : "months") :
                         (recInterval === 1 ? "year" : "years")}
                      </span>
                    </div>
                  </div>
                )}

                {/* End mode */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">Ends</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="recEndMode" checked={recEndMode === "date"} onChange={() => setRecEndMode("date")} className="h-4 w-4 border-border text-brand-500 focus:ring-brand-400" />
                      <span className="text-xs text-text-secondary">On date</span>
                    </label>
                    {recEndMode === "date" && (
                      <input type="date" value={recurrenceEnd} min={endDate || date || undefined} onChange={(e) => setRecurrenceEnd(e.target.value)}
                        className={recurrenceEndInvalid ? errorInputClass : `${inputClass} ml-6`} />
                    )}
                    {recEndMode === "date" && recurrenceEndInvalid && (
                      <p className="ml-6 text-xs text-red-500">Repeat until must be later than the event end time.</p>
                    )}
                    {recEndMode === "date" && !recurrenceEndInvalid && !recurrenceEnd && (
                      <p className="ml-6 text-xs text-text-muted">Leave empty to repeat for 1 year</p>
                    )}
                    <label className="flex items-center gap-2">
                      <input type="radio" name="recEndMode" checked={recEndMode === "none"} onChange={() => setRecEndMode("none")} className="h-4 w-4 border-border text-brand-500 focus:ring-brand-400" />
                      <span className="text-xs text-text-secondary">No end date (up to 2 years)</span>
                    </label>
                  </div>
                </div>

                {/* Summary */}
                {recSummary && (
                  <div className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
                    {recSummary}
                  </div>
                )}
              </>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Notes</label>
              <textarea rows={2} placeholder="Optional details..." value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-border-light px-6 pb-6 pt-3">
          {saveError && (
            <p className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-600">{saveError}</p>
          )}
          {holidayWarning.length > 0 ? (
            <HolidayReminder
              holidays={holidayWarning}
              onContinue={doSave}
              onGoBack={() => setHolidayWarning([])}
              saving={saving}
            />
          ) : (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="md" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleSaveClick} loading={saving} disabled={!canSave}>
                Save Event
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
