import { supabase } from "../../supabaseClient";

export async function syncCandidate(candidateId: string) {
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", candidateId)
    .single();

  if (error) throw error;

  return data;
}
