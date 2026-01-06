import { supabase } from "../lib/supabase";
import { STAGES, Stage, ALLOWED_TRANSITIONS, TERMINAL_STAGES } from "../lib/stages";
import type { Candidate } from "../lib/types";

import { addTimelineEvent } from "./timelineEngine";
import { logAudit } from "./auditEngine";
import { triggerOnboardingForCandidate } from "./onboardingEngine";
import { triggerAutomationOnStageChange } from "./automationEngine";

/**
 * Updates a candidate's stage with full validation, DB update,
 * timeline logging, audit logging, automation hooks,
 * and onboarding trigger when offer is accepted.
 */
export async function updateStage(candidate: Candidate, newStage: Stage) {
  const oldStage = candidate.stage;

  // Validate new stage exists
  if (!STAGES.includes(newStage)) {
    throw new Error(`Invalid stage: ${newStage}`);
  }

  // Prevent changes from terminal states
  if (TERMINAL_STAGES.includes(oldStage)) {
    throw new Error(`Cannot change stage from terminal state: ${oldStage}`);
  }

  // Validate allowed transitions
  const allowedNext = ALLOWED_TRANSITIONS[oldStage] || [];
  if (!allowedNext.includes(newStage)) {
    throw new Error(`Invalid transition from ${oldStage} to ${newStage}`);
  }

  // Update DB
  const { error: updateError } = await supabase
    .from("candidates")
    .update({ stage: newStage })
    .eq("id", candidate.id);

  if (updateError) throw updateError;

  // Timeline event
  await addTimelineEvent(candidate.id, "stage_change", {
    from: oldStage,
    to: newStage,
  });

  // Audit log
  await logAudit(candidate.id, "stage_change", {
    from: oldStage,
    to: newStage,
  });

  // Automation hook
  await triggerAutomationOnStageChange(candidate.id, oldStage, newStage);

  // Onboarding trigger when offer is accepted
  if (newStage === "offer_accepted") {
    await addTimelineEvent(candidate.id, "onboarding_started", {});
    await logAudit(candidate.id, "onboarding_started", {});
    await triggerOnboardingForCandidate(candidate.id);
  }

  return { oldStage, newStage };
}
