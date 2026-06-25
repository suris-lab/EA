"use client";

import { useState } from "react";
import type { CalendarEvent } from "@/types/event";
import { getCategoryColor, getCategoryLabel, type PreparationData } from "@/types/event";
import { L, BiText } from "@/lib/labels";
import PrepItemsDisplay from "./PrepItemsDisplay";
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
    preparation: (event.preparation as PreparationData) || {},
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
        preparation: Object.keys(form.preparation).length > 0 ? form.preparation : null,
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
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center" onClick={onClose}>
      <div className="animate-modal-in flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-[12px] bg-surface-dim shadow-2xl sm:rounded-[12px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="h-[5px] w-9 rounded-full bg-border" />
        </div>

        {/* Apple header */}
        <div className="flex items-center justify-between px-4 pb-2 pt-1">
          {editing ? (
            <button onClick={() => setEditing(false)} className="min-w-[60px] text-left text-[17px] font-normal text-brand-500 active:opacity-60">Cancel 取消</button>
          ) : (
            <button onClick={handleDeleteClick} className="min-w-[60px] text-left text-[17px] font-normal text-[#FF3B30] active:opacity-60">
              <BiText text={L.deleteEvent} />
            </button>
          )}
          <span className="text-[17px] font-semibold text-text-primary">
            <BiText text={editing ? L.editEvent : L.eventDetails} />
          </span>
          {editing ? (
            <button onClick={handleSave} disabled={!form.canSave || saving}
              className="min-w-[60px] text-right text-[17px] font-semibold text-brand-500 disabled:opacity-30 active:opacity-60">
              {saving ? "..." : "Done 完成"}
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className="min-w-[60px] text-right text-[17px] font-normal text-brand-500 active:opacity-60">
              <BiText text={L.edit} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-2">
          {editing ? (
            <EventFormFields form={form} showRecurrence={false} />
          ) : (
            <>
              {/* Event detail — grouped rows */}
              <div className="overflow-hidden rounded-[10px] bg-surface">
                <div className="flex items-center gap-2.5 border-b border-border-light px-4 py-3">
                  <div className={`h-3 w-3 shrink-0 rounded-full ${dotColor}`} />
                  <span className="text-[17px] font-semibold text-text-primary">{event.title}</span>
                </div>
                <div className="event-detail-content divide-y divide-border-light text-[15px]">
                  <div className="flex items-center gap-3 px-4 py-3 text-text-primary">
                    <svg className="h-[18px] w-[18px] shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{formatDate(event.start_date)}</span>
                    {event.all_day && <span className="ml-auto text-[13px] text-text-secondary">{L.allDay}</span>}
                  </div>
                  {event.end_date && (
                    <div className="flex items-center gap-3 px-4 py-3 text-text-primary">
                      <svg className="h-[18px] w-[18px] shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span>{formatDate(event.end_date)}</span>
                    </div>
                  )}
                  {recurrenceLabel && (
                    <div className="flex items-center gap-3 px-4 py-3 text-text-secondary">
                      <svg className="h-[18px] w-[18px] shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>{recurrenceLabel}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-3 px-4 py-3 text-text-primary">
                      <svg className="h-[18px] w-[18px] shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="mt-3 overflow-hidden rounded-[10px] bg-surface">
                  <div className="event-detail-content px-4 py-3 text-[15px] text-text-primary whitespace-pre-line">{event.description}</div>
                </div>
              )}

              {/* Preparation */}
              {event.preparation && (
                <div className="mt-3 overflow-hidden rounded-[10px] bg-surface px-4 py-3">
                  <PrepItemsDisplay preparation={event.preparation} category={event.category} />
                </div>
              )}

              {/* Meta */}
              <div className="mt-3 overflow-hidden rounded-[10px] bg-surface divide-y divide-border-light">
                {event.category && (
                  <div className="flex items-center gap-2.5 px-4 py-3 text-[15px]">
                    <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                    <span className="text-text-secondary">{getCategoryLabel(event.category)}</span>
                  </div>
                )}
                <div className="px-4 py-3 text-[13px] text-text-muted">
                  {event.source === "photo" ? L.fromScan : L.manuallyAdded}
                </div>
              </div>

              {/* Duplicate + Close */}
              <div className="mt-4 flex justify-center gap-4">
                {onDuplicate && (
                  <button onClick={() => { onDuplicate(event); onClose(); }} className="text-[15px] text-brand-500 active:opacity-60">
                    <BiText text={L.duplicate} />
                  </button>
                )}
              </div>
            </>
          )}

          {deleteMode === "single" && (
            <div className="mt-4 overflow-hidden rounded-[10px] bg-surface">
              <p className="px-4 py-3 text-[15px] text-[#FF3B30]">{L.deletePrompt}</p>
              <div className="flex border-t border-border-light">
                <button onClick={() => setDeleteMode(null)} className="flex-1 border-r border-border-light py-3 text-center text-[17px] font-normal text-brand-500">{L.keep}</button>
                <button onClick={() => handleDelete(false)} disabled={deleting} className="flex-1 py-3 text-center text-[17px] font-semibold text-[#FF3B30] disabled:opacity-40">{deleting ? L.deleting : L.delete}</button>
              </div>
            </div>
          )}

          {deleteMode === "prompt" && (
            <div className="mt-4 overflow-hidden rounded-[10px] bg-surface">
              <p className="px-4 py-3 text-[15px] font-medium text-[#FF3B30]">{L.recurringWarning}</p>
              <button onClick={() => handleDelete(false)} disabled={deleting} className="w-full border-t border-border-light px-4 py-3 text-left text-[15px] text-text-primary active:bg-surface-dim">
                <BiText text={L.deleteThisOnly} />
                <span className="block text-[13px] text-text-muted">{L.deleteThisOnlyHint}</span>
              </button>
              <button onClick={() => handleDelete(true)} disabled={deleting} className="w-full border-t border-border-light px-4 py-3 text-left text-[15px] text-[#FF3B30] active:bg-surface-dim">
                <BiText text={L.deleteAll} />
                <span className="block text-[13px] text-text-muted">{L.deleteAllHint}</span>
              </button>
              <button onClick={() => setDeleteMode(null)} className="w-full border-t border-border-light py-3 text-center text-[17px] font-semibold text-brand-500">
                {L.cancel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
