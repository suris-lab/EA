"use client";

import type { CalendarEvent } from "@/types/event";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
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
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Save Event
          </button>
        </div>
      </div>
    </div>
  );
}
