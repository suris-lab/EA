"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Button from "./Button";
import EventPreview from "./EventPreview";
import type { CalendarEvent } from "@/types/event";

interface PhotoUploadProps {
  onClose: () => void;
  onSaved: () => void;
}

function CameraIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PhotoLibraryIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
    </svg>
  );
}

export default function PhotoUpload({ onClose, onSaved }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedEvents, setParsedEvents] = useState<CalendarEvent[]>([]);
  const [currentEventIdx, setCurrentEventIdx] = useState(0);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/recognize", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error || !data.events?.length) {
        setError(data.error || "No events found in this image. Try a clearer photo.");
        setScanning(false);
        return;
      }

      setParsedEvents(data.events);
      setCurrentEventIdx(0);
    } catch {
      setError("Network error. Please check your connection and try again.");
    }

    setScanning(false);
  };

  const handleConfirmEvent = async (edited: CalendarEvent) => {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: edited.title,
        start_date: edited.start_date,
        end_date: edited.end_date,
        all_day: edited.all_day,
        location: edited.location,
        description: edited.description,
        source: "photo",
      }),
    });

    if (currentEventIdx < parsedEvents.length - 1) {
      setCurrentEventIdx((i) => i + 1);
    } else {
      onSaved();
      onClose();
    }
  };

  const handleSkipEvent = () => {
    if (currentEventIdx < parsedEvents.length - 1) {
      setCurrentEventIdx((i) => i + 1);
    } else {
      if (currentEventIdx > 0) onSaved();
      onClose();
    }
  };

  if (parsedEvents.length > 0) {
    const raw = parsedEvents[currentEventIdx] as unknown as Record<string, unknown>;
    const asCalendarEvent: CalendarEvent = {
      id: "",
      title: (raw.title as string) || "Untitled",
      start_date: (raw.start_date as string) || "",
      end_date: (raw.end_date as string) || null,
      all_day: (raw.all_day as boolean) ?? false,
      location: (raw.location as string) || null,
      description: (raw.description as string) || null,
      source: "photo",
      created_at: "",
    };

    return (
      <EventPreview
        key={currentEventIdx}
        event={asCalendarEvent}
        onConfirm={handleConfirmEvent}
        onCancel={handleSkipEvent}
        confirmLabel={currentEventIdx < parsedEvents.length - 1 ? "Save & Next" : "Save Event"}
        cancelLabel={currentEventIdx < parsedEvents.length - 1 ? "Skip" : "Cancel"}
        subtitle={parsedEvents.length > 1 ? `Event ${currentEventIdx + 1} of ${parsedEvents.length}` : undefined}
      />
    );
  }

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
          Take a photo or choose from your library to extract events.
        </p>

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleInputChange}
        />
        <input
          ref={libraryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />

        {preview ? (
          <div className="mb-5">
            <Image src={preview} alt="Notice preview" width={400} height={240} className="w-full rounded-xl border border-border-light object-contain" style={{ maxHeight: 240 }} unoptimized />
            <button onClick={() => { setFile(null); setPreview(null); setError(null); }} className="mt-2 text-xs font-medium text-brand-500 hover:text-brand-600">
              Choose different image
            </button>
          </div>
        ) : (
          <div
            className="relative mb-5 cursor-pointer rounded-xl border-2 border-dashed border-border bg-surface-dim p-8 text-center transition-colors hover:border-brand-300 hover:bg-brand-50 active:bg-brand-100"
            onClick={() => setShowSourcePicker(true)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <PhotoLibraryIcon />
            <p className="mt-3 text-sm font-medium text-text-primary">
              Tap to add a photo
            </p>
            <p className="mt-1 text-xs text-text-muted">
              PNG, JPG up to 10 MB
            </p>
          </div>
        )}

        {/* Source picker action sheet */}
        {showSourcePicker && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" onClick={() => setShowSourcePicker(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <div className="animate-slide-up relative z-10 w-full max-w-sm px-4 pb-8 sm:pb-4" onClick={(e) => e.stopPropagation()}>
              <div className="overflow-hidden rounded-2xl bg-surface shadow-xl">
                <button
                  onClick={() => { setShowSourcePicker(false); cameraInputRef.current?.click(); }}
                  className="flex w-full items-center gap-3 border-b border-border-light px-5 py-4 text-left transition-colors active:bg-surface-dim"
                >
                  <CameraIcon />
                  <span className="text-sm font-medium text-text-primary">Take Photo</span>
                </button>
                <button
                  onClick={() => { setShowSourcePicker(false); libraryInputRef.current?.click(); }}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors active:bg-surface-dim"
                >
                  <PhotoLibraryIcon />
                  <span className="text-sm font-medium text-text-primary">Choose from Library</span>
                </button>
              </div>
              <button
                onClick={() => setShowSourcePicker(false)}
                className="mt-2 w-full rounded-2xl bg-surface py-4 text-center text-sm font-semibold text-brand-500 shadow-xl transition-colors active:bg-surface-dim"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleScan} loading={scanning} disabled={!file}>
            {scanning ? "Scanning..." : "Scan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
