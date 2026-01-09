import { getTimeline, TimelineEvent } from "../../engine/timelineEngine";
import { supabase } from "../supabase";

/**
 * Fetches and sorts timeline events for a candidate.
 * UI-friendly wrapper around the engine function.
 */
export async function fetchTimelineForCandidate(
  candidateId: string
): Promise<TimelineEvent[]> {
  if (!candidateId) return [];

  try {
    const events = await getTimeline(candidateId);

    // Sort newest → oldest for UI display
    return events.sort((a, b) => {
      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });
  } catch (err) {
    console.error("Failed to fetch timeline:", err);
    return [];
  }
}

/**
 * Writes a timeline event for a candidate.
 * (Safe wrapper — uses correct schema)
 */
export async function addTimelineEvent(event: {
  candidate_id: string;
  type: string;
  meta?: Record<string, any>;
}): Promise<TimelineEvent | null> {
  try {
    const payload = {
      candidate_id: event.candidate_id,
      event_type: event.type,   // ✔ correct column
      meta: event.meta ?? {},   // ✔ correct column
      source: "system",         // ✔ optional but valid
    };

    const { data, error } = await supabase
      .from("candidate_events")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as TimelineEvent;
  } catch (err) {
    console.error("Failed to add timeline event:", err);
    return null;
  }
}
