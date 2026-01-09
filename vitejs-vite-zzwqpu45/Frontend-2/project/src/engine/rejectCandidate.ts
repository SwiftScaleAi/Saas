import { supabase } from "../supabaseClient";

export async function rejectCandidate(candidate: any) {
  const { data, error } = await supabase
    .from("candidates")
    .update({ stage: "rejected" })
    .eq("id", candidate.id)
    .select()
    .single();

  if (error) throw error;

  return { updatedCandidate: data };
}
