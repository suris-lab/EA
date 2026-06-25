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
      <main className="px-4 pb-28 pt-2 sm:px-6 sm:pb-2 sm:pt-2 lg:px-10">
        <Calendar refreshKey={refreshKey} onRefresh={handleEventSaved} />
      </main>
    </>
  );
}
