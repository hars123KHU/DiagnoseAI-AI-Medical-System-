import { NextResponse } from "next/server";
import { AIDoctorAgents } from "@/shared/list";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const notes: string = body?.notes ?? "";

    // 🔹 If user sends empty input → show default doctors
    if (!notes || typeof notes !== "string") {
      return NextResponse.json(AIDoctorAgents.slice(0, 3));
    }

    const query = notes.toLowerCase();

    // Split sentence into searchable tokens
    const words = query
      .replace(/[^\w\s]/g, "") // remove punctuation
      .split(/\s+/)
      .filter(Boolean);

    /**
     * 🧠 Score each doctor by keyword matches
     * Instead of simple filter, we rank them
     */
    const scoredDoctors = AIDoctorAgents.map((agent: any) => {
      const keywords: string[] = agent.keywords || [];

      let score = 0;

      keywords.forEach((keyword) => {
        const lowerKeyword = keyword.toLowerCase();

        // exact phrase match
        if (query.includes(lowerKeyword)) score += 3;

        // word match
        words.forEach((word) => {
          if (lowerKeyword.includes(word)) score += 1;
        });
      });

      return { ...agent, score };
    });

    /**
     * 🔹 Sort by relevance score
     */
    const sorted = scoredDoctors
      .filter((d) => d.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...doctor }) => doctor);

    /**
     * 🔹 If nothing matched → fallback doctors
     */
    const result =
      sorted.length > 0
        ? sorted.slice(0, 3)
        : [
            AIDoctorAgents[0], // General Physician fallback
            ...AIDoctorAgents.slice(1, 3),
          ];

    return NextResponse.json(result);
  } catch (error) {
    console.error("Suggest doctors error:", error);

    // 🔹 Never return empty → keeps UI alive
    return NextResponse.json(AIDoctorAgents.slice(0, 3));
  }
}