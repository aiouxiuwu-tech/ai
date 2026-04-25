import { NextResponse } from "next/server";
import { recognizeWithMistral } from "@/lib/mistral";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      image?: unknown;
      mistralApiKey?: unknown;
    };

    if (typeof body.image !== "string" || body.image.length === 0) {
      return NextResponse.json(
        { error: "Request body must include { image: base64 }" },
        { status: 400 },
      );
    }

    const mistralApiKey =
      typeof body.mistralApiKey === "string" ? body.mistralApiKey : undefined;
    const result = await recognizeWithMistral(body.image, mistralApiKey);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
