import { z } from "zod";

export const TicketResultSchema = z.object({
  ticket_type: z.enum([
    "invoice",
    "taxi",
    "hotel",
    "meal",
    "transport",
    "office",
    "other",
  ]),
  vendor: z.string(),
  date: z.string(),
  amount: z.number(),
  currency: z.enum(["HKD", "CNY", "USD", "MOP", "SGD"]),
  tax_amount: z.number().nullable(),
  invoice_no: z.string().nullable(),
  items: z.array(z.object({ name: z.string(), amount: z.number() })).nullable(),
  confidence: z.number().min(0).max(1),
  raw_text: z.string(),
  source_engine: z.enum(["mistral", "gemini"]),
  processing_ms: z.number(),
});

export type TicketResult = z.infer<typeof TicketResultSchema>;

export const ticketResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "ticket_type",
    "vendor",
    "date",
    "amount",
    "currency",
    "tax_amount",
    "invoice_no",
    "items",
    "confidence",
  ],
  properties: {
    ticket_type: {
      type: "string",
      enum: ["invoice", "taxi", "hotel", "meal", "transport", "office", "other"],
    },
    vendor: { type: "string" },
    date: { type: "string" },
    amount: { type: "number" },
    currency: { type: "string", enum: ["HKD", "CNY", "USD", "MOP", "SGD"] },
    tax_amount: { anyOf: [{ type: "number" }, { type: "null" }] },
    invoice_no: { anyOf: [{ type: "string" }, { type: "null" }] },
    items: {
      anyOf: [
        {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["name", "amount"],
            properties: {
              name: { type: "string" },
              amount: { type: "number" },
            },
          },
        },
        { type: "null" },
      ],
    },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
} as const;
