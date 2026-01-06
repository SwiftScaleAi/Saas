import { getTimeline } from "../../engine/timelineEngine";

/**
 * Fetches and sorts timeline events for a candidate.
 * UI-friendly wrapper around the engine function.
 */
export async function fetchTimelineForCandidate(candidateId: string) {
  if (!candidateId) return [];

  try {
    const events = await getTimeline(candidateId);

    // Sort newest → oldest for UI display
    return events.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  } catch (err) {
    console.error("Failed to fetch timeline:", err);
    return [];
  }
}
