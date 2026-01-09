import { runAgent } from "./lib/agentRunner";
import { intakePrompt } from "./_shared/prompts/intakePrompt";
import { intakeSchema } from "./_shared/prompts/intakeSchema";

export async function intakeAgent(rawText: string) {
  return runAgent({
    systemPrompt: intakePrompt,
    userPrompt: rawText,
    schema: intakeSchema,
    task: "intake",
  });
}
