"use client";

import { useState } from "react";
import Button from "./Button";

interface EventFormProps {
  onClose: () => void;
  onSaved: () => void;
}

const DURATIONS = [
  { label: "30m", minutes: 30 },
  { label: "1hr", minutes: 60 },
  { label: "1.5hr", minutes: 90 },
  { label: "2hr", minutes: 120 },
];

function addMinutes(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
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
  const [recurrenceEnd, setRecurrenceEnd] = useState("");
  const [saving, setSaving] = useState(false);

  const handleDuration = (minutes: number) => {
    if (!time) return;
    setSelectedDuration(minutes);
    const newEnd = addMinutes(time, minutes);
    setEndTime(newEnd);
    if (!endDate) setEndDate(date);
  };

  const handleTimeChange = (val: string) => {
    setTime(val);
    setSelectedDuration(null);
  };

  const handleEndTimeChange = (val: string) => {
    setEndTime(val);
    setSelectedDuration(null);
  };

  // Validation
  const endBeforeStart = !allDay && date && endDate && time && endTime && (
    endDate < date || (endDate === date && timeToMinutes(endTime) <= timeToMinutes(time))
  );

  const recurrenceEndInvalid = recurrence !== "none" && recurrenceEnd && (
    endDate ? recurrenceEnd <= endDate : recurrenceEnd <= date
  );

  const canSave = title.trim() && date && !endBeforeStart && !recurrenceEndInvalid;

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
      ? { frequency: recurrence, interval: 1, ...(recurrenceEnd ? { endDate: recurrenceEnd } : {}) }
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

  const errorInputClass =
    "w-full rounded-lg border border-red-300 bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100";

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="animate-modal-in flex max-h-[90vh] w-full max-w-md flex-col rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Fixed header */}
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

        {/* Scrollable content */}
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

            {/* Duration quick-select */}
            {!allDay && time && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Duration</label>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.minutes}
                      type="button"
                      onClick={() => handleDuration(d.minutes)}
                      className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                        selectedDuration === d.minutes
                          ? "bg-brand-500 text-white shadow-sm shadow-brand-500/25"
                          : "border border-border bg-surface text-text-secondary hover:bg-surface-dim active:bg-gray-100"
                      }`}
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
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
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
                  onChange={(e) => setEndDate(e.target.value)}
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
              <p className="text-xs text-red-500">End time must be after start time.</p>
            )}

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

            {recurrence !== "none" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-text-secondary">Repeat until</label>
                <input
                  type="date"
                  value={recurrenceEnd}
                  min={endDate || date || undefined}
                  onChange={(e) => setRecurrenceEnd(e.target.value)}
                  className={recurrenceEndInvalid ? errorInputClass : inputClass}
                />
                {recurrenceEndInvalid && (
                  <p className="mt-1 text-xs text-red-500">Must be after the event end date.</p>
                )}
                {!recurrenceEndInvalid && (
                  <p className="mt-1 text-xs text-text-muted">Leave empty to repeat for 1 year</p>
                )}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Notes</label>
              <textarea rows={2} placeholder="Optional details..." value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
            </div>
          </div>
        </div>

        {/* Fixed footer */}
        <div className="shrink-0 border-t border-border-light px-6 pb-6 pt-3">
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
    </div>
  );
}
