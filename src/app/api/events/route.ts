import { NextRequest, NextResponse } from "next/server";

// GET /api/events — list events
export async function GET() {
  // TODO: fetch events from Supabase
  return NextResponse.json({ events: [] });
}

// POST /api/events — create an event
export async function POST(request: NextRequest) {
  // TODO: save event to Supabase
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
