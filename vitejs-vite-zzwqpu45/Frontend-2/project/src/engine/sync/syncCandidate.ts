import { supabase } from "../../lib/supabase";
import { useCandidateStore } from "../../stores/candidateStore";

export async function syncCandidate(candidateId: string) {
  if (!candidateId) return null;

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  if (error) {
    console.error("Failed to sync candidate:", error.message);
    return null;
  }

  if (!data) return null;

  useCandidateStore.getState().updateCandidate(candidateId, data);

  return data;
}
