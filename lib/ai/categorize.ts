import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CATEGORIES, CATEGORY_DESCRIPTIONS, type Category } from "@/lib/types";

const client = new Anthropic();

const CategorizationSchema = z.object({
  category: z.enum(CATEGORIES as [Category, ...Category[]]),
  confidence: z.enum(["alta", "baja"]),
});

const categoryContext = CATEGORIES.map((c) => `- ${c}: ${CATEGORY_DESCRIPTIONS[c]}`).join("\n");

const SYSTEM_PROMPT = `Clasificás gastos personales importados de Mercado Pago en una única categoría de la lista permitida, a partir de la descripción de la transacción.

Categorías:
${categoryContext}

Si la descripción no deja clara la categoría, usá "Otros". Marcá confidence "baja" cuando la clasificación sea una suposición razonable pero no evidente a partir del texto, y "alta" cuando sea clara.`;

export type CategorizationResult = {
  category: Category;
  confidence: "alta" | "baja";
};

export async function categorizeTransaction(description: string): Promise<CategorizationResult | null> {
  try {
    const response = await client.messages.parse({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      output_config: { format: zodOutputFormat(CategorizationSchema) },
      messages: [{ role: "user", content: description }],
    });

    return response.parsed_output;
  } catch {
    return null;
  }
}
