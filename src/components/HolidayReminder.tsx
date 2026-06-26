"use client";

import type { HKHoliday } from "@/lib/hk-holidays";
import type { CalendarEvent } from "@/types/event";
import Button from "./Button";
import { L } from "@/lib/labels";

interface ConflictReminderProps {
  holidays: HKHoliday[];
  conflicts: CalendarEvent[];
  onContinue: () => void;
  onGoBack: () => void;
  saving?: boolean;
}

export default function HolidayReminder({ holidays, conflicts, onContinue, onGoBack, saving }: ConflictReminderProps) {
  if (holidays.length === 0 && conflicts.length === 0) return null;

  return (
    <div className="rounded-2xl bg-[#FF9500]/8 p-4">
      <div className="mb-3 flex items-start gap-2">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="space-y-1.5 text-sm text-amber-800">
          {holidays.map((h) => {
            const d = new Date(h.date + "T12:00:00");
            const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
            return (
              <p key={h.date}>
                此活動落在香港公眾假期 This event falls on the Hong Kong public holiday <span className="font-semibold">&lsquo;{h.name}&rsquo;</span> on {dateStr}.
              </p>
            );
          })}
          {conflicts.length > 0 && (
            <div>
              <p className="font-medium">
                此時間與{conflicts.length}個現有活動重疊 This time overlaps with {conflicts.length === 1 ? "an existing event" : `${conflicts.length} existing events`}:
              </p>
              <ul className="mt-1 space-y-0.5">
                {conflicts.map((evt) => {
                  const d = new Date(evt.start_date);
                  const timeStr = evt.all_day
                    ? L.allDay
                    : d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <li key={evt.id} className="flex items-center gap-1.5 text-[13px]">
                      <span className="text-amber-400">•</span>
                      <span className="font-medium">{evt.title}</span>
                      <span className="text-amber-600">({timeStr})</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onGoBack}>
          {L.goBack}
        </Button>
        <Button variant="primary" size="sm" onClick={onContinue} loading={saving}>
          {L.continueSave}
        </Button>
      </div>
    </div>
  );
}
