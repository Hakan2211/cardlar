import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/ai";
import { rehostToConvex } from "@/lib/ai/convexUpload";

export async function POST(req: NextRequest) {
  try {
    const { prompt, lyricsPrompt, durationSeconds, slug } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { audioUrl, note, ephemeral } = await getProvider().generateMusic({
      prompt,
      lyricsPrompt,
      durationSeconds:
        typeof durationSeconds === "number" ? durationSeconds : undefined,
    });

    // Same seven-day reclaim applies to generated audio — a soundtrack written
    // as a fal URL goes silent a week after the card is sent.
    const durableUrl =
      ephemeral && audioUrl ? await rehostToConvex(audioUrl) : audioUrl;

    return NextResponse.json({ audioUrl: durableUrl, slug, message: note });
  } catch (error) {
    console.error("Music generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate music" },
      { status: 500 }
    );
  }
}
