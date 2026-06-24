"use client";

import { useState } from "react";
import type { CalendarEvent } from "@/types/event";
import Button from "./Button";
import HolidayReminder from "./HolidayReminder";
import { findHolidaysInRange, type HKHoliday } from "@/lib/hk-holidays";

interface EventPreviewProps {
  event: CalendarEvent;
  onConfirm: (edited: CalendarEvent) => void | Promise<void>;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  subtitle?: string;
  error?: string | null;
}

function toDateValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const match = String(iso).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch { return ""; }
}

function toTimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const match = String(iso).match(/T(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch { return ""; }
}

const WEEKDAYS = [
  { short: "S", value: 0 }, { short: "M", value: 1 }, { short: "T", value: 2 },
  { short: "W", value: 3 }, { short: "T", value: 4 }, { short: "F", value: 5 }, { short: "S", value: 6 },
];

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

export default function EventPreview({
  event, onConfirm, onCancel,
  confirmLabel = "Save Event", cancelLabel = "Cancel",
  subtitle, error: externalError,
}: EventPreviewProps) {
  const [title, setTitle] = useState(String(event.title || ""));
  const [date, setDate] = useState(toDateValue(event.start_date));
  const [time, setTime] = useState(toTimeValue(event.start_date));
  const [endDate, setEndDate] = useState(toDateValue(event.end_date));
  const [endTime, setEndTime] = useState(toTimeValue(event.end_date));
  const [allDay, setAllDay] = useState(Boolean(event.all_day));
  const [location, setLocation] = useState(String(event.location || ""));
  const [description, setDescription] = useState(String(event.description || ""));
  const [recurrence, setRecurrence] = useState("none");
  const [recInterval, setRecInterval] = useState(1);
  const [recDays, setRecDays] = useState<number[]>([]);
  const [recEndMode, setRecEndMode] = useState<"date" | "none">("date");
  const [recurrenceEnd, setRecurrenceEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [holidayWarning, setHolidayWarning] = useState<HKHoliday[]>([]);

  const canSave = title.trim() && date;

  const toggleDay = (day: number) => {
    setRecDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleConfirmClick = () => {
    if (!canSave || saving) return;
    const holidays = findHolidaysInRange(date, endDate || date);
    if (holidays.length > 0 && holidayWarning.length === 0) {
      setHolidayWarning(holidays);
      return;
    }
    doConfirm();
  };

  const doConfirm = async () => {
    if (saving) return;
    setSaving(true);

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

    const edited: CalendarEvent = {
      id: event.id || "",
      title: title.trim(),
      start_date: startDate,
      end_date: endDateStr,
      all_day: allDay,
      location: location.trim() || null,
      description: description.trim() || null,
      recurrence: recurrenceObj as CalendarEvent["recurrence"],
      source: event.source || "photo",
      created_at: event.created_at || "",
    };

    try {
      await onConfirm(edited);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onCancel}>
      <div className="animate-modal-in flex max-h-[90vh] w-full max-w-md flex-col rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 border-b border-border-light px-6 pb-3 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Confirm Event</h2>
              {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
            </div>
            <button onClick={onCancel} className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-dim hover:text-text-secondary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          <p className="mb-4 text-sm text-text-secondary">Review and edit the details before saving.</p>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="previewAllDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 rounded border-border text-brand-500 focus:ring-brand-400" />
              <label htmlFor="previewAllDay" className="text-xs font-medium text-text-secondary">All day</label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Start Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
              </div>
              {!allDay && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">Start Time</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
              </div>
              {!allDay && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">End Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional" className={inputClass} />
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

                <div>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">Ends</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="previewRecEnd" checked={recEndMode === "date"} onChange={() => setRecEndMode("date")} className="h-4 w-4 border-border text-brand-500 focus:ring-brand-400" />
                      <span className="text-xs text-text-secondary">On date</span>
                    </label>
                    {recEndMode === "date" && (
                      <input type="date" value={recurrenceEnd} min={endDate || date || undefined} onChange={(e) => setRecurrenceEnd(e.target.value)} className={`${inputClass} ml-6`} />
                    )}
                    <label className="flex items-center gap-2">
                      <input type="radio" name="previewRecEnd" checked={recEndMode === "none"} onChange={() => setRecEndMode("none")} className="h-4 w-4 border-border text-brand-500 focus:ring-brand-400" />
                      <span className="text-xs text-text-secondary">No end date</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Notes</label>
              <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" className={`${inputClass} resize-none`} />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-border-light px-6 pb-6 pt-3">
          {externalError && (
            <p className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-600">{externalError}</p>
          )}
          {holidayWarning.length > 0 ? (
            <HolidayReminder holidays={holidayWarning} onContinue={doConfirm} onGoBack={() => setHolidayWarning([])} saving={saving} />
          ) : (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="md" onClick={onCancel} disabled={saving}>{cancelLabel}</Button>
              <Button variant="primary" size="md" onClick={handleConfirmClick} disabled={!canSave} loading={saving}>{confirmLabel}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
