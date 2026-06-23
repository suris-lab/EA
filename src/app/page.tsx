"use client";

import { useState } from "react";
import Calendar from "@/components/Calendar";
import NavMenu from "@/components/NavMenu";
import Button from "@/components/Button";

function CalendarPlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <line x1="10" y1="16" x2="14" y2="16" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEventSaved = () => setRefreshKey((k) => k + 1);

  const handleExport = () => {
    const webcalUrl = `${window.location.origin}/api/export`;
    window.location.href = webcalUrl;
  };

  const handleShare = async () => {
    const url = "https://ea-calendar.vercel.app/";
    if (navigator.share) {
      await navigator.share({ title: "EA Calendar", text: "Check out my school events calendar", url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <>
      <NavMenu onEventSaved={handleEventSaved} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
                My Calendar
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Your upcoming school events at a glance.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" icon={<ShareIcon />} onClick={handleShare}>
                Share
              </Button>
              <Button variant="secondary" size="sm" icon={<CalendarPlusIcon />} onClick={handleExport}>
                Add to Calendar
              </Button>
            </div>
          </div>
          <Calendar refreshKey={refreshKey} onRefresh={handleEventSaved} />
        </div>
      </main>
    </>
  );
}
