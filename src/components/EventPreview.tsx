"use client";

import type { CalendarEvent } from "@/types/event";
import Button from "./Button";

interface EventPreviewProps {
  event: CalendarEvent;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  subtitle?: string;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}

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

export default function EventPreview({
  event,
  onConfirm,
  onCancel,
  confirmLabel = "Save Event",
  cancelLabel = "Cancel",
  subtitle,
}: EventPreviewProps) {
  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onCancel}>
      <div className="animate-modal-in w-full max-w-md rounded-t-2xl bg-surface p-6 shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Confirm Event</h2>
            {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
          </div>
          <button onClick={onCancel} className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-dim hover:text-text-secondary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mb-5 text-sm text-text-secondary">
          Review the details before saving.
        </p>

        <div className="mb-5 space-y-3 rounded-xl border border-border-light bg-surface-dim p-4">
          <DetailRow label="Title" value={event.title} />
          <DetailRow label="Date" value={formatDate(event.start_date)} />
          {event.end_date && <DetailRow label="End" value={formatDate(event.end_date)} />}
          {event.all_day && <DetailRow label="Type" value="All day" />}
          {event.location && <DetailRow label="Place" value={event.location} />}
          {event.description && <DetailRow label="Notes" value={event.description} />}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" size="md" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
