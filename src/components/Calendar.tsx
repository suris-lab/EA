"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function eventLocalDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return toLocalDate(new Date(iso));
}

function eventsOnDate(events: CalendarEvent[], dateStr: string): CalendarEvent[] {
  return events.filter((e) => {
    const start = eventLocalDate(e.start_date);
    const end = eventLocalDate(e.end_date);
    if (start === dateStr) return true;
    if (end && start && dateStr >= start && dateStr <= end) return true;
    return false;
  });
}

function eventsInMonth(events: CalendarEvent[], year: number, month: number): CalendarEvent[] {
  const startOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
  return events.filter((e) => {
    const start = eventLocalDate(e.start_date);
    const end = eventLocalDate(e.end_date);
    if (start >= startOfMonth && start <= endOfMonth) return true;
    if (end && end >= startOfMonth && start <= endOfMonth) return true;
    return false;
  }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
}

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
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

  const monthlyEvents = useMemo(
    () => eventsInMonth(events, currentYear, currentMonth),
    [events, currentYear, currentMonth]
  );

  const displayedEvents = selectedDate
    ? eventsOnDate(events, selectedDate)
    : monthlyEvents;

  const handleEventClick = (info: EventClickArg) => {
    const found = events.find((e) => e.id === info.event.id);
    if (found) setSelectedEvent(found);
  };

  const handleDateClick = (info: { dateStr: string }) => {
    if (selectedDate === info.dateStr) {
      setSelectedDate(null);
    } else {
      setSelectedDate(info.dateStr);
    }
  };

  const handleDatesSet = (info: DatesSetArg) => {
    const midDate = new Date((info.start.getTime() + info.end.getTime()) / 2);
    setCurrentMonth(midDate.getMonth());
    setCurrentYear(midDate.getFullYear());
    setSelectedDate(null);
  };

  const navigate = (action: "prev" | "next") => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (action === "prev") api.prev();
    else api.next();
  };

  const goToDate = (year: number, month: number) => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    api.gotoDate(new Date(year, month, 1));
  };

  const handleMonthSelect = (month: number) => {
    setShowMonthPicker(false);
    goToDate(currentYear, month);
  };

  const handleYearSelect = (year: number) => {
    setShowYearPicker(false);
    goToDate(year, currentMonth);
  };

  const handleEventListItemClick = (evt: CalendarEvent) => {
    if (selectedDate) {
      setSelectedEvent(evt);
    } else {
      const dateStr = eventLocalDate(evt.start_date);
      setSelectedDate(dateStr);
      const api = calendarRef.current?.getApi();
      if (api) {
        const evtDate = new Date(evt.start_date);
        if (evtDate.getMonth() !== currentMonth || evtDate.getFullYear() !== currentYear) {
          api.gotoDate(evtDate);
        }
      }
      calendarContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const dayCellContent = (arg: DayCellContentArg) => {
    if (!isMobile) return undefined;
    const dateStr = toLocalDate(arg.date);
    const dayEvents = eventsOnDate(events, dateStr);
    const count = dayEvents.length;
    const isSelected = selectedDate === dateStr;

    return (
      <div className={`flex flex-col items-center gap-0.5 ${isSelected ? "selected-date" : ""}`}>
        <span className={isSelected ? "selected-date-number" : ""}>{arg.dayNumberText}</span>
        {count > 0 && (
          <div className="flex gap-0.5">
            {dayEvents.slice(0, 3).map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-brand-500"}`} />
            ))}
            {count > 3 && (
              <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white/60" : "bg-brand-300"}`} />
            )}
          </div>
        )}
      </div>
    );
  };

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear - 5; y <= currentYear + 5; y++) years.push(y);
    return years;
  }, [currentYear]);

  return (
    <>
      {/* Mobile header: [<] Month Year [>] */}
      {isMobile && (
        <div className="mb-3 flex items-center justify-center" ref={calendarContainerRef}>
          <div className="flex w-full items-center">
            {/* Prev */}
            <button
              onClick={() => navigate("prev")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-secondary active:bg-surface-dim"
              aria-label="Previous month"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Month + Year — absolutely centred */}
            <div className="flex flex-1 items-center justify-center gap-1.5">
              {/* Month picker */}
              <div className="relative">
                <button
                  onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
                  className="rounded-lg px-2 py-1.5 text-base font-semibold text-text-primary active:bg-surface-dim"
                  aria-label="Select month"
                >
                  {MONTHS[currentMonth]}
                </button>
                {showMonthPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
                    <div className="absolute left-1/2 top-full z-50 mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-2xl border border-border-light bg-surface shadow-xl" role="listbox" aria-label="Month">
                      <div className="max-h-72 overflow-y-auto overscroll-contain py-1">
                        {MONTHS.map((m, i) => (
                          <button
                            key={m}
                            onClick={() => handleMonthSelect(i)}
                            role="option"
                            aria-selected={i === currentMonth}
                            className={`flex h-11 w-full items-center px-4 text-sm transition-colors active:bg-surface-dim ${
                              i === currentMonth
                                ? "font-semibold text-brand-500"
                                : "text-text-primary"
                            }`}
                          >
                            {m}
                            {i === currentMonth && (
                              <svg className="ml-auto h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Year picker */}
              <div className="relative">
                <button
                  onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
                  className="rounded-lg px-2 py-1.5 text-base font-semibold text-text-secondary active:bg-surface-dim"
                  aria-label="Select year"
                >
                  {currentYear}
                </button>
                {showYearPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowYearPicker(false)} />
                    <div className="absolute left-1/2 top-full z-50 mt-2 w-32 -translate-x-1/2 overflow-hidden rounded-2xl border border-border-light bg-surface shadow-xl" role="listbox" aria-label="Year">
                      <div className="max-h-72 overflow-y-auto overscroll-contain py-1">
                        {yearOptions.map((y) => (
                          <button
                            key={y}
                            onClick={() => handleYearSelect(y)}
                            role="option"
                            aria-selected={y === currentYear}
                            className={`flex h-11 w-full items-center justify-center text-sm transition-colors active:bg-surface-dim ${
                              y === currentYear
                                ? "font-semibold text-brand-500"
                                : "text-text-primary"
                            }`}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Next */}
            <button
              onClick={() => navigate("next")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-secondary active:bg-surface-dim"
              aria-label="Next month"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Calendar grid */}
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

      {/* Event list below calendar */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-border-light bg-surface-dim shadow-sm">
        {/* List header */}
        <div className="flex items-center justify-between border-b border-border-light bg-surface px-4 py-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {selectedDate
              ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : `${MONTHS[currentMonth]} ${currentYear}`}
          </h4>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="flex h-8 items-center rounded-full bg-surface-dim px-3 text-xs font-medium text-brand-500 transition-colors active:bg-gray-100"
            >
              Show all
            </button>
          )}
        </div>

        {/* Event rows */}
        <div className="divide-y divide-border-light">
          {displayedEvents.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-text-muted">
              {selectedDate
                ? "No events scheduled for this date."
                : `No events in ${MONTHS[currentMonth]}.`}
            </p>
          ) : (
            displayedEvents.map((evt) => (
              <button
                key={evt.id}
                onClick={() => handleEventListItemClick(evt)}
                className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface active:bg-gray-50"
              >
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">{evt.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-text-secondary">
                    {!selectedDate && (
                      <span>{formatEventDate(evt.start_date)}</span>
                    )}
                    <span>
                      {evt.all_day
                        ? "All day"
                        : formatEventTime(evt.start_date) +
                          (evt.end_date ? ` – ${formatEventTime(evt.end_date)}` : "")}
                    </span>
                    {evt.location && (
                      <>
                        <span className="text-text-muted">·</span>
                        <span className="text-text-muted">{evt.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <svg className="mt-1.5 h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))
          )}
        </div>
      </div>

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
