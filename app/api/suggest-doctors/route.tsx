import { openai } from "@/config/OpenAiModel"
import { AIDoctorAgents } from "@/shared/list"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json()

    if (!notes) {
      return NextResponse.json([])
    }

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Return ONLY a JSON ARRAY.
No text. No markdown.
Doctors:
${JSON.stringify(AIDoctorAgents)}
          `,
        },
        {
          role: "user",
          content: `Symptoms: ${notes}`,
        },
      ],
      temperature: 0,
    })

    let raw = completion.choices?.[0]?.message?.content ?? "[]"

    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim()

    let doctors = []
    try {
      const parsed = JSON.parse(raw)
      doctors = Array.isArray(parsed) ? parsed : []
    } catch {
      doctors = []
    }

    return NextResponse.json(doctors)
  } catch (err) {
    console.error("Suggest doctors error:", err)
    return NextResponse.json([])
  }
}
