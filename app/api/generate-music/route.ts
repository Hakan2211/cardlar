import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, lyricsPrompt, durationSeconds, slug } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { audioUrl, note } = await getProvider().generateMusic({
      prompt,
      lyricsPrompt,
      durationSeconds:
        typeof durationSeconds === "number" ? durationSeconds : undefined,
    });
    return NextResponse.json({ audioUrl, slug, message: note });
  } catch (error) {
    console.error("Music generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate music" },
      { status: 500 }
    );
  }
}
