"use client";

import { useState, useRef } from "react";
import Button from "./Button";
import PhotoUpload from "./PhotoUpload";
import EventForm from "./EventForm";

function CameraIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

interface NavMenuProps {
  onEventSaved: () => void;
}

export default function NavMenu({ onEventSaved }: NavMenuProps) {
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const scanTapRef = useRef(0);
  const addTapRef = useRef(0);

  const handleUpload = () => {
    const now = Date.now();
    if (now - scanTapRef.current < 500) return;
    scanTapRef.current = now;
    setShowPhotoUpload(true);
  };

  const handleAddEvent = () => {
    const now = Date.now();
    if (now - addTapRef.current < 500) return;
    addTapRef.current = now;
    setShowEventForm(true);
  };

  return (
    <>
      {/* Top nav bar */}
      <nav className="sticky top-0 z-50 border-b border-border-light bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white shadow-sm shadow-brand-500/25">
              <CalendarIcon />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight tracking-tight text-text-primary">
                EA Calendar
              </span>
              <span className="text-[10px] font-medium leading-tight text-text-muted">v0.1.6</span>
            </div>
          </div>

          {/* Desktop buttons */}
          <div className="hidden items-center gap-3 sm:flex">
            <Button variant="secondary" size="md" icon={<PlusIcon />} onClick={handleAddEvent}>
              Add Event
            </Button>
            <Button variant="primary" size="md" icon={<CameraIcon />} onClick={handleUpload}>
              Scan Notice
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="border-t border-border-light bg-surface/90 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg gap-3">
            <button
              onClick={handleAddEvent}
              className="hero-btn flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-text-primary shadow-sm"
              aria-label="Add a new calendar event"
              style={{ minHeight: 48 }}
            >
              <PlusIcon className="h-5 w-5" />
              Add Event
            </button>
            <button
              onClick={handleUpload}
              className="hero-btn flex flex-[1.2] items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30"
              aria-label="Scan a school notice"
              style={{ minHeight: 48 }}
            >
              <CameraIcon className="h-5 w-5" />
              Scan Notice
            </button>
          </div>
        </div>
      </div>

      {showPhotoUpload && (
        <PhotoUpload onClose={() => setShowPhotoUpload(false)} onSaved={onEventSaved} />
      )}
      {showEventForm && (
        <EventForm onClose={() => setShowEventForm(false)} onSaved={onEventSaved} />
      )}
    </>
  );
}
