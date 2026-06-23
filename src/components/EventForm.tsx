"use client";

import { useState } from "react";
import Button from "./Button";

interface EventFormProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function EventForm({ onClose, onSaved }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [saving, setSaving] = useState(false);

  const canSave = title.trim() && date;

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

    const recurrenceObj = recurrence !== "none"
      ? { frequency: recurrence, interval: 1 }
      : null;

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

    setSaving(false);
    if (res.ok) {
      onSaved();
      onClose();
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="animate-modal-in w-full max-w-md rounded-t-2xl bg-surface p-6 shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">New Event</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-dim hover:text-text-secondary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mb-5 text-sm text-text-secondary">
          Add a one-time or recurring event to your calendar.
        </p>

        <div className="mb-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Event Title</label>
            <input type="text" placeholder="e.g. Sports Day" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="allDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 rounded border-border text-brand-500 focus:ring-brand-400" />
            <label htmlFor="allDay" className="text-xs font-medium text-text-secondary">All day</label>
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
            <input type="text" placeholder="e.g. School Hall" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Repeat</label>
            <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className={inputClass}>
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Notes</label>
            <textarea rows={2} placeholder="Optional details..." value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} loading={saving} disabled={!canSave}>
            Save Event
          </Button>
        </div>
      </div>
    </div>
  );
}
