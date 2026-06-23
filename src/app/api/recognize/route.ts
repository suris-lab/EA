import { NextRequest, NextResponse } from "next/server";

// POST /api/recognize — send a school notice image to OpenAI Vision, return parsed events
export async function POST(request: NextRequest) {
  // TODO: accept image, call OpenAI Vision, return structured event data
  return NextResponse.json({ message: "Not implemented" }, { status: 501 });
}
