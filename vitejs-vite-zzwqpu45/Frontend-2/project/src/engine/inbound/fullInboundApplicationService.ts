import { intakeAgent } from "../../agents/agents/intakeAgent";
import { IntakeResult } from "../../agents/_shared/prompts/intakeSchema";

import { createCandidate } from "../candidateEngine";
import { addTimelineEvent } from "../timelineEngine";
import { moveToStage } from "../stageEngine";
import { sendInboundNotification } from "../notifications/notificationEngine";

import { InboundApplicationPayload } from "./types";

/**
 * Inbound Application Service
 *
 * This service orchestrates the full inbound pipeline:
 * 1. Receives raw inbound application text
 * 2. Runs the Intake Agent to extract structured data
 * 3. Creates a candidate record
 * 4. Adds a timeline event
 * 5. Moves candidate to the first stage
 * 6. Sends notifications
 */

export async function processInboundApplication(
  payload: InboundApplicationPayload
) {
  const { rawText, source } = payload;

  // 1. Run AI intake agent
  const intake: IntakeResult = await intakeAgent(rawText);

  // 2. Create candidate record
  const candidate = await createCandidate({
    fullName: intake.candidate.fullName,
    email: intake.candidate.email,
    phone: intake.candidate.phone,
    location: intake.candidate.location,
    linkedin: intake.candidate.linkedin,
    portfolio: intake.candidate.portfolio,
    source: source ?? intake.source ?? "inbound",
    skills: intake.skills ?? [],
    experience: intake.experience ?? [],
    summary: intake.summary ?? "",
    metadata: intake.metadata ?? {},
  });

  // 3. Add timeline event
  await addTimelineEvent({
    candidateId: candidate.id,
    type: "inbound_application_received",
    data: {
      source,
      rawText,
      parsed: intake,
    },
  });

  // 4. Move candidate to first stage
  await moveToStage({
    candidateId: candidate.id,
    stage: "New",
    reason: "Inbound application",
  });

  // 5. Send notifications
  await sendInboundNotification({
    candidate,
    intake,
  });

  return {
    candidate,
    intake,
  };
}
