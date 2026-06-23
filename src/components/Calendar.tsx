"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function Calendar() {
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
        events={[]}
        editable={false}
        selectable={true}
        dayMaxEvents={3}
        fixedWeekCount={false}
      />
    </div>
  );
}
