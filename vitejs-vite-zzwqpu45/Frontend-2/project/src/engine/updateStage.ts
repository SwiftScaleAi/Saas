import { supabase } from "../supabaseClient";

export async function updateStage(candidate: any, newStage: string) {
  const { data, error } = await supabase
    .from("candidates")
    .update({ stage: newStage })
    .eq("id", candidate.id)
    .select()
    .single();

  if (error) throw error;

  return { updatedCandidate: data };
}
