"use client";

import { useState, useCallback } from "react";
import type { CalendarEvent } from "@/types/event";
import Button from "./Button";

interface EventDetailProps {
  event: CalendarEvent;
  onClose: () => void;
  onUpdated: () => void;
}

const DURATIONS = [
  { label: "Drop by", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hr", minutes: 60 },
  { label: "1.5 hr", minutes: 90 },
  { label: "2 hr", minutes: 120 },
];

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
  } catch {
    return "";
  }
}

function toTimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const match = String(iso).match(/T(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  } catch {
    return "";
  }
}

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

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

const errorInputClass =
  "w-full rounded-lg border border-red-300 bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100";

export default function EventDetail({ event, onClose, onUpdated }: EventDetailProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(toDateValue(event.start_date));
  const [time, setTime] = useState(toTimeValue(event.start_date));
  const [endDate, setEndDate] = useState(toDateValue(event.end_date));
  const [endTime, setEndTime] = useState(toTimeValue(event.end_date));
  const [allDay, setAllDay] = useState(event.all_day ?? false);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [location, setLocation] = useState(event.location ?? "");
  const [description, setDescription] = useState(event.description ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<null | "prompt" | "single">(null);

  const isSeries = !!event.series_id;

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
    if (selectedDuration && time) {
      applyDuration(val, time, selectedDuration);
    } else if (endDate && endTime && time) {
      const gap = minutesBetween(date, time, endDate, endTime);
      if (gap > 0) {
        const result = addMinutesToDateTime(val, time, gap);
        setEndDate(result.date);
        setEndTime(result.time);
      }
    }
  };

  const handleTimeChange = (val: string) => {
    setTime(val);
    if (selectedDuration && date) {
      applyDuration(date, val, selectedDuration);
    } else if (endDate && endTime && date) {
      const gap = minutesBetween(date, time, endDate, endTime);
      if (gap > 0) {
        const result = addMinutesToDateTime(date, val, gap);
        setEndDate(result.date);
        setEndTime(result.time);
      }
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

  const hasEnd = !allDay && endDate && endTime && date && time;
  const endBeforeStart = hasEnd && toTimestamp(endDate, endTime) <= toTimestamp(date, time);
  const canSave = title.trim() && date && !endBeforeStart;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);

    const startDate = allDay || !time
      ? `${date}T00:00:00`
      : `${date}T${time}:00`;

    const endDateStr = endDate
      ? allDay || !endTime
        ? `${endDate}T23:59:59`
        : `${endDate}T${endTime}:00`
      : null;

    await fetch("/api/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: event.id,
        title: title.trim(),
        start_date: startDate,
        end_date: endDateStr,
        all_day: allDay,
        location: location.trim() || null,
        description: description.trim() || null,
      }),
    });

    setSaving(false);
    onUpdated();
    onClose();
  };

  const handleDelete = async (deleteSeries: boolean) => {
    setDeleting(true);
    await fetch("/api/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: event.id,
        deleteSeries,
        seriesId: event.series_id,
      }),
    });
    setDeleting(false);
    onUpdated();
    onClose();
  };

  const handleDeleteClick = () => {
    setDeleteMode(isSeries ? "prompt" : "single");
  };

  function formatDate(iso: string): string {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-GB", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  const recurrenceLabel = event.recurrence
    ? `Repeats ${event.recurrence.frequency}`
    : null;

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="animate-modal-in flex max-h-[90vh] w-full max-w-md flex-col rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 border-b border-border-light px-6 pb-3 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">
              {editing ? "Edit Event" : "Event Details"}
            </h2>
            <button onClick={onClose} className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-dim hover:text-text-secondary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="detailAllDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 rounded border-border text-brand-500 focus:ring-brand-400" />
                <label htmlFor="detailAllDay" className="text-xs font-medium text-text-secondary">All day</label>
              </div>

              {!allDay && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Duration</label>
                  <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Duration">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.minutes}
                        type="button"
                        onClick={() => handleDuration(d.minutes)}
                        className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition-all ${
                          selectedDuration === d.minutes
                            ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25"
                            : "border border-border bg-surface text-text-secondary active:bg-gray-100"
                        }`}
                        style={{ minHeight: 44, minWidth: 44 }}
                      >
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
                  <input
                    type="date"
                    value={endDate}
                    min={date || undefined}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className={endBeforeStart ? errorInputClass : inputClass}
                  />
                </div>
                {!allDay && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-secondary">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      className={endBeforeStart ? errorInputClass : inputClass}
                    />
                  </div>
                )}
              </div>
              {endBeforeStart && (
                <p className="text-xs text-red-500">End time must be later than start time.</p>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional" className={inputClass} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Notes</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" className={`${inputClass} resize-none`} />
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-border-light bg-surface-dim p-4">
              <div className="text-base font-semibold text-text-primary">{event.title}</div>
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{formatDate(event.start_date)}</span>
                </div>
                {event.end_date && (
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span>{formatDate(event.end_date)}</span>
                  </div>
                )}
                {event.all_day && (
                  <div className="inline-block rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">All day</div>
                )}
                {recurrenceLabel && (
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{recurrenceLabel}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                )}
                {event.description && (
                  <div className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <span>{event.description}</span>
                  </div>
                )}
                <div className="inline-block rounded-full bg-surface px-2 py-0.5 text-xs text-text-muted">
                  {event.source === "photo" ? "From notice scan" : "Manually added"}
                </div>
              </div>
            </div>
          )}

          {deleteMode === "single" && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-700">Delete this event? This cannot be undone.</p>
              <div className="mt-2 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setDeleteMode(null)}>Keep</Button>
                <button onClick={() => handleDelete(false)} disabled={deleting} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:bg-red-300">
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}

          {deleteMode === "prompt" && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="mb-3 text-sm font-medium text-red-700">This is a recurring event.</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleDelete(false)} disabled={deleting} className="flex w-full items-center rounded-lg border border-red-200 bg-surface px-4 py-3 text-left text-sm transition-colors active:bg-red-100">
                  <div>
                    <p className="font-medium text-text-primary">Delete this event only</p>
                    <p className="text-xs text-text-secondary">Other events in the series will remain.</p>
                  </div>
                </button>
                <button onClick={() => handleDelete(true)} disabled={deleting} className="flex w-full items-center rounded-lg border border-red-200 bg-surface px-4 py-3 text-left text-sm transition-colors active:bg-red-100">
                  <div>
                    <p className="font-medium text-red-600">Delete all events in this series</p>
                    <p className="text-xs text-text-secondary">This will remove every occurrence.</p>
                  </div>
                </button>
                <button onClick={() => setDeleteMode(null)} className="mt-1 text-center text-xs font-medium text-text-secondary">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {!deleteMode && (
          <div className="shrink-0 border-t border-border-light px-6 pb-6 pt-3">
            <div className="flex items-center justify-between">
              {!editing && (
                <button onClick={handleDeleteClick} className="text-xs font-medium text-red-500 transition-colors hover:text-red-600">Delete event</button>
              )}
              {editing && <div />}
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button variant="ghost" size="md" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button variant="primary" size="md" onClick={handleSave} loading={saving} disabled={!canSave}>Save Changes</Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="md" onClick={onClose}>Close</Button>
                    <Button variant="secondary" size="md" onClick={() => setEditing(true)}>Edit</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
