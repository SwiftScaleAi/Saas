import { supabase } from "../../lib/supabase";
import { useCandidateStore } from "../../stores/candidateStore";
import { addTimelineEvent } from "../../lib/api/timeline";
import { triggerAutomations } from "../automationEngine";

type Candidate = {
  id: string;
  stage: string;
  name?: string;
  [key: string]: any;
};

type TransitionOptions = {
  reason?: string;
  triggerAutomations?: boolean;
};

export async function transitionCandidateStage(
  candidate: Candidate,
  toStage: string,
  options: TransitionOptions = {}
): Promise<Candidate | null> {
  const { id: candidateId, stage: fromStage } = candidate;
  const { reason, triggerAutomations: shouldTrigger = true } = options;

  const optimistic = { ...candidate, stage: toStage };
  useCandidateStore.getState().updateCandidate(candidateId, optimistic);

  const { data, error } = await supabase
    .from("candidates")
    .update({
      stage: toStage,
      last_status_changed_at: new Date().toISOString(),
    })
    .eq("id", candidateId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Stage transition failed:", error.message);
    useCandidateStore.getState().updateCandidate(candidateId, candidate); // rollback
    return null;
  }

  await addTimelineEvent({
    candidate_id: candidateId,
    type: "stage_transition",
    payload: {
      from: fromStage,
      to: toStage,
      reason,
    },
  });

  if (shouldTrigger) {
    await triggerAutomations({
      candidate_id: candidateId,
      stage: toStage,
    });
  }

  useCandidateStore.getState().updateCandidate(candidateId, data);
  return data;
}
