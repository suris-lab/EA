"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, DatesSetArg, DayCellContentArg } from "@fullcalendar/core";
import type { CalendarEvent } from "@/types/event";
import { getHKHolidays, getHolidayMap, type HKHoliday } from "@/lib/hk-holidays";
import { getLunarInfo, getLunarInfoFromDateStr } from "@/lib/lunar";
import EventDetail from "./EventDetail";

interface CalendarProps {
  refreshKey: number;
  onRefresh: () => void;
}

interface DisplayItem {
  type: "event" | "holiday";
  event?: CalendarEvent;
  holiday?: HKHoliday;
  dateStr: string;
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

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
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

function getDisplayItems(
  events: CalendarEvent[], holidays: HKHoliday[],
  year: number, month: number, selectedDate: string | null
): DisplayItem[] {
  const startOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
  const items: DisplayItem[] = [];

  for (const h of holidays) {
    if (h.date >= startOfMonth && h.date <= endOfMonth) {
      if (!selectedDate || h.date === selectedDate) {
        items.push({ type: "holiday", holiday: h, dateStr: h.date });
      }
    }
  }

  const filteredEvents = selectedDate
    ? eventsOnDate(events, selectedDate)
    : events.filter((e) => {
        const start = eventLocalDate(e.start_date);
        const end = eventLocalDate(e.end_date);
        return (start >= startOfMonth && start <= endOfMonth) || (end && end >= startOfMonth && start <= endOfMonth);
      });

  for (const e of filteredEvents) {
    items.push({ type: "event", event: e, dateStr: eventLocalDate(e.start_date) });
  }

  items.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  return items;
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

  useEffect(() => { fetchEvents(); }, [fetchEvents, refreshKey]);

  const holidays = useMemo(() => getHKHolidays(currentYear), [currentYear]);
  const holidayMap = useMemo(() => getHolidayMap(currentYear), [currentYear]);

  const fcEvents = events.map((e) => ({
    id: e.id, title: e.title, start: e.start_date,
    end: e.end_date ?? undefined, allDay: e.all_day ?? false,
  }));

  const displayItems = useMemo(
    () => getDisplayItems(events, holidays, currentYear, currentMonth, selectedDate),
    [events, holidays, currentYear, currentMonth, selectedDate]
  );

  const selectedLunar = useMemo(
    () => selectedDate ? getLunarInfoFromDateStr(selectedDate) : null,
    [selectedDate]
  );

  const handleEventClick = (info: EventClickArg) => {
    const found = events.find((e) => e.id === info.event.id);
    if (found) setSelectedEvent(found);
  };

  const handleDateClick = (info: { dateStr: string }) => {
    setSelectedDate(selectedDate === info.dateStr ? null : info.dateStr);
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
    if (action === "prev") api.prev(); else api.next();
  };

  const goToDate = (year: number, month: number) => {
    calendarRef.current?.getApi()?.gotoDate(new Date(year, month, 1));
  };

  const handleMonthSelect = (month: number) => { setShowMonthPicker(false); goToDate(currentYear, month); };
  const handleYearSelect = (year: number) => { setShowYearPicker(false); goToDate(year, currentMonth); };

  const handleListItemClick = (item: DisplayItem) => {
    if (item.type === "holiday" && item.holiday) {
      const dateStr = item.holiday.date;
      if (selectedDate === dateStr) return;
      setSelectedDate(dateStr);
      const api = calendarRef.current?.getApi();
      const d = new Date(dateStr + "T12:00:00");
      if (api && (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear)) api.gotoDate(d);
      calendarContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (item.type === "event" && item.event) {
      if (selectedDate) {
        setSelectedEvent(item.event);
      } else {
        const dateStr = eventLocalDate(item.event.start_date);
        setSelectedDate(dateStr);
        const api = calendarRef.current?.getApi();
        const evtDate = new Date(item.event.start_date);
        if (api && (evtDate.getMonth() !== currentMonth || evtDate.getFullYear() !== currentYear)) api.gotoDate(evtDate);
        calendarContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const dayCellContent = (arg: DayCellContentArg) => {
    if (!isMobile) return undefined;
    const dateStr = toLocalDate(arg.date);
    const dayEvents = eventsOnDate(events, dateStr);
    const isHoliday = holidayMap.has(dateStr);
    const isSelected = selectedDate === dateStr;
    const lunar = getLunarInfo(arg.date.getFullYear(), arg.date.getMonth() + 1, arg.date.getDate());
    const hasFestival = lunar.festivals.length > 0;

    const lunarLabel = lunar.cellLabel;
    const isFestivalOrTerm = hasFestival || !!lunar.solarTerm;

    const ariaParts = [
      `${arg.date.getDate()} ${MONTHS[arg.date.getMonth()]} ${arg.date.getFullYear()}`,
      `農曆${lunar.fullLabel}`,
    ];
    if (isHoliday) ariaParts.push(`Hong Kong Public Holiday: ${holidayMap.get(dateStr)!.name}`);
    if (hasFestival) ariaParts.push(lunar.festivals.join("、"));

    return (
      <div
        className={`flex flex-col items-center gap-0 ${isSelected ? "selected-date" : ""}`}
        role="gridcell"
        aria-label={ariaParts.join("，")}
      >
        <span className={`${isSelected ? "selected-date-number" : ""} ${!isSelected && isHoliday ? "holiday-date-number" : ""}`}>
          {arg.dayNumberText}
        </span>
        <span className={`lunar-label ${isSelected ? "text-white/70" : isFestivalOrTerm ? "text-brand-500 font-medium" : isHoliday ? "text-red-400" : "text-text-muted"}`}>
          {lunarLabel}
        </span>
        <div className="flex gap-0.5">
          {isHoliday && (
            <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-red-500"}`} />
          )}
          {dayEvents.slice(0, isHoliday ? 2 : 3).map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-brand-500"}`} />
          ))}
          {dayEvents.length > (isHoliday ? 2 : 3) && (
            <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white/60" : "bg-brand-300"}`} />
          )}
        </div>
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
      {/* Mobile header */}
      {isMobile && (
        <div className="mb-3 flex items-center justify-center" ref={calendarContainerRef}>
          <div className="flex w-full items-center">
            <button onClick={() => navigate("prev")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-secondary active:bg-surface-dim" aria-label="Previous month">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex flex-1 items-center justify-center gap-1.5">
              <div className="relative">
                <button onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }} className="rounded-lg px-2 py-1.5 text-base font-semibold text-text-primary active:bg-surface-dim" aria-label="Select month">
                  {MONTHS[currentMonth]}
                </button>
                {showMonthPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
                    <div className="absolute left-1/2 top-full z-50 mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-2xl border border-border-light bg-surface shadow-xl" role="listbox">
                      <div className="max-h-72 overflow-y-auto overscroll-contain py-1">
                        {MONTHS.map((m, i) => (
                          <button key={m} onClick={() => handleMonthSelect(i)} role="option" aria-selected={i === currentMonth}
                            className={`flex h-11 w-full items-center px-4 text-sm active:bg-surface-dim ${i === currentMonth ? "font-semibold text-brand-500" : "text-text-primary"}`}>
                            {m}
                            {i === currentMonth && <svg className="ml-auto h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="relative">
                <button onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }} className="rounded-lg px-2 py-1.5 text-base font-semibold text-text-secondary active:bg-surface-dim" aria-label="Select year">
                  {currentYear}
                </button>
                {showYearPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowYearPicker(false)} />
                    <div className="absolute left-1/2 top-full z-50 mt-2 w-32 -translate-x-1/2 overflow-hidden rounded-2xl border border-border-light bg-surface shadow-xl" role="listbox">
                      <div className="max-h-72 overflow-y-auto overscroll-contain py-1">
                        {yearOptions.map((y) => (
                          <button key={y} onClick={() => handleYearSelect(y)} role="option" aria-selected={y === currentYear}
                            className={`flex h-11 w-full items-center justify-center text-sm active:bg-surface-dim ${y === currentYear ? "font-semibold text-brand-500" : "text-text-primary"}`}>
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button onClick={() => navigate("next")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-secondary active:bg-surface-dim" aria-label="Next month">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
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
          headerToolbar={isMobile ? false : { left: "prev,next today", center: "title", right: "dayGridMonth,dayGridWeek" }}
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
          dayCellClassNames={(arg) => {
            const dateStr = toLocalDate(arg.date);
            return holidayMap.has(dateStr) ? ["hk-holiday-cell"] : [];
          }}
        />
      </div>

      {/* Event + Holiday list */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-border-light bg-surface-dim shadow-sm">
        <div className="border-b border-border-light bg-surface px-4 py-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {selectedDate
                ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
                : `${MONTHS[currentMonth]} ${currentYear}`}
            </h4>
            {selectedDate && (
              <button onClick={() => setSelectedDate(null)} className="flex h-8 items-center rounded-full bg-surface-dim px-3 text-xs font-medium text-brand-500 active:bg-gray-100">
                Show all
              </button>
            )}
          </div>

          {/* Lunar info for selected date */}
          {selectedDate && selectedLunar && (
            <div className="mt-2 space-y-0.5 text-xs text-text-secondary" aria-label={`${selectedDate.replace(/-/g, "年").replace(/年(\d+)年/, "年$1月")}，農曆${selectedLunar.fullLabel}`}>
              <p>
                <span className="text-text-muted">農曆：</span>
                <span className="font-medium text-text-primary">{selectedLunar.fullLabel}</span>
              </p>
              <p>
                <span className="text-text-muted">生肖：</span>
                <span>{selectedLunar.yearShengXiao}</span>
              </p>
              {selectedLunar.solarTerm && (
                <p>
                  <span className="text-text-muted">節氣：</span>
                  <span className="font-medium text-brand-500">{selectedLunar.solarTerm}</span>
                </p>
              )}
              {selectedLunar.festivals.length > 0 && (
                <p>
                  <span className="text-text-muted">節日：</span>
                  <span className="font-medium text-amber-600">{selectedLunar.festivals.join("、")}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="divide-y divide-border-light">
          {displayItems.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-text-muted">
              {selectedDate ? "No events scheduled for this date." : `No events in ${MONTHS[currentMonth]}.`}
            </p>
          ) : (
            displayItems.map((item, idx) =>
              item.type === "holiday" && item.holiday ? (
                <button key={`holiday-${item.holiday.date}-${idx}`} onClick={() => handleListItemClick(item)}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface active:bg-gray-50"
                  aria-label={`Hong Kong Public Holiday: ${item.holiday.name}`}>
                  <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-red-600">{item.holiday.name}</p>
                    <p className="text-xs text-red-400">{item.holiday.nameCN}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-text-secondary">
                      {!selectedDate && <span>{new Date(item.holiday.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>}
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">HK Public Holiday</span>
                    </div>
                  </div>
                </button>
              ) : item.event ? (
                <button key={item.event.id} onClick={() => handleListItemClick(item)}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface active:bg-gray-50">
                  <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{item.event.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-text-secondary">
                      {!selectedDate && <span>{formatEventDate(item.event.start_date)}</span>}
                      <span>{item.event.all_day ? "All day" : formatEventTime(item.event.start_date) + (item.event.end_date ? ` – ${formatEventTime(item.event.end_date)}` : "")}</span>
                      {item.event.location && (<><span className="text-text-muted">·</span><span className="text-text-muted">{item.event.location}</span></>)}
                    </div>
                  </div>
                  <svg className="mt-1.5 h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : null
            )
          )}
        </div>
      </div>

      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} onUpdated={() => { setSelectedEvent(null); onRefresh(); }} />
      )}
    </>
  );
}
