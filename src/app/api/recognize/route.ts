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
          content: `You are a school notice reader for Hong Kong parents. Extract ALL events, dates, and activities from the image.

Be generous — if there is ANY mention of a date, time, activity, deadline, or event, include it.

Return a JSON array. Each object:
{
  "title": "string — bilingual: English + 繁體中文 (e.g. 'Sports Day 運動會')",
  "start_date": "YYYY-MM-DDTHH:mm:ss (use current year ${new Date().getFullYear()} if year not shown)",
  "end_date": "YYYY-MM-DDTHH:mm:ss or null",
  "all_day": true/false,
  "location": "string or null — bilingual if identifiable",
  "description": "string or null — MUST be bilingual (English + 繁體中文), see rules below",
  "category": "school | tutor | medical | family | other",
  "preparation": {
    "head": [{"id": "auto-xxx", "label": "English 中文"}],
    "body": [{"id": "auto-xxx", "label": "English 中文"}],
    "feet": [{"id": "auto-xxx", "label": "English 中文"}],
    "bag": [{"id": "auto-xxx", "label": "English 中文"}]
  }
}

Title rules:
- ALWAYS bilingual: English first, then 繁體中文 (e.g. "Sports Day 運動會", "Parent-Teacher Meeting 家長日")
- If the notice is only in Chinese, still provide an English translation
- If the notice is only in English, still provide a Chinese translation
- Do not repeat the date, time or location in the title

Description rules:
- ALWAYS bilingual: write English first, then 繁體中文
- Write a concise summary (1-3 sentences per language)
- Include: the main purpose, required actions, and who issued the notice if identifiable
- Do NOT repeat information already in title, start_date, end_date, or location
- Do NOT invent information not in the notice
- If something is unclear, add a remark like "(unclear from notice 通告未列明)" instead of guessing
- If there is nothing useful beyond title/date/location, set to null

Preparation rules — CRITICAL: only extract items EXPLICITLY mentioned in the notice:
- Scan the notice for any mention of items to bring, wear, or prepare
- Map items to the correct zone:
  - "head": hats, caps, helmets, sunscreen, hair accessories (e.g. "Sun hat 太陽帽")
  - "body": uniforms, PE kits, specific clothing, jackets, costumes (e.g. "PE kit 體育服")
  - "feet": specific shoes, trainers, boots, sandals (e.g. "Trainers 運動鞋")
  - "bag": lunch boxes, water bottles, books, stationery, towels, any item to bring (e.g. "Water bottle 水壺")
- Each item label MUST be bilingual: "English 中文"
- Each item id should be "auto-" + a short slug (e.g. "auto-pe-kit", "auto-sunhat")
- NEVER invent items not mentioned in the notice
- If the notice says "wear PE uniform" → add to body zone
- If the notice says "bring water" → add to bag zone
- If no items are mentioned, omit the preparation field entirely or set to null
- Only include zones that have items; omit empty zones

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
              text: "Read this notice carefully. Extract every event, date, deadline, or activity mentioned. Identify any items to bring or wear. Return as JSON array with bilingual labels.",
            },
          ],
        },
      ],
      max_tokens: 3000,
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
