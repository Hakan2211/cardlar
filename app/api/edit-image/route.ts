import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, prompt, slug } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Style prompt is required" },
        { status: 400 }
      );
    }

    const result = await getProvider().editImage({ prompt, imageUrl });
    return NextResponse.json({
      imageUrl: result.imageUrl,
      slug,
      message: result.note,
    });
  } catch (error) {
    console.error("Image edit error:", error);
    return NextResponse.json(
      { error: "Failed to edit image" },
      { status: 500 }
    );
  }
}
