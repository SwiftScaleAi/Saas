import { supabase } from "../lib/supabase";

export type AuditEntry = {
  candidate_id: string;
  action: string;
  metadata?: any;
  source?: string;
};

/**
 * Safe audit logger.
 * - Never throws
 * - Never blocks stage changes
 * - Writes into candidate_events using correct schema
 */
export async function logAudit(
  candidateId: string,
  action: string,
  metadata: any = {}
) {
  try {
    const entry: AuditEntry = {
      candidate_id: candidateId,
      action,
      metadata,
      source: "system",
    };

    const payload = {
      candidate_id: entry.candidate_id,
      event_type: entry.action, // correct column
      meta: entry.metadata || {}, // correct column
      source: entry.source, // optional but valid
      // created_at defaults to now()
    };

    const { error } = await supabase
      .from("candidate_events")
      .insert(payload);

    if (error) {
      console.warn("⚠️ Non-blocking audit log failure:", error);
    }
  } catch (err) {
    console.warn("⚠️ Audit logger crashed (non-blocking):", err);
  }
}

/**
 * Fetch audit entries (from candidate_events)
 */
export async function getAuditLog(candidateId: string) {
  try {
    const { data, error } = await supabase
      .from("candidate_events")
      .select("*")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("⚠️ Failed to fetch audit log:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.warn("⚠️ Audit log fetch crashed:", err);
    return [];
  }
}
