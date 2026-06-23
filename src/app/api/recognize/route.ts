import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  const bracketStart = text.indexOf("[");
  const braceStart = text.indexOf("{");
  if (bracketStart === -1 && braceStart === -1) return text;

  const start = bracketStart !== -1 && (braceStart === -1 || bracketStart < braceStart)
    ? bracketStart
    : braceStart;

  let depth = 0;
  const open = text[start];
  const close = open === "[" ? "]" : "}";
  for (let i = start; i < text.length; i++) {
    if (text[i] === open) depth++;
    if (text[i] === close) depth--;
    if (depth === 0) return text.slice(start, i + 1);
  }

  return text.slice(start);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = file.type || "image/jpeg";

  let response;
  try {
    response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a school notice reader. Extract ALL events, dates, and activities from the image.

Be generous — if there is ANY mention of a date, time, activity, deadline, or event, include it.

Return a JSON array. Each object:
{
  "title": "string (clear, concise event name)",
  "start_date": "YYYY-MM-DDTHH:mm:ss (use current year ${new Date().getFullYear()} if year not shown)",
  "end_date": "YYYY-MM-DDTHH:mm:ss or null",
  "all_day": true/false,
  "location": "string or null",
  "description": "string or null — see rules below"
}

Title rules:
- Use a clear, concise event name (e.g. "Sports Day", "Parent-Teacher Meeting")
- Do not repeat the date, time or location in the title

Description rules — this is the most important field to get right:
- Write a concise, useful summary (1-3 sentences max)
- Include: the main purpose, required actions or instructions, and who issued the notice (school name, department, teacher, organisation) if clearly identifiable
- Do NOT repeat information already in title, start_date, end_date, or location
- Do NOT copy the full notice text word-for-word
- Do NOT include irrelevant disclaimers, repeated dates, phone numbers, fax numbers or generic administrative text
- Do NOT invent information that is not in the notice
- If there is nothing useful to add beyond what title/date/location already capture, set description to null
- Keep the language matching the notice (Chinese notice → Chinese description, English → English)

Date/time rules:
- If only a date is shown with no time, set all_day to true and time to 00:00:00
- If a time range like "2:00pm-4:00pm" is shown, set start_date and end_date accordingly
- Handle Chinese (繁體/簡體) and English text

General rules:
- Include deadlines, submission dates, holidays, exams, activities
- If the image is not a school notice but contains any date/event info, still extract it
- Return [] only if there is absolutely nothing date-related in the image
- Return ONLY the JSON array, no other text`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: "high",
              },
            },
            {
              type: "text",
              text: "Read this notice carefully. Extract every event, date, deadline, or activity mentioned. Return as JSON array.",
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "OpenAI API error";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const content = response.choices[0]?.message?.content?.trim() ?? "[]";
  const jsonStr = extractJSON(content);

  let events;
  try {
    events = JSON.parse(jsonStr);
    if (!Array.isArray(events)) events = [events];
  } catch {
    return NextResponse.json(
      { error: "Could not extract events. Try a clearer or closer photo.", raw: content },
      { status: 422 }
    );
  }

  if (events.length === 0) {
    return NextResponse.json(
      { error: "No dates or events found in this image. Try a different photo." },
      { status: 200 }
    );
  }

  return NextResponse.json({ events });
}
