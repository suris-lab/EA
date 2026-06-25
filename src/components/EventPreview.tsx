"use client";

import { useEffect, useState } from "react";
import type { CalendarEvent, PreparationData } from "@/types/event";
import { toDateValue, toTimeValue, buildLocalISO, findOverlappingEvents } from "@/lib/date-utils";
import Button from "./Button";
import EventFormFields, { useFormState } from "./EventFormFields";
import HolidayReminder from "./HolidayReminder";
import { findHolidaysInRange, type HKHoliday } from "@/lib/hk-holidays";
import { L, BiText } from "@/lib/labels";

interface EventPreviewProps {
  event: CalendarEvent;
  onConfirm: (edited: CalendarEvent) => void | Promise<void>;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  subtitle?: string;
  error?: string | null;
}

export default function EventPreview({
  event, onConfirm, onCancel,
  confirmLabel = L.saveEvent, cancelLabel = L.cancel,
  subtitle, error: externalError,
}: EventPreviewProps) {
  const form = useFormState({
    title: String(event.title || ""),
    date: toDateValue(event.start_date),
    time: toTimeValue(event.start_date),
    endDate: toDateValue(event.end_date),
    endTime: toTimeValue(event.end_date),
    allDay: Boolean(event.all_day),
    location: String(event.location || ""),
    description: String(event.description || ""),
    category: (event.category as "school") || "school",
    preparation: (event.preparation as PreparationData) || {},
  });

  const [saving, setSaving] = useState(false);
  const [holidayWarning, setHolidayWarning] = useState<HKHoliday[]>([]);
  const [conflictWarning, setConflictWarning] = useState<CalendarEvent[]>([]);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [warningShown, setWarningShown] = useState(false);

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then((d) => setAllEvents(d.events ?? [])).catch(() => {});
  }, []);

  const handleConfirmClick = () => {
    if (!form.canSave || saving) return;

    if (!warningShown) {
      const holidays = findHolidaysInRange(form.date, form.endDate || form.date);
      const startISO = buildLocalISO(form.date, form.allDay || !form.time ? undefined : form.time);
      const endISO = form.endDate
        ? buildLocalISO(form.endDate, form.allDay || !form.endTime ? "23:59" : form.endTime)
        : null;
      const conflicts = findOverlappingEvents(allEvents, startISO, endISO, form.allDay);

      if (holidays.length > 0 || conflicts.length > 0) {
        setHolidayWarning(holidays);
        setConflictWarning(conflicts);
        setWarningShown(true);
        return;
      }
    }

    doConfirm();
  };

  const doConfirm = async () => {
    if (saving) return;
    setSaving(true);

    const startDate = buildLocalISO(form.date, form.allDay || !form.time ? undefined : form.time);
    const endDateStr = form.endDate
      ? buildLocalISO(form.endDate, form.allDay || !form.endTime ? "23:59" : form.endTime)
      : null;

    const recurrenceObj = form.recurrence !== "none"
      ? {
          frequency: form.recurrence,
          interval: form.recInterval,
          ...(form.recurrence === "weekly" && form.recDays.length > 0 ? { daysOfWeek: form.recDays } : {}),
          ...(form.recEndMode === "none" ? { noEnd: true } : {}),
          ...(form.recEndMode === "date" && form.recurrenceEnd ? { endDate: form.recurrenceEnd } : {}),
        }
      : null;

    const edited: CalendarEvent = {
      id: event.id || "",
      title: form.title.trim(),
      start_date: startDate,
      end_date: endDateStr,
      all_day: form.allDay,
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      category: form.category,
      preparation: Object.keys(form.preparation).length > 0 ? form.preparation : null,
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

  const handleGoBack = () => {
    setHolidayWarning([]);
    setConflictWarning([]);
    setWarningShown(false);
  };

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center modal-open overscroll-none touch-none" onClick={onCancel}>
      <div className="animate-modal-in flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-surface-dim shadow-2xl sm:rounded-2xl touch-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="h-[5px] w-9 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-4 pb-2 pt-1">
          <button onClick={onCancel} disabled={saving} className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted active:bg-surface-dim">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="text-center">
            <span className="text-[17px] font-semibold text-text-primary"><BiText text={L.confirmEvent} /></span>
            {subtitle && <p className="text-[11px] text-text-muted">{subtitle}</p>}
          </div>
          <button onClick={handleConfirmClick} disabled={!form.canSave || saving}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-500 disabled:opacity-30 active:bg-surface-dim">
            {saving
              ? <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              : <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-2">
          {externalError && <p className="mb-3 rounded-lg bg-red-50 p-3 text-[13px] text-red-600">{externalError}</p>}
          {warningShown && (holidayWarning.length > 0 || conflictWarning.length > 0) ? (
            <HolidayReminder
              holidays={holidayWarning}
              conflicts={conflictWarning}
              onContinue={doConfirm}
              onGoBack={handleGoBack}
              saving={saving}
            />
          ) : (
            <EventFormFields form={form} />
          )}
        </div>
      </div>
    </div>
  );
}
