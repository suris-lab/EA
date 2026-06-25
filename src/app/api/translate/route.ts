import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "No text" }, { status: 400 });
  }

  const trimmed = text.trim();

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a bilingual label translator for a Hong Kong school calendar app.
Given a short item name (1-5 words), return a bilingual version: "English 繁體中文".

Rules:
- If input is Chinese, add the English translation before it: "English translation 原文中文"
- If input is English, add the Traditional Chinese translation after it: "Original English 中文翻譯"
- If input is already bilingual (contains both English and Chinese), return it as-is
- Keep it concise — this is a tag label, not a sentence
- Use Traditional Chinese (繁體中文), not Simplified
- Return ONLY the bilingual label, nothing else`,
        },
        { role: "user", content: trimmed },
      ],
      max_tokens: 60,
      temperature: 0,
    });

    const result = res.choices[0]?.message?.content?.trim() ?? trimmed;
    return NextResponse.json({ suggestion: result });
  } catch {
    return NextResponse.json({ suggestion: trimmed });
  }
}
