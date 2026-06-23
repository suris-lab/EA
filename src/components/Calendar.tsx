"use client";

import { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarEvent } from "@/types/event";

interface CalendarProps {
  refreshKey: number;
}

export default function Calendar({ refreshKey }: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events ?? []);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, refreshKey]);

  const fcEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start_date,
    end: e.end_date ?? undefined,
    allDay: e.all_day ?? false,
    extendedProps: {
      location: e.location,
      description: e.description,
      source: e.source,
    },
  }));

  return (
    <div className="overflow-hidden rounded-2xl border border-border-light bg-surface p-4 shadow-sm sm:p-6">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
        height="auto"
        events={fcEvents}
        editable={false}
        selectable={true}
        dayMaxEvents={3}
        fixedWeekCount={false}
      />
    </div>
  );
}
