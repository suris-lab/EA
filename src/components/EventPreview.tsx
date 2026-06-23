"use client";

import { useState } from "react";
import type { CalendarEvent } from "@/types/event";
import Button from "./Button";

interface EventPreviewProps {
  event: CalendarEvent;
  onConfirm: (edited: CalendarEvent) => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  subtitle?: string;
}

function toDateValue(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function toTimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(11, 16);
  } catch {
    return "";
  }
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

export default function EventPreview({
  event,
  onConfirm,
  onCancel,
  confirmLabel = "Save Event",
  cancelLabel = "Cancel",
  subtitle,
}: EventPreviewProps) {
  const [title, setTitle] = useState(String(event.title || ""));
  const [date, setDate] = useState(toDateValue(event.start_date));
  const [time, setTime] = useState(toTimeValue(event.start_date));
  const [endDate, setEndDate] = useState(toDateValue(event.end_date));
  const [endTime, setEndTime] = useState(toTimeValue(event.end_date));
  const [allDay, setAllDay] = useState(Boolean(event.all_day));
  const [location, setLocation] = useState(String(event.location || ""));
  const [description, setDescription] = useState(String(event.description || ""));

  const canSave = title.trim() && date;

  const handleConfirm = () => {
    const startDate = allDay || !time
      ? `${date}T00:00:00`
      : `${date}T${time}:00`;

    const endDateStr = endDate
      ? allDay || !endTime
        ? `${endDate}T23:59:59`
        : `${endDate}T${endTime}:00`
      : null;

    onConfirm({
      ...event,
      title: title.trim(),
      start_date: startDate,
      end_date: endDateStr,
      all_day: allDay,
      location: location.trim() || null,
      description: description.trim() || null,
    });
  };

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onCancel}>
      <div className="animate-modal-in w-full max-w-md rounded-t-2xl bg-surface p-6 shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
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
        <p className="mb-5 text-sm text-text-secondary">
          Review and edit the details before saving.
        </p>

        <div className="mb-5 space-y-3">
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

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Notes</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" className={`${inputClass} resize-none`} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" size="md" onClick={handleConfirm} disabled={!canSave}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
