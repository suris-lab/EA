"use client";

import { useState } from "react";
import Button from "./Button";
import PhotoUpload from "./PhotoUpload";
import EventForm from "./EventForm";

function CameraIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  const handleUpload = () => {
    setShowPhotoUpload(true);
    setMenuOpen(false);
  };

  const handleAddEvent = () => {
    setShowEventForm(true);
    setMenuOpen(false);
  };

  return (
    <>
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
              <span className="text-[10px] font-medium leading-tight text-text-muted">v0.1.3</span>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Button variant="secondary" size="md" icon={<PenIcon />} onClick={handleAddEvent}>
              Add Event
            </Button>
            <Button variant="primary" size="md" icon={<CameraIcon />} onClick={handleUpload}>
              Scan Notice
            </Button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-dim sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="animate-slide-down border-t border-border-light bg-surface px-4 pb-4 pt-3 sm:hidden">
            <div className="flex flex-col gap-2">
              <Button variant="primary" size="lg" icon={<CameraIcon />} onClick={handleUpload} className="w-full">
                Scan Notice
              </Button>
              <Button variant="secondary" size="lg" icon={<PenIcon />} onClick={handleAddEvent} className="w-full">
                Add Event
              </Button>
            </div>
          </div>
        )}
      </nav>

      {showPhotoUpload && (
        <PhotoUpload onClose={() => setShowPhotoUpload(false)} onSaved={onEventSaved} />
      )}
      {showEventForm && (
        <EventForm onClose={() => setShowEventForm(false)} onSaved={onEventSaved} />
      )}
    </>
  );
}
