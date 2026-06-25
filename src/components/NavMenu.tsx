"use client";

import { useState, useRef } from "react";
import PhotoUpload from "./PhotoUpload";
import EventForm from "./EventForm";
import { L, BiText } from "@/lib/labels";

function getExportUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin.replace(/^https?/, "webcal") + "/api/export";
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

  const handleExport = () => {
    window.location.href = getExportUrl();
  };

  const handleShare = async () => {
    const url = "https://ea-calendar.vercel.app/";
    if (navigator.share) {
      await navigator.share({ title: L.appName, text: L.shareText, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert(L.linkCopied);
    }
  };

  return (
    <>
      {/* Top nav bar — Apple style */}
      <nav className="sticky top-0 z-50 border-b border-border-light bg-surface/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-2.5 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-text-primary">
              EA Calendar
            </span>
            <span className="text-[10px] font-medium text-text-muted">v1.0.2</span>
          </div>

          {/* Mobile: share + subscribe */}
          <div className="flex items-center gap-0.5 sm:hidden">
            <button onClick={handleShare} className="flex h-9 w-9 items-center justify-center rounded-full text-brand-500 active:bg-surface-dim" aria-label="Share">
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
            <button onClick={handleExport} className="flex h-9 w-9 items-center justify-center rounded-full text-brand-500 active:bg-surface-dim" aria-label="Subscribe">
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="12" y1="14" x2="12" y2="18" /><line x1="10" y1="16" x2="14" y2="16" />
              </svg>
            </button>
          </div>

          {/* Desktop buttons */}
          <div className="hidden items-center gap-3 sm:flex">
            <button onClick={handleShare} className="text-[15px] font-normal text-brand-500 hover:text-brand-600">
              <BiText text={L.share} />
            </button>
            <button onClick={handleExport} className="text-[15px] font-normal text-brand-500 hover:text-brand-600">
              <BiText text={L.subscribe} />
            </button>
            <div className="mx-1 h-4 w-px bg-border-light" />
            <button onClick={handleAddEvent}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[15px] font-normal text-brand-500 transition-colors hover:bg-surface-dim active:bg-border-light">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <BiText text={L.addEvent} />
            </button>
            <button onClick={handleUpload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-600 active:bg-brand-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <BiText text={L.scanNotice} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile fixed bottom toolbar — Apple style */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="border-t border-border bg-surface/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center justify-around px-6 py-2">
            <button onClick={handleAddEvent} className="flex flex-col items-center gap-1 px-5 py-1.5 active:opacity-60" aria-label="Add event">
              <svg className="h-7 w-7 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-[11px] font-medium text-brand-500">Add 新增</span>
            </button>
            <button onClick={handleUpload} className="flex flex-col items-center gap-1 px-5 py-1.5 active:opacity-60" aria-label="Scan notice">
              <svg className="h-7 w-7 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[11px] font-medium text-brand-500">Scan 掃描</span>
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
