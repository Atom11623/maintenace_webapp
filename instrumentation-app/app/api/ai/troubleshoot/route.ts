import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a troubleshooting assistant for an instrumentation department in a cement plant.
A technician will describe a symptom. Respond with:
1. Possible causes (most likely first)
2. Recommended inspection sequence
3. Safety checks before touching anything
4. Instruments/components to inspect
5. Measurements to verify
6. Possible corrective actions

Rules: Never claim a fault is confirmed. Never invent measurements, findings, or completed work.
Always frame output as suggestions for the technician to verify, not conclusions.`;

export async function POST(req: NextRequest) {
  const { problem } = await req.json();

  if (!problem || typeof problem !== "string") {
    return NextResponse.json({ error: "Missing 'problem' text" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY not configured. Add it in your Vercel project's environment variables." },
      { status: 500 }
    );
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: problem },
      ],
      max_tokens: 700,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `AI provider error: ${text}` }, { status: 502 });
  }

  const data = await res.json();
  const suggestion = data.choices?.[0]?.message?.content ?? "No suggestion returned.";

  return NextResponse.json({ suggestion });
}
