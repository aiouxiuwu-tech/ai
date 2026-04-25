import { Mistral } from "@mistralai/mistralai";
import {
  TicketResultSchema,
  type TicketResult,
  ticketResultJsonSchema,
} from "@/lib/schema";

function toDataUrl(imageBase64: string) {
  if (imageBase64.startsWith("data:")) {
    return imageBase64;
  }

  return `data:image/png;base64,${imageBase64}`;
}

function collectRawText(response: Awaited<ReturnType<Mistral["ocr"]["process"]>>) {
  return response.pages.map((page) => page.markdown).join("\n\n").trim();
}

export async function recognizeWithMistral(
  imageBase64: string,
): Promise<TicketResult> {
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not configured");
  }

  const startedAt = Date.now();
  const client = new Mistral({ apiKey });
  const response = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
      type: "image_url",
      imageUrl: toDataUrl(imageBase64),
    },
    documentAnnotationFormat: {
      type: "json_schema",
      jsonSchema: {
        name: "ticket_result",
        description: "Structured receipt, invoice, and expense ticket data.",
        schemaDefinition: ticketResultJsonSchema,
        strict: true,
      },
    },
    documentAnnotationPrompt:
      "Extract expense ticket data. Use ISO-like date text when possible. Use null for missing nullable fields.",
  });

  const processingMs = Date.now() - startedAt;
  const rawText = collectRawText(response);
  const annotation = response.documentAnnotation
    ? JSON.parse(response.documentAnnotation)
    : {};

  return TicketResultSchema.parse({
    ...annotation,
    raw_text: rawText,
    source_engine: "mistral",
    processing_ms: processingMs,
  });
}
