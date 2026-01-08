import { supabase } from "../../lib/supabase";
import { useCandidateStore } from "../../stores/candidateStore";
import { syncCandidate } from "../sync/syncCandidate";

export function subscribeToCandidateRealtime() {
  const channel = supabase
    .channel("candidates-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "candidates",
      },
      async (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;

        // INSERT → add new candidate to store
        if (eventType === "INSERT" && newRow) {
          useCandidateStore.getState().updateCandidate(newRow.id, newRow);
          return;
        }

        // UPDATE → hydrate from DB to avoid stale UI
        if (eventType === "UPDATE" && newRow) {
          // Always hydrate from DB to avoid partial updates
          await syncCandidate(newRow.id);
          return;
        }

        // DELETE → remove from store
        if (eventType === "DELETE" && oldRow) {
          useCandidateStore.getState().removeCandidate(oldRow.id);
          return;
        }
      }
    )
    .subscribe();

  return channel;
}
