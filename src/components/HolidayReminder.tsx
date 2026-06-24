"use client";

import type { HKHoliday } from "@/lib/hk-holidays";
import Button from "./Button";

interface HolidayReminderProps {
  holidays: HKHoliday[];
  onContinue: () => void;
  onGoBack: () => void;
  saving?: boolean;
}

export default function HolidayReminder({ holidays, onContinue, onGoBack, saving }: HolidayReminderProps) {
  if (holidays.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-2 flex items-start gap-2">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-sm text-amber-800">
          {holidays.map((h) => {
            const d = new Date(h.date + "T12:00:00");
            const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
            return (
              <p key={h.date} className="mb-1 last:mb-0">
                This event falls on the Hong Kong public holiday <span className="font-semibold">&lsquo;{h.name}&rsquo;</span> on {dateStr}.
              </p>
            );
          })}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onGoBack}>
          Go Back
        </Button>
        <Button variant="primary" size="sm" onClick={onContinue} loading={saving}>
          Continue & Save
        </Button>
      </div>
    </div>
  );
}
