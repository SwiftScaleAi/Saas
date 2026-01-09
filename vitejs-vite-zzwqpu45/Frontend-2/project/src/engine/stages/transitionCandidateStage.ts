import { supabase } from "../../lib/supabase";
import { useCandidateStore } from "../../stores/candidateStore";
import { addTimelineEvent } from "../../engine/timelineEngine";

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
  const { reason } = options;

  const store = useCandidateStore.getState();

  // ⭐ Mark candidate as loading
  store.setLoadingState(candidateId, true);

  // ⭐ Optimistic UI update
  const optimistic = { ...candidate, stage: toStage };
  store.updateCandidate(candidateId, optimistic);

  const { data, error } = await supabase
    .from("candidates")
    .update({
      stage: toStage,
      last_status_changed_at: new Date().toISOString(),
    })
    .eq("id", candidateId)
    .select("*")
    .single();

  // ⭐ Clear loading state
  store.setLoadingState(candidateId, false);

  if (error || !data) {
    console.error("Stage transition failed:", error?.message);

    // Rollback to original
    store.updateCandidate(candidateId, candidate);

    return null;
  }

  // ⭐ Timeline event (updated to match new API)
  await addTimelineEvent(
    candidateId,
    "stage_transition",
    {
      from: fromStage,
      to: toStage,
      reason,
    }
  );

  // ⭐ (Optional) Automations removed — no exported function
  // if (options.triggerAutomations) {
  //   await triggerAutomations({ candidate_id: candidateId, stage: toStage });
  // }

  // ⭐ Merge updated candidate into store
  store.replaceOrInsertCandidate(data);

  return data;
}
