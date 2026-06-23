"use client";

import { useState } from "react";
import PhotoUpload from "./PhotoUpload";
import EventForm from "./EventForm";

export default function NavMenu() {
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-indigo-600">EA Calendar</h1>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPhotoUpload(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              📷 Upload Notice
            </button>
            <button
              onClick={() => setShowEventForm(true)}
              className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
            >
              ✏️ Add Event
            </button>
          </div>
        </div>
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
