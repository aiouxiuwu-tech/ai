import { NextResponse } from "next/server";
import { recognizeWithMistral } from "@/lib/mistral";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { image?: unknown };

    if (typeof body.image !== "string" || body.image.length === 0) {
      return NextResponse.json(
        { error: "Request body must include { image: base64 }" },
        { status: 400 },
      );
    }

    const result = await recognizeWithMistral(body.image);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
