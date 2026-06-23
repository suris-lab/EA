"use client";

import { useState } from "react";
import type { CalendarEvent } from "@/types/event";
import Button from "./Button";

interface EventDetailProps {
  event: CalendarEvent;
  onClose: () => void;
  onUpdated: () => void;
}

function toDateValue(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function toTimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().slice(11, 16);
  } catch {
    return "";
  }
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100";

export default function EventDetail({ event, onClose, onUpdated }: EventDetailProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(toDateValue(event.start_date));
  const [time, setTime] = useState(toTimeValue(event.start_date));
  const [endDate, setEndDate] = useState(toDateValue(event.end_date));
  const [endTime, setEndTime] = useState(toTimeValue(event.end_date));
  const [allDay, setAllDay] = useState(event.all_day ?? false);
  const [location, setLocation] = useState(event.location ?? "");
  const [description, setDescription] = useState(event.description ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const handleDelete = async () => {
    setDeleting(true);
    await fetch("/api/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: event.id }),
    });
    setDeleting(false);
    onUpdated();
    onClose();
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

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="animate-modal-in w-full max-w-md rounded-t-2xl bg-surface p-6 shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">
            {editing ? "Edit Event" : "Event Details"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-dim hover:text-text-secondary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {editing ? (
          /* Edit mode */
          <div className="mb-5 mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="detailAllDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="h-4 w-4 rounded border-border text-brand-500 focus:ring-brand-400" />
              <label htmlFor="detailAllDay" className="text-xs font-medium text-text-secondary">All day</label>
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
        ) : (
          /* View mode */
          <div className="mb-5 mt-4 space-y-3 rounded-xl border border-border-light bg-surface-dim p-4">
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

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-medium text-red-700">Delete this event? This cannot be undone.</p>
            <div className="mt-2 flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                Keep
              </Button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:bg-red-300"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          {!editing && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs font-medium text-red-500 transition-colors hover:text-red-600"
            >
              Delete event
            </button>
          )}
          {editing && <div />}

          <div className="flex gap-2">
            {editing ? (
              <>
                <Button variant="ghost" size="md" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" onClick={handleSave} loading={saving} disabled={!canSave}>
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="md" onClick={onClose}>
                  Close
                </Button>
                <Button variant="secondary" size="md" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
