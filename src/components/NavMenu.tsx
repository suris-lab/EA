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
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

export default function NavMenu() {
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
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-extrabold tracking-tight text-indigo-600 sm:text-2xl">
            EA Calendar
          </h1>

          {/* Desktop buttons */}
          <div className="hidden gap-2 sm:flex">
            <Button variant="primary" size="md" icon={<CameraIcon />} onClick={handleUpload}>
              Upload Notice
            </Button>
            <Button variant="secondary" size="md" icon={<PenIcon />} onClick={handleAddEvent}>
              Add Event
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 sm:hidden">
            <div className="flex flex-col gap-2">
              <Button variant="primary" size="md" icon={<CameraIcon />} onClick={handleUpload} className="w-full">
                Upload Notice
              </Button>
              <Button variant="secondary" size="md" icon={<PenIcon />} onClick={handleAddEvent} className="w-full">
                Add Event
              </Button>
            </div>
          </div>
        )}
      </nav>

      {showPhotoUpload && (
        <PhotoUpload onClose={() => setShowPhotoUpload(false)} />
      )}
      {showEventForm && (
        <EventForm onClose={() => setShowEventForm(false)} />
      )}
    </>
  );
}
