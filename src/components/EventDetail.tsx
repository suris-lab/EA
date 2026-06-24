"use client";

import { useState } from "react";
import type { CalendarEvent } from "@/types/event";
import { getCategoryColor, getCategoryLabel } from "@/types/event";
import { toDateValue, toTimeValue, buildLocalISO } from "@/lib/date-utils";
import Button from "./Button";
import EventFormFields, { useFormState } from "./EventFormFields";

interface EventDetailProps {
  event: CalendarEvent;
  onClose: () => void;
  onUpdated: () => void;
  onDuplicate?: (event: CalendarEvent) => void;
}

export default function EventDetail({ event, onClose, onUpdated, onDuplicate }: EventDetailProps) {
  const [editing, setEditing] = useState(false);
  const form = useFormState({
    title: event.title,
    date: toDateValue(event.start_date),
    time: toTimeValue(event.start_date),
    endDate: toDateValue(event.end_date),
    endTime: toTimeValue(event.end_date),
    allDay: event.all_day ?? false,
    location: event.location ?? "",
    description: event.description ?? "",
    category: (event.category as "school") || "school",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMode, setDeleteMode] = useState<null | "prompt" | "single">(null);

  const isSeries = !!event.series_id;

  const handleSave = async () => {
    if (!form.canSave || saving) return;
    setSaving(true);

    const startDate = buildLocalISO(form.date, form.allDay || !form.time ? undefined : form.time);
    const endDateStr = form.endDate
      ? buildLocalISO(form.endDate, form.allDay || !form.endTime ? "23:59" : form.endTime)
      : null;

    await fetch("/api/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: event.id,
        title: form.title.trim(),
        start_date: startDate,
        end_date: endDateStr,
        all_day: form.allDay,
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        category: form.category,
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
      body: JSON.stringify({ id: event.id, deleteSeries, seriesId: event.series_id }),
    });
    setDeleting(false);
    onUpdated();
    onClose();
  };

  const handleDeleteClick = () => setDeleteMode(isSeries ? "prompt" : "single");

  function formatDate(iso: string): string {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  }

  const recurrenceLabel = event.recurrence ? `Repeats ${event.recurrence.frequency}` : null;
  const dotColor = getCategoryColor(event.category);

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="animate-modal-in flex max-h-[90vh] w-full max-w-md flex-col rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 border-b border-border-light px-6 pb-3 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">{editing ? "Edit Event" : "Event Details"}</h2>
            <button onClick={onClose} className="rounded-2xl p-1 text-text-muted transition-colors hover:bg-surface-dim hover:text-text-secondary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          {editing ? (
            <EventFormFields form={form} showRecurrence={false} />
          ) : (
            <div className="event-detail-content space-y-3 rounded-2xl border border-border-light bg-surface-dim p-4">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 shrink-0 rounded-full ${dotColor}`} />
                <span className="text-base font-semibold text-text-primary">{event.title}</span>
              </div>
              <div className="space-y-2 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
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
                {event.all_day && <div className="inline-block rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">All day</div>}
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
                {event.category && (
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                    <span className="text-xs">{getCategoryLabel(event.category)}</span>
                  </div>
                )}
                <div className="inline-block rounded-full bg-surface px-2 py-0.5 text-xs text-text-muted">
                  {event.source === "photo" ? "From notice scan" : "Manually added"}
                </div>
              </div>
            </div>
          )}

          {deleteMode === "single" && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-700">Delete this event? This cannot be undone.</p>
              <div className="mt-2 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setDeleteMode(null)}>Keep</Button>
                <button onClick={() => handleDelete(false)} disabled={deleting} className="rounded-2xl bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:bg-red-300">
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}

          {deleteMode === "prompt" && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="mb-3 text-sm font-medium text-red-700">This is a recurring event.</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleDelete(false)} disabled={deleting} className="flex w-full items-center rounded-2xl border border-red-200 bg-surface px-4 py-3 text-left text-sm active:bg-red-100">
                  <div><p className="font-medium text-text-primary">Delete this event only</p><p className="text-xs text-text-secondary">Other events in the series will remain.</p></div>
                </button>
                <button onClick={() => handleDelete(true)} disabled={deleting} className="flex w-full items-center rounded-2xl border border-red-200 bg-surface px-4 py-3 text-left text-sm active:bg-red-100">
                  <div><p className="font-medium text-red-600">Delete all events in this series</p><p className="text-xs text-text-secondary">This will remove every occurrence.</p></div>
                </button>
                <button onClick={() => setDeleteMode(null)} className="mt-1 text-center text-xs font-medium text-text-secondary">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {!deleteMode && (
          <div className="shrink-0 border-t border-border-light px-6 pb-6 pt-3">
            <div className="flex items-center justify-between">
              {!editing ? (
                <button onClick={handleDeleteClick} className="text-xs font-medium text-red-500 hover:text-red-600">Delete event</button>
              ) : <div />}
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button variant="ghost" size="md" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button variant="primary" size="md" onClick={handleSave} loading={saving} disabled={!form.canSave}>Save Changes</Button>
                  </>
                ) : (
                  <>
                    {onDuplicate && (
                      <Button variant="ghost" size="md" onClick={() => { onDuplicate(event); onClose(); }}>Duplicate</Button>
                    )}
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
