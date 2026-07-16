import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, slug } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { imageUrl, note } = await getProvider().generateImage({ prompt });
    return NextResponse.json({ imageUrl, slug, message: note });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
