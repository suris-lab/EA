"use client";

import { useState } from "react";
import type { CalendarEvent } from "@/types/event";
import { toDateValue, toTimeValue } from "@/lib/date-utils";
import Button from "./Button";
import EventFormFields, { useFormState } from "./EventFormFields";
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

export default function EventPreview({
  event, onConfirm, onCancel,
  confirmLabel = "Save Event", cancelLabel = "Cancel",
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
  });

  const [saving, setSaving] = useState(false);
  const [holidayWarning, setHolidayWarning] = useState<HKHoliday[]>([]);

  const handleConfirmClick = () => {
    if (!form.canSave || saving) return;
    const holidays = findHolidaysInRange(form.date, form.endDate || form.date);
    if (holidays.length > 0 && holidayWarning.length === 0) {
      setHolidayWarning(holidays);
      return;
    }
    doConfirm();
  };

  const doConfirm = async () => {
    if (saving) return;
    setSaving(true);

    const startDate = form.allDay || !form.time ? `${form.date}T00:00:00` : `${form.date}T${form.time}:00`;
    const endDateStr = form.endDate
      ? form.allDay || !form.endTime ? `${form.endDate}T23:59:59` : `${form.endDate}T${form.endTime}:00`
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
            <button onClick={onCancel} className="rounded-2xl p-1 text-text-muted transition-colors hover:bg-surface-dim hover:text-text-secondary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          <p className="mb-4 text-sm text-text-secondary">Review and edit the details before saving.</p>
          <EventFormFields form={form} />
        </div>

        <div className="shrink-0 border-t border-border-light px-6 pb-6 pt-3">
          {externalError && <p className="mb-3 rounded-2xl bg-red-50 p-3 text-xs text-red-600">{externalError}</p>}
          {holidayWarning.length > 0 ? (
            <HolidayReminder holidays={holidayWarning} onContinue={doConfirm} onGoBack={() => setHolidayWarning([])} saving={saving} />
          ) : (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="md" onClick={onCancel} disabled={saving}>{cancelLabel}</Button>
              <Button variant="primary" size="md" onClick={handleConfirmClick} disabled={!form.canSave} loading={saving}>{confirmLabel}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
