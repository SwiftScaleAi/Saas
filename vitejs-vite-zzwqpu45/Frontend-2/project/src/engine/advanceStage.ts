import { supabase } from "../supabaseClient";

export async function advanceStage(candidate: any) {
  // Determine the next stage — your UI usually provides this
  const nextStage = candidate.next_stage || "interview";

  const { data, error } = await supabase
    .from("candidates")
    .update({ stage: nextStage })
    .eq("id", candidate.id)
    .select()
    .single();

  if (error) throw error;

  return { updatedCandidate: data };
}
