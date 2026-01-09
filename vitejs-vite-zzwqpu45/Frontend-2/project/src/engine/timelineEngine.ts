import { supabase } from "../lib/supabase";

export type TimelineEvent = {
  id?: string;
  candidate_id: string;
  event_type: string;
  meta?: any;
  created_at?: string;
};

/**
 * Adds a timeline event for a candidate.
 */
export async function addTimelineEvent(
  candidateId: string,
  type: string,
  payload: any = {}
) {
  // Normalize metadata (must be a plain object)
  const metadata =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? { ...payload }
      : {};

  const { error } = await supabase.from("candidate_events").insert({
    candidate_id: candidateId,
    event_type: type,   // correct column
    meta: metadata,     // correct column
    // source defaults to 'system'
    // created_at defaults to now()
  });

  if (error) {
    console.error("❌ Failed to insert timeline event:", error);
    throw error;
  }
}

/**
 * Fetch all timeline events for a candidate, sorted newest → oldest.
 */
export async function getTimeline(candidateId: string) {
  const { data, error } = await supabase
    .from("candidate_events")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Failed to fetch timeline:", error);
    throw error;
  }

  return data as TimelineEvent[];
}
