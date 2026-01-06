import { addTimelineEvent } from "./timelineEngine";
import { logAudit } from "./auditEngine";
import { updateStage } from "./stageEngine";
import { getCandidate } from "./candidateEngine";

/**
 * Rejects a candidate from any stage.
 * This is allowed from all non-terminal stages.
 */
export async function rejectCandidate(candidateId: string, reason?: string) {
  const candidate = await getCandidate(candidateId);

  // Log timeline + audit
  await addTimelineEvent(candidateId, "rejected", { reason });
  await logAudit(candidateId, "rejected", { reason });

  // Update stage → rejected
  return updateStage(candidate, "rejected");
}
