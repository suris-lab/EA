import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateICS } from "@/lib/ics";

export async function GET() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const icsContent = generateICS(data ?? []);

  return new NextResponse(icsContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="ea-calendar.ics"',
    },
  });
}
