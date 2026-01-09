import { supabase } from "../lib/supabase";

export async function getTimeline(candidateId: string) {
  const { data, error } = await supabase
    .from("timeline")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
}
