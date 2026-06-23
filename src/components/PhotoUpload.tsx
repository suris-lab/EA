"use client";

interface PhotoUploadProps {
  onClose: () => void;
}

export default function PhotoUpload({ onClose }: PhotoUploadProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Upload School Notice</h2>
        <p className="mb-4 text-sm text-gray-500">
          Take a photo or upload an image of a school notice to automatically
          create calendar events.
        </p>
        {/* TODO: file input + camera capture */}
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
