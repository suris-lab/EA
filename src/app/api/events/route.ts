import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { CreateEventPayload, RecurrenceRule } from "@/types/event";

export async function GET() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data });
}

function generateOccurrences(
  body: CreateEventPayload,
  recurrence: RecurrenceRule,
  seriesId: string
): CreateEventPayload[] {
  const occurrences: CreateEventPayload[] = [];
  const start = new Date(body.start_date);
  const duration = body.end_date
    ? new Date(body.end_date).getTime() - start.getTime()
    : 0;

  const maxOccurrences = recurrence.noEnd ? 200 : (recurrence.count || 200);
  const endLimit = recurrence.endDate
    ? new Date(recurrence.endDate + "T23:59:59")
    : recurrence.noEnd
      ? new Date(start.getFullYear() + 2, start.getMonth(), start.getDate())
      : new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());

  if (recurrence.frequency === "weekly" && recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
    const interval = recurrence.interval || 1;
    const targetDays = new Set(recurrence.daysOfWeek);
    const weekStart = new Date(start);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    for (let week = 0; occurrences.length < maxOccurrences; week++) {
      const weekBase = new Date(weekStart);
      weekBase.setDate(weekBase.getDate() + week * 7 * interval);

      if (weekBase > endLimit && week > 0) break;

      for (const dow of Array.from(targetDays).sort()) {
        const occDate = new Date(weekBase);
        occDate.setDate(occDate.getDate() + dow);
        occDate.setHours(start.getHours(), start.getMinutes(), start.getSeconds());

        if (occDate < start) continue;
        if (occDate > endLimit) break;
        if (occurrences.length >= maxOccurrences) break;

        const occEnd = duration
          ? new Date(occDate.getTime() + duration).toISOString()
          : null;

        occurrences.push({
          ...body,
          start_date: occDate.toISOString(),
          end_date: occEnd,
          series_id: seriesId,
        });
      }
    }
  } else {
    for (let i = 0; i < maxOccurrences; i++) {
      const occStart = new Date(start);

      switch (recurrence.frequency) {
        case "daily":
          occStart.setDate(occStart.getDate() + i * (recurrence.interval || 1));
          break;
        case "weekly":
          occStart.setDate(occStart.getDate() + i * 7 * (recurrence.interval || 1));
          break;
        case "monthly":
          occStart.setMonth(occStart.getMonth() + i * (recurrence.interval || 1));
          break;
        case "yearly":
          occStart.setFullYear(occStart.getFullYear() + i * (recurrence.interval || 1));
          break;
      }

      if (occStart > endLimit) break;

      const occEnd = duration
        ? new Date(occStart.getTime() + duration).toISOString()
        : null;

      occurrences.push({
        ...body,
        start_date: occStart.toISOString(),
        end_date: occEnd,
        series_id: seriesId,
      });
    }
  }

  return occurrences;
}

export async function POST(request: NextRequest) {
  const body: CreateEventPayload = await request.json();

  if (body.recurrence && body.recurrence.frequency) {
    const seriesId = crypto.randomUUID();
    const occurrences = generateOccurrences(body, body.recurrence, seriesId);

    if (occurrences.length === 0) {
      return NextResponse.json({ error: "No occurrences generated. Check your recurrence settings." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("events")
      .insert(occurrences)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: data });
  }

  const row: Record<string, unknown> = {
    title: body.title,
    start_date: body.start_date,
    end_date: body.end_date || null,
    all_day: body.all_day ?? false,
    location: body.location || null,
    description: body.description || null,
    source: body.source || "manual",
    category: body.category || "school",
  };
  if (body.series_id) row.series_id = body.series_id;
  if (body.recurrence) row.recurrence = body.recurrence;

  const { data, error } = await supabase
    .from("events")
    .insert(row)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}

export async function PATCH(request: NextRequest) {
  const { id, ...updates } = await request.json();

  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}

export async function DELETE(request: NextRequest) {
  const { id, deleteSeries, seriesId } = await request.json();

  if (deleteSeries && seriesId) {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("series_id", seriesId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
