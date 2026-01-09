import { intakeAgent } from "../../agents/intakeAgent";
import {
  InboundApplicationInput,
  InboundApplicationResult,
} from "./types";

/**
 * Production-grade inbound application processor.
 *
 * Responsibilities:
 * - Accept raw inbound application text
 * - Call the Intake Agent (AI → structured JSON)
 * - Return normalized, validated data to the Supabase function
 * - Keep business logic OUT of the agent layer
 */
export async function processInboundApplication(
  input: InboundApplicationInput
): Promise<InboundApplicationResult> {
  if (!input?.applicationText || input.applicationText.trim().length === 0) {
    throw new Error("applicationText is required");
  }

  // Run the AI intake agent
  const structured = await intakeAgent(input.applicationText);

  // Wrap in a consistent return shape
  return {
    structured,
  };
}
