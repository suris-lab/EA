"use client";

import { useState } from "react";
import Calendar from "@/components/Calendar";
import NavMenu from "@/components/NavMenu";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEventSaved = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <NavMenu onEventSaved={handleEventSaved} />
      <main className="px-4 pb-28 pt-2 sm:px-6 sm:pb-4 sm:pt-3 lg:px-10">
        {/* Desktop header */}
        <div className="mb-3 hidden sm:block">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">My Calendar</h2>
          <p className="mt-0.5 text-sm text-text-secondary">Your upcoming school events at a glance.</p>
        </div>
        <Calendar refreshKey={refreshKey} onRefresh={handleEventSaved} />
      </main>
    </>
  );
}
