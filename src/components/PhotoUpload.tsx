"use client";

import Button from "./Button";

interface PhotoUploadProps {
  onClose: () => void;
}

export default function PhotoUpload({ onClose }: PhotoUploadProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold">Upload School Notice</h2>
        <p className="mb-4 text-sm text-gray-500">
          Take a photo or upload an image of a school notice to automatically
          create calendar events.
        </p>
        {/* TODO: file input + camera capture */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
