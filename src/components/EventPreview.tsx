"use client";

import type { CalendarEvent } from "@/types/event";
import Button from "./Button";

interface EventPreviewProps {
  event: CalendarEvent;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function EventPreview({
  event,
  onConfirm,
  onCancel,
}: EventPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold">Confirm Event</h2>
        <div className="mb-4 space-y-2 text-sm">
          <p>
            <span className="font-medium">Title:</span> {event.title}
          </p>
          <p>
            <span className="font-medium">Date:</span> {event.startDate}
          </p>
          {event.endDate && (
            <p>
              <span className="font-medium">End:</span> {event.endDate}
            </p>
          )}
          {event.location && (
            <p>
              <span className="font-medium">Location:</span> {event.location}
            </p>
          )}
          {event.description && (
            <p>
              <span className="font-medium">Details:</span>{" "}
              {event.description}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={onConfirm}>
            Save Event
          </Button>
        </div>
      </div>
    </div>
  );
}
