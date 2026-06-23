"use client";

import { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import type { CalendarEvent } from "@/types/event";
import EventDetail from "./EventDetail";

interface CalendarProps {
  refreshKey: number;
  onRefresh: () => void;
}

export default function Calendar({ refreshKey, onRefresh }: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

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
  }));

  const handleEventClick = (info: EventClickArg) => {
    const found = events.find((e) => e.id === info.event.id);
    if (found) setSelectedEvent(found);
  };

  const handleDetailClose = () => setSelectedEvent(null);

  const handleUpdated = () => {
    setSelectedEvent(null);
    onRefresh();
  };

  return (
    <>
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
          eventClick={handleEventClick}
          editable={false}
          selectable={true}
          dayMaxEvents={3}
          fixedWeekCount={false}
          eventClassNames="cursor-pointer"
        />
      </div>

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={handleDetailClose}
          onUpdated={handleUpdated}
        />
      )}
    </>
  );
}
