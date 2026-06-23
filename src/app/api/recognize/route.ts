import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = file.type || "image/jpeg";

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You extract school events from notice images. Return a JSON array of events. Each event has:
- title (string, required)
- start_date (ISO 8601 datetime string, required — use the current year if not specified)
- end_date (ISO 8601 datetime string or null)
- all_day (boolean)
- location (string or null)
- description (string or null — brief summary)

Handle both English and Chinese text. If multiple events are found, return all of them. If no events are found, return an empty array. Return ONLY valid JSON, no markdown fences.`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
            },
          },
          {
            type: "text",
            text: "Extract all school events from this notice. Return JSON array only.",
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content?.trim() ?? "[]";

  let events;
  try {
    events = JSON.parse(content);
    if (!Array.isArray(events)) events = [events];
  } catch {
    return NextResponse.json(
      { error: "Failed to parse events from image", raw: content },
      { status: 422 }
    );
  }

  return NextResponse.json({ events });
}
