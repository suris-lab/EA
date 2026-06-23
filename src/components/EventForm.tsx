"use client";

interface EventFormProps {
  onClose: () => void;
}

export default function EventForm({ onClose }: EventFormProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Create Event</h2>
        <p className="mb-4 text-sm text-gray-500">
          Manually add a recurring or one-time event.
        </p>
        {/* TODO: event form fields + recurrence options */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
