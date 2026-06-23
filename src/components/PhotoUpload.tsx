"use client";

import Button from "./Button";

interface PhotoUploadProps {
  onClose: () => void;
}

function UploadIcon() {
  return (
    <svg className="mx-auto h-10 w-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function PhotoUpload({ onClose }: PhotoUploadProps) {
  return (
    <div className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="animate-modal-in w-full max-w-md rounded-t-2xl bg-surface p-6 shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">Scan School Notice</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-dim hover:text-text-secondary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mb-5 text-sm text-text-secondary">
          Upload or photograph a school notice to automatically extract events.
        </p>

        {/* Drop zone */}
        <div className="mb-5 rounded-xl border-2 border-dashed border-border bg-surface-dim p-8 text-center transition-colors hover:border-brand-300 hover:bg-brand-50">
          <UploadIcon />
          <p className="mt-3 text-sm font-medium text-text-primary">
            Drop image here or tap to upload
          </p>
          <p className="mt-1 text-xs text-text-muted">
            PNG, JPG up to 10 MB
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" disabled>
            Scan
          </Button>
        </div>
      </div>
    </div>
  );
}
