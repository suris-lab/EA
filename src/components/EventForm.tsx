"use client";

import { useRef, useState } from "react";
import Button from "./Button";
import EventFormFields, { useFormState } from "./EventFormFields";
import HolidayReminder from "./HolidayReminder";
import { findHolidaysInRange, type HKHoliday } from "@/lib/hk-holidays";
import { buildLocalISO } from "@/lib/date-utils";

interface EventFormProps {
  onClose: () => void;
  onSaved: () => void;
  prefill?: { title?: string; location?: string; description?: string; category?: string };
}

export default function EventForm({ onClose, onSaved, prefill }: EventFormProps) {
  const form = useFormState({
    title: prefill?.title || "",
    location: prefill?.location || "",
    description: prefill?.description || "",
    category: (prefill?.category as "school") || "school",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [holidayWarning, setHolidayWarning] = useState<HKHoliday[]>([]);
  const savingRef = useRef(false);

  const handleSaveClick = () => {
    if (!form.canSave || savingRef.current) return;
    setSaveError(null);
    const holidays = findHolidaysInRange(form.date, form.endDate || form.date);
    if (holidays.length > 0 && holidayWarning.length === 0) {
      setHolidayWarning(holidays);
      return;
    }
    doSave();
  };

  const doSave = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);

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

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          start_date: startDate,
          end_date: endDateStr,
          all_day: form.allDay,
          location: form.location.trim() || null,
          description: form.description.trim() || null,
          category: form.category,
          recurrence: recurrenceObj,
          source: "manual",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSaveError(err.error || "Failed to save event.");
        savingRef.current = false;
        setSaving(false);
        return;
      }

      setHolidayWarning([]);
      onSaved();
      onClose();
    } catch {
      setSaveError("Network error. Please check your connection.");
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="animate-modal-in flex max-h-[90vh] w-full max-w-md flex-col rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 border-b border-border-light px-6 pb-3 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">New Event</h2>
            <button onClick={onClose} className="rounded-2xl p-1 text-text-muted transition-colors hover:bg-surface-dim hover:text-text-secondary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          <EventFormFields form={form} />
        </div>

        <div className="shrink-0 border-t border-border-light px-6 pb-6 pt-3">
          {saveError && <p className="mb-3 rounded-2xl bg-red-50 p-3 text-xs text-red-600">{saveError}</p>}
          {holidayWarning.length > 0 ? (
            <HolidayReminder holidays={holidayWarning} onContinue={doSave} onGoBack={() => setHolidayWarning([])} saving={saving} />
          ) : (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleSaveClick} loading={saving} disabled={!form.canSave || saving}>Save Event</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
