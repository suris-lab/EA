"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, DatesSetArg, DayCellContentArg } from "@fullcalendar/core";
import type { CalendarEvent } from "@/types/event";
import EventDetail from "./EventDetail";

interface CalendarProps {
  refreshKey: number;
  onRefresh: () => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function Calendar({ refreshKey, onRefresh }: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const calendarRef = useRef<FullCalendar>(null);
  const isMobile = useIsMobile();

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

  const handleDateClick = (info: { dateStr: string }) => {
    setSelectedDate(info.dateStr);
  };

  const handleDatesSet = (info: DatesSetArg) => {
    setCurrentTitle(info.view.title);
  };

  const navigate = (action: "prev" | "next" | "today") => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (action === "prev") api.prev();
    else if (action === "next") api.next();
    else api.today();
  };

  const eventsForDate = selectedDate
    ? events.filter((e) => {
        const start = e.start_date?.slice(0, 10);
        const end = e.end_date?.slice(0, 10);
        return start === selectedDate || (end && start && selectedDate >= start && selectedDate <= end);
      })
    : [];

  const dayCellContent = (arg: DayCellContentArg) => {
    if (!isMobile) return undefined;
    const dateStr = arg.date.toISOString().slice(0, 10);
    const dayEvents = events.filter((e) => {
      const start = e.start_date?.slice(0, 10);
      const end = e.end_date?.slice(0, 10);
      return start === dateStr || (end && start && dateStr >= start && dateStr <= end);
    });
    const hasEvents = dayEvents.length > 0;

    return (
      <div className="flex flex-col items-center gap-0.5">
        <span>{arg.dayNumberText}</span>
        {hasEvents && (
          <div className="flex gap-0.5">
            {dayEvents.slice(0, 3).map((_, i) => (
              <span key={i} className="h-1 w-1 rounded-full bg-brand-500" />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Custom mobile toolbar */}
      {isMobile && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button onClick={() => navigate("prev")} className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-dim active:bg-gray-100">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => navigate("next")} className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-dim active:bg-gray-100">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <h3 className="ml-1 text-base font-semibold text-text-primary">{currentTitle}</h3>
          </div>
          <button onClick={() => navigate("today")} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-dim active:bg-gray-100">
            Today
          </button>
        </div>
      )}

      <div className="ea-calendar overflow-hidden rounded-2xl border border-border-light bg-surface shadow-sm sm:p-6">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={isMobile ? false : {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          height="auto"
          events={fcEvents}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          datesSet={handleDatesSet}
          editable={false}
          selectable={true}
          dayMaxEvents={isMobile ? 0 : 3}
          fixedWeekCount={false}
          eventClassNames="cursor-pointer"
          dayCellContent={isMobile ? dayCellContent : undefined}
          eventDisplay={isMobile ? "none" : "auto"}
        />
      </div>

      {/* Mobile: event list for selected date */}
      {isMobile && selectedDate && (
        <div className="mt-3 rounded-2xl border border-border-light bg-surface p-4 shadow-sm">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h4>
          {eventsForDate.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-muted">No events</p>
          ) : (
            <div className="space-y-2">
              {eventsForDate.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface-dim active:bg-gray-100"
                >
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{evt.title}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {evt.all_day
                        ? "All day"
                        : new Date(evt.start_date).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      {evt.location && ` · ${evt.location}`}
                    </p>
                  </div>
                  <svg className="mt-1 h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdated={() => {
            setSelectedEvent(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
