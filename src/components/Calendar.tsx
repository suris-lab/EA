"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, DatesSetArg, DayCellContentArg, EventDropArg } from "@fullcalendar/core";
import type { CalendarEvent } from "@/types/event";
import { CATEGORIES, getCategoryColor, getCategoryHex } from "@/types/event";
import { toLocalDate, eventLocalDate, eventsOnDate, formatEventDate, formatEventTime } from "@/lib/date-utils";
import { getHKHolidays, getHolidayMap, type HKHoliday } from "@/lib/hk-holidays";
import { getLunarInfo, getLunarInfoFromDateStr } from "@/lib/lunar";
import EventDetail from "./EventDetail";
import EventForm from "./EventForm";
import Toast from "./Toast";

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
  year: number, month: number, selectedDate: string | null,
  searchQuery: string, categoryFilter: string | null
): DisplayItem[] {
  const startOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;
  const items: DisplayItem[] = [];
  const q = searchQuery.toLowerCase().trim();

  if (!q && !categoryFilter) {
    for (const h of holidays) {
      if (h.date >= startOfMonth && h.date <= endOfMonth) {
        if (!selectedDate || h.date === selectedDate) {
          items.push({ type: "holiday", holiday: h, dateStr: h.date });
        }
      }
    }
  }

  let filteredEvents = selectedDate
    ? eventsOnDate(events, selectedDate) as CalendarEvent[]
    : events.filter((e) => {
        const start = eventLocalDate(e.start_date);
        const end = eventLocalDate(e.end_date);
        return (start >= startOfMonth && start <= endOfMonth) || (end && end >= startOfMonth && start <= endOfMonth);
      });

  if (q) {
    filteredEvents = filteredEvents.filter((e) =>
      (e.title || "").toLowerCase().includes(q) ||
      (e.location || "").toLowerCase().includes(q) ||
      (e.description || "").toLowerCase().includes(q)
    );
  }

  if (categoryFilter) {
    filteredEvents = filteredEvents.filter((e) => (e.category || "school") === categoryFilter);
  }

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
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; action?: { label: string; onClick: () => void } } | null>(null);
  const [duplicateEvent, setDuplicateEvent] = useState<CalendarEvent | null>(null);
  const [mobileView, setMobileView] = useState<"month" | "week">("month");
  const [desktopView, setDesktopView] = useState<"month" | "week">("month");
  const calendarRef = useRef<FullCalendar>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const isMobile = useIsMobile();

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedQuery(val), 300);
  };

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

  const fcEvents = events.map((e) => {
    const hex = getCategoryHex(e.category);
    return {
      id: e.id, title: e.title || "Untitled", start: e.start_date,
      end: e.end_date ?? undefined, allDay: e.all_day ?? false,
      borderColor: hex,
      backgroundColor: hex,
      textColor: "#111827",
    };
  });

  const displayItems = useMemo(
    () => getDisplayItems(events, holidays, currentYear, currentMonth, selectedDate, debouncedQuery, categoryFilter),
    [events, holidays, currentYear, currentMonth, selectedDate, debouncedQuery, categoryFilter]
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

  const handleEventDrop = async (info: EventDropArg) => {
    const evt = events.find((e) => e.id === info.event.id);
    if (!evt) { info.revert(); return; }

    const oldStart = new Date(evt.start_date);
    const newStart = info.event.start;
    if (!newStart) { info.revert(); return; }

    const delta = newStart.getTime() - oldStart.getTime();
    const newStartISO = new Date(oldStart.getTime() + delta).toISOString();
    const newEndISO = evt.end_date ? new Date(new Date(evt.end_date).getTime() + delta).toISOString() : null;

    const oldEvent = { ...evt };

    const res = await fetch("/api/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: evt.id, start_date: newStartISO, end_date: newEndISO }),
    });

    if (res.ok) {
      onRefresh();
      setToast({
        message: `Event moved to ${formatEventDate(newStartISO)}`,
        action: {
          label: "Undo",
          onClick: async () => {
            await fetch("/api/events", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: oldEvent.id, start_date: oldEvent.start_date, end_date: oldEvent.end_date }),
            });
            onRefresh();
            setToast(null);
          },
        },
      });
    } else {
      info.revert();
    }
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

  const switchMobileView = (view: "month" | "week") => {
    setMobileView(view);
    const api = calendarRef.current?.getApi();
    if (api) api.changeView(view === "week" ? "timeGridWeek" : "dayGridMonth");
  };

  const switchDesktopView = (view: "month" | "week") => {
    setDesktopView(view);
    const api = calendarRef.current?.getApi();
    if (api) api.changeView(view === "week" ? "timeGridWeek" : "dayGridMonth");
  };

  const goToday = () => {
    const api = calendarRef.current?.getApi();
    if (api) api.today();
  };

  const isWeekView = isMobile ? mobileView === "week" : desktopView === "week";

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

  const handleDuplicate = (evt: CalendarEvent) => {
    setDuplicateEvent(evt);
  };

  const handleDeleteWithUndo = (deletedEvent: CalendarEvent) => {
    setToast({
      message: "Event deleted",
      action: {
        label: "Undo",
        onClick: async () => {
          await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: deletedEvent.title,
              start_date: deletedEvent.start_date,
              end_date: deletedEvent.end_date,
              all_day: deletedEvent.all_day,
              location: deletedEvent.location,
              description: deletedEvent.description,
              category: deletedEvent.category,
              source: deletedEvent.source,
            }),
          });
          onRefresh();
          setToast(null);
        },
      },
    });
  };

  const dayCellContent = (arg: DayCellContentArg) => {
    if (!isMobile) return undefined;
    const dateStr = toLocalDate(arg.date);
    const dayEvents = eventsOnDate(events, dateStr) as CalendarEvent[];
    const isHoliday = holidayMap.has(dateStr);
    const isSelected = selectedDate === dateStr;
    const lunar = getLunarInfo(arg.date.getFullYear(), arg.date.getMonth() + 1, arg.date.getDate());
    const hasFestival = lunar.festivals.length > 0;

    let lunarColor = "text-text-muted";
    if (isSelected) lunarColor = "text-white/70";
    else if (isHoliday) lunarColor = "text-red-400";
    else if (hasFestival) lunarColor = "text-brand-500 font-medium";

    return (
      <div className="date-cell-wrapper" role="gridcell"
        aria-label={`${arg.date.getDate()} ${MONTHS[arg.date.getMonth()]} ${arg.date.getFullYear()}，農曆${lunar.fullLabel}${isHoliday ? `，Hong Kong Public Holiday: ${holidayMap.get(dateStr)!.name}` : ""}`}>
        <div className={`date-cell-content ${isSelected ? "date-cell-selected" : ""} ${isSelected && isHoliday ? "date-cell-selected-holiday" : ""}`}>
          <span className={`date-cell-number ${!isSelected && isHoliday ? "holiday-date-number" : ""}`}>{arg.dayNumberText}</span>
          <span className={`lunar-label ${lunarColor}`}>{lunar.cellLabel}</span>
        </div>
        <div className="flex gap-0.5" style={{ minHeight: 6 }}>
          {isHoliday && <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-red-500"}`} />}
          {dayEvents.slice(0, isHoliday ? 2 : 3).map((evt, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : getCategoryColor(evt.category)}`} />
          ))}
        </div>
      </div>
    );
  };

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear - 5; y <= currentYear + 5; y++) years.push(y);
    return years;
  }, [currentYear]);

  const isToday = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

  const sidebarContent = (
    <>
      {/* Header + search */}
      <div className="bg-surface px-4 py-3 lg:rounded-t-2xl">
        <div className="flex items-center justify-between">
          <h4 className="text-[13px] font-semibold text-text-secondary">
            {selectedDate
              ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
              : `${MONTHS[currentMonth]} ${currentYear}`}
          </h4>
          {selectedDate && (
            <button onClick={() => setSelectedDate(null)} className="rounded-xl bg-surface-dim px-4 py-1.5 text-[13px] font-medium text-brand-500 transition-all active:opacity-70 hover:bg-brand-50">Show all</button>
          )}
        </div>

        {/* Lunar info */}
        {selectedDate && selectedLunar && (
          <div className="mt-2 space-y-0.5 text-[13px] text-text-secondary">
            <p><span className="text-text-muted">農曆：</span><span className="font-medium text-text-primary">{selectedLunar.fullLabel}</span></p>
            <p><span className="text-text-muted">生肖：</span><span>{selectedLunar.yearShengXiao}</span></p>
            {selectedLunar.solarTerm && <p><span className="text-text-muted">節氣：</span><span className="font-medium text-brand-500">{selectedLunar.solarTerm}</span></p>}
            {selectedLunar.festivals.length > 0 && <p><span className="text-text-muted">節日：</span><span className="font-medium text-amber-600">{selectedLunar.festivals.join("、")}</span></p>}
          </div>
        )}

        {/* Search */}
        <div className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.3-4.3" />
            </svg>
            <input type="text" value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search events..."
              className="w-full h-9 rounded-lg bg-surface-dim pl-9 pr-8 text-[14px] text-text-primary placeholder:text-text-muted focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setDebouncedQuery(""); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-text-muted hover:text-text-secondary">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Category filter */}
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          <button onClick={() => setCategoryFilter(null)}
            className={`shrink-0 h-8 rounded-full px-3.5 text-[12px] font-semibold transition-all ${!categoryFilter ? "bg-brand-500 text-white" : "bg-surface-dim text-text-secondary hover:bg-border-light active:opacity-70"}`}>
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat.value} onClick={() => setCategoryFilter(categoryFilter === cat.value ? null : cat.value)}
              className={`shrink-0 h-8 rounded-full px-3.5 text-[12px] font-semibold transition-all ${categoryFilter === cat.value ? `${cat.color} text-white` : "bg-surface-dim text-text-secondary hover:bg-border-light active:opacity-70"}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event rows */}
      <div className="divide-y divide-border-light">
        {displayItems.length === 0 ? (
          <div className="px-4 py-8 text-center">
            {debouncedQuery ? (
              <p className="text-[13px] text-text-muted">No events matching &ldquo;{debouncedQuery}&rdquo;</p>
            ) : events.length === 0 && !selectedDate ? (
              <div>
                <p className="text-[13px] font-medium text-text-secondary">No events yet!</p>
                <p className="mt-1 text-[12px] text-text-muted">Scan a school notice or add one manually.</p>
              </div>
            ) : (
              <p className="text-[13px] text-text-muted">
                {selectedDate ? "No events scheduled for this date." : `No events in ${MONTHS[currentMonth]}.`}
              </p>
            )}
          </div>
        ) : (
          displayItems.map((item, idx) =>
            item.type === "holiday" && item.holiday ? (
              <button key={`h-${item.holiday.date}-${idx}`} onClick={() => handleListItemClick(item)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface active:bg-gray-50"
                aria-label={`Hong Kong Public Holiday: ${item.holiday.name}`}>
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-red-600">{item.holiday.name}</p>
                  <p className="text-[12px] text-red-400">{item.holiday.nameCN}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[12px] text-text-secondary">
                    {!selectedDate && <span>{new Date(item.holiday.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>}
                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">HK Public Holiday</span>
                  </div>
                </div>
              </button>
            ) : item.event ? (
              <button key={item.event.id} onClick={() => handleListItemClick(item)}
                className="group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface active:bg-gray-50">
                <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${getCategoryColor(item.event.category)}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-text-primary">{item.event.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-text-secondary">
                    {!selectedDate && <span>{formatEventDate(item.event.start_date)}</span>}
                    <span>{item.event.all_day ? "All day" : formatEventTime(item.event.start_date) + (item.event.end_date ? ` – ${formatEventTime(item.event.end_date)}` : "")}</span>
                    {item.event.location && (<><span className="text-text-muted">·</span><span className="text-text-muted">{item.event.location}</span></>)}
                  </div>
                </div>
                <svg className="mt-1.5 h-4 w-4 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : null
          )
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header */}
      {isMobile && (
        <div className="mb-3" ref={calendarContainerRef}>
          {/* Month / Week toggle — own row */}
          <div className="mb-2 flex justify-center">
            <div className="inline-flex rounded-full bg-surface-dim p-0.5">
              <button onClick={() => switchMobileView("month")}
                className={`h-7 rounded-full px-4 text-[13px] font-medium transition-all ${mobileView === "month" ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary"}`}>
                Month
              </button>
              <button onClick={() => switchMobileView("week")}
                className={`h-7 rounded-full px-4 text-[13px] font-medium transition-all ${mobileView === "week" ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary"}`}>
                Week
              </button>
            </div>
          </div>

          {/* Month/Year nav */}
          <div className="flex w-full items-center">
            <button onClick={() => navigate("prev")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-secondary active:bg-surface-dim" aria-label="Previous month">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex flex-1 items-center justify-center gap-1.5">
              <div className="relative">
                <button onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }} className="rounded-lg px-2 py-1.5 text-base font-semibold text-text-primary active:bg-surface-dim" aria-label="Select month">{MONTHS[currentMonth]}</button>
                {showMonthPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
                    <div className="absolute left-1/2 top-full z-50 mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-2xl bg-surface shadow-xl" role="listbox">
                      <div className="max-h-72 overflow-y-auto overscroll-contain py-1">
                        {MONTHS.map((m, i) => (
                          <button key={m} onClick={() => handleMonthSelect(i)} role="option" aria-selected={i === currentMonth}
                            className={`flex h-11 w-full items-center px-4 text-[15px] active:bg-surface-dim ${i === currentMonth ? "font-semibold text-brand-500" : "text-text-primary"}`}>
                            {m}{i === currentMonth && <svg className="ml-auto h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="relative">
                <button onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }} className="rounded-lg px-2 py-1.5 text-base font-semibold text-text-secondary active:bg-surface-dim" aria-label="Select year">{currentYear}</button>
                {showYearPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowYearPicker(false)} />
                    <div className="absolute left-1/2 top-full z-50 mt-2 w-32 -translate-x-1/2 overflow-hidden rounded-2xl bg-surface shadow-xl" role="listbox">
                      <div className="max-h-72 overflow-y-auto overscroll-contain py-1">
                        {yearOptions.map((y) => (
                          <button key={y} onClick={() => handleYearSelect(y)} role="option" aria-selected={y === currentYear}
                            className={`flex h-11 w-full items-center justify-center text-[15px] active:bg-surface-dim ${y === currentYear ? "font-semibold text-brand-500" : "text-text-primary"}`}>{y}</button>
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

      {/* Desktop toolbar — Apple Calendar style */}
      {!isMobile && (
        <div className="mb-4 flex items-center justify-between" ref={calendarContainerRef}>
          <div className="flex items-center gap-3">
            <button onClick={goToday}
              className={`h-8 rounded-lg border px-3 text-[13px] font-medium transition-colors ${isToday ? "border-border-light text-text-muted" : "border-border text-text-primary hover:bg-surface"}`}
              disabled={isToday}>
              Today
            </button>
            <div className="flex items-center">
              <button onClick={() => navigate("prev")} className="flex h-8 w-8 items-center justify-center rounded-l-lg border border-border-light text-text-secondary transition-colors hover:bg-surface" aria-label="Previous">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => navigate("next")} className="flex h-8 w-8 items-center justify-center rounded-r-lg border border-l-0 border-border-light text-text-secondary transition-colors hover:bg-surface" aria-label="Next">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <button onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
                  className="rounded-lg px-1.5 py-1 text-[22px] font-bold tracking-tight text-text-primary transition-colors hover:bg-surface-dim">
                  {MONTHS[currentMonth]}
                </button>
                {showMonthPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMonthPicker(false)} />
                    <div className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl bg-surface shadow-xl ring-1 ring-border-light" role="listbox">
                      <div className="max-h-72 overflow-y-auto overscroll-contain py-1">
                        {MONTHS.map((m, i) => (
                          <button key={m} onClick={() => handleMonthSelect(i)} role="option" aria-selected={i === currentMonth}
                            className={`flex h-9 w-full items-center px-3.5 text-[14px] transition-colors hover:bg-surface-dim ${i === currentMonth ? "font-semibold text-brand-500" : "text-text-primary"}`}>
                            {m}{i === currentMonth && <svg className="ml-auto h-3.5 w-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="relative">
                <button onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
                  className="rounded-lg px-1.5 py-1 text-[22px] font-bold tracking-tight text-text-secondary transition-colors hover:bg-surface-dim">
                  {currentYear}
                </button>
                {showYearPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowYearPicker(false)} />
                    <div className="absolute left-0 top-full z-50 mt-1 w-28 overflow-hidden rounded-xl bg-surface shadow-xl ring-1 ring-border-light" role="listbox">
                      <div className="max-h-72 overflow-y-auto overscroll-contain py-1">
                        {yearOptions.map((y) => (
                          <button key={y} onClick={() => handleYearSelect(y)} role="option" aria-selected={y === currentYear}
                            className={`flex h-9 w-full items-center justify-center text-[14px] transition-colors hover:bg-surface-dim ${y === currentYear ? "font-semibold text-brand-500" : "text-text-primary"}`}>{y}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Segmented control */}
          <div className="inline-flex rounded-lg bg-surface-dim p-0.5">
            <button onClick={() => switchDesktopView("month")}
              className={`h-7 rounded-md px-4 text-[13px] font-medium transition-all ${desktopView === "month" ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>
              Month
            </button>
            <button onClick={() => switchDesktopView("week")}
              className={`h-7 rounded-md px-4 text-[13px] font-medium transition-all ${desktopView === "week" ? "bg-surface text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}>
              Week
            </button>
          </div>
        </div>
      )}

      {/* Two-column layout on desktop */}
      <div className="lg:flex lg:gap-5 lg:items-start">
        {/* Calendar grid */}
        <div className="ea-calendar overflow-hidden rounded-2xl bg-surface lg:flex-1 lg:min-w-0">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            height={isMobile ? (isWeekView ? "calc(100vh - 180px)" : "auto") : (isWeekView ? "calc(100vh - 140px)" : "auto")}
            aspectRatio={isMobile ? undefined : 1.5}
            expandRows={isWeekView}
            events={fcEvents}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            editable={!isMobile}
            eventDrop={handleEventDrop}
            selectable={true}
            dayMaxEvents={isMobile && !isWeekView ? 0 : (isWeekView ? 20 : 4)}
            fixedWeekCount={false}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
            slotLabelFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
            scrollTime={(() => { const h = Math.max(0, new Date().getHours() - 1); return `${String(h).padStart(2, "0")}:00:00`; })()}
            allDaySlot={true}
            allDayText="All day"
            nowIndicator={true}
            eventClassNames="cursor-pointer"
            dayCellContent={isMobile && !isWeekView ? dayCellContent : undefined}
            eventDisplay={isMobile && !isWeekView ? "none" : "auto"}
            displayEventTime={!isMobile || isWeekView}
            eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
            dayCellClassNames={(arg) => {
              const dateStr = toLocalDate(arg.date);
              const classes: string[] = [];
              if (holidayMap.has(dateStr)) classes.push("hk-holiday-cell");
              if (dateStr === selectedDate) classes.push("fc-day-active");
              return classes;
            }}
          />
        </div>

        {/* Sidebar — desktop only */}
        <div className="hidden lg:block lg:w-[340px] lg:shrink-0">
          <div className="sticky top-[57px] max-h-[calc(100vh-73px)] overflow-hidden rounded-2xl bg-surface-dim">
            <div className="flex max-h-[calc(100vh-73px)] flex-col">
              <div className="shrink-0">{/* Search + filters header rendered inline */}</div>
              <div className="flex-1 overflow-y-auto overscroll-contain hide-scrollbar">
                {sidebarContent}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile event list — below calendar */}
        <div className="mt-3 overflow-hidden rounded-2xl bg-surface-dim lg:hidden">
          {sidebarContent}
        </div>
      </div>

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdated={() => { setSelectedEvent(null); onRefresh(); }}
          onDuplicate={handleDuplicate}
        />
      )}

      {duplicateEvent && (
        <EventForm
          onClose={() => setDuplicateEvent(null)}
          onSaved={() => { setDuplicateEvent(null); onRefresh(); }}
          prefill={{ title: duplicateEvent.title, location: duplicateEvent.location || "", description: duplicateEvent.description || "", category: duplicateEvent.category || "school" }}
        />
      )}

      {toast && <Toast message={toast.message} action={toast.action} onDismiss={() => setToast(null)} />}
    </>
  );
}
