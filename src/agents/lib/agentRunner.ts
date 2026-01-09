import { chooseModel } from "./modelRouter";
import { validateSchema } from "./schemaValidator";

interface RunAgentOptions {
  systemPrompt: string;
  userPrompt: string;
  schema: any;
  task?: string;
  overrideModel?: string;
  temperature?: number;
  maxRetries?: number;
  timeoutMs?: number;
}

export async function runAgent({
  systemPrompt,
  userPrompt,
  schema,
  task = "fast",
  overrideModel,
  temperature = 0,
  maxRetries = 2,
  timeoutMs = 20000,
}: RunAgentOptions) {
  const model = chooseModel({ task, override: overrideModel });

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          temperature,
          messages,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;

      if (!content) throw new Error("Empty model response");

      const cleaned = cleanJSON(content);
      const parsed = JSON.parse(cleaned);

      return validateSchema(schema, parsed);
    } catch (err) {
      if (attempt === maxRetries) {
        console.error("Agent failed after retries:", err);
        throw err;
      }
    }
  }
}

function cleanJSON(raw: string): string {
  return raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/[\u0000-\u001F]+/g, "")
    .trim();
}
