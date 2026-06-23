"use client";

import { useState } from "react";
import Calendar from "@/components/Calendar";
import NavMenu from "@/components/NavMenu";
import Button from "@/components/Button";

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
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
    window.open("/api/export", "_blank");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/api/export`;
    if (navigator.share) {
      await navigator.share({ title: "EA Calendar", url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Export link copied to clipboard!");
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
              <Button variant="secondary" size="sm" icon={<DownloadIcon />} onClick={handleExport}>
                Export
              </Button>
            </div>
          </div>
          <Calendar refreshKey={refreshKey} onRefresh={handleEventSaved} />
        </div>
      </main>
    </>
  );
}
