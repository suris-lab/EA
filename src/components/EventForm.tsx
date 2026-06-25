"use client";

import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import EventFormFields, { useFormState } from "./EventFormFields";
import HolidayReminder from "./HolidayReminder";
import { findHolidaysInRange, type HKHoliday } from "@/lib/hk-holidays";
import { buildLocalISO, findOverlappingEvents } from "@/lib/date-utils";
import type { CalendarEvent } from "@/types/event";
import { L, BiText } from "@/lib/labels";

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
  const [conflictWarning, setConflictWarning] = useState<CalendarEvent[]>([]);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [warningShown, setWarningShown] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then((d) => setAllEvents(d.events ?? [])).catch(() => {});
  }, []);

  const handleSaveClick = () => {
    if (!form.canSave || savingRef.current) return;
    setSaveError(null);

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
          preparation: Object.keys(form.preparation).length > 0 ? form.preparation : null,
          recurrence: recurrenceObj,
          source: "manual",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSaveError(err.error || L.failedToSave);
        savingRef.current = false;
        setSaving(false);
        return;
      }

      onSaved();
      onClose();
    } catch {
      setSaveError(L.networkError);
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    setHolidayWarning([]);
    setConflictWarning([]);
    setWarningShown(false);
  };

  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center" onClick={onClose}>
      <div className="animate-modal-in flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-[12px] bg-surface-dim shadow-2xl sm:rounded-[12px]" onClick={(e) => e.stopPropagation()}>
        {/* Grabber */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="h-[5px] w-9 rounded-full bg-border" />
        </div>

        {/* Apple-style header: Cancel — Title — Done */}
        <div className="flex items-center justify-between px-4 pb-2 pt-1">
          <button onClick={onClose} disabled={saving} className="min-w-[60px] text-left text-[17px] font-normal text-brand-500 active:opacity-60">
            Cancel 取消
          </button>
          <span className="text-[17px] font-semibold text-text-primary">
            <BiText text={L.newEvent} />
          </span>
          <button onClick={handleSaveClick} disabled={!form.canSave || saving}
            className="min-w-[60px] text-right text-[17px] font-semibold text-brand-500 disabled:opacity-30 active:opacity-60">
            {saving ? "..." : "Done 完成"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-2">
          {saveError && <p className="mb-3 rounded-lg bg-red-50 p-3 text-[13px] text-red-600">{saveError}</p>}
          {warningShown && (holidayWarning.length > 0 || conflictWarning.length > 0) ? (
            <HolidayReminder
              holidays={holidayWarning}
              conflicts={conflictWarning}
              onContinue={doSave}
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
