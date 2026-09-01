import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/ai";
import { rehostToConvex } from "@/lib/ai/convexUpload";

export async function POST(req: NextRequest) {
  try {
    const { prompt, slug } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { imageUrl, note, ephemeral } = await getProvider().generateImage({
      prompt,
    });

    // fal reclaims generated files after ~7 days; cards are permanent. Copy the
    // image into Convex storage before it can be written to a card.
    const durableUrl = ephemeral ? await rehostToConvex(imageUrl) : imageUrl;

    return NextResponse.json({ imageUrl: durableUrl, slug, message: note });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
