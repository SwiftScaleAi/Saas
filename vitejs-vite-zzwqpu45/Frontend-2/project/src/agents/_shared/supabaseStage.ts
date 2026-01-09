import { supabase } from "../../lib/supabase";
import type { StageKey } from "./types";

const stageColumns: Record<StageKey, string> = {
  parsed: "status_parsed",
  standardized: "status_standardized",
  enriched: "status_enriched",
  compliance: "status_compliance",
  scored: "status_scored",
};

/**
 * Safe stage status logger.
 * - Never throws
 * - Writes to candidate_events (correct schema)
 * - Updates candidate internal status columns
 */
export async function markStageStatus(
  stage: StageKey,
  status: "pending" | "success" | "failed",
  context: {
    candidateRowId?: string;
    job_id?: string;
    detail?: string;
    payload?: any;
  }
) {
  // ⭐ 1. Write event to candidate_events (safe, non-blocking)
  try {
    await supabase.from("candidate_events").insert({
      candidate_id: context.candidateRowId ?? null,
      event_type: `automation_${stage}_${status}`,
      source: "automation",
      meta: {
        job_id: context.job_id ?? null,
        detail: context.detail ?? null,
        payload: context.payload ?? null,
      },
    });
  } catch (err) {
    console.warn("⚠️ Non-blocking automation event failure:", err);
  }

  // ⭐ 2. Update candidate internal stage status
  if (context.candidateRowId) {
    try {
      await supabase
        .from("candidates")
        .update({ [stageColumns[stage]]: status })
        .eq("id", context.candidateRowId);
    } catch (err) {
      console.warn("⚠️ Failed to update candidate stage status:", err);
    }
  }
}

/**
 * Backfill multiple statuses at once.
 */
export async function backfillAllStatuses(
  candidateRowId: string,
  statuses: Partial<Record<StageKey, "pending" | "success" | "failed">>
) {
  const update: Record<string, string> = {};

  Object.entries(statuses).forEach(([stage, status]) => {
    if (!status) return;
    update[stageColumns[stage as StageKey]] = status;
  });

  if (Object.keys(update).length > 0) {
    try {
      await supabase.from("candidates").update(update).eq("id", candidateRowId);
    } catch (err) {
      console.warn("⚠️ Failed to backfill statuses:", err);
    }
  }
}

/**
 * Runs a stage with automatic logging + error handling.
 */
export async function runStage<T>(
  stage: StageKey,
  fn: () => Promise<T> | T,
  context: {
    candidateRowId?: string;
    job_id?: string;
    detail?: string;
    payload?: any;
  }
): Promise<{ ok: true; result: T } | { ok: false; error: any }> {
  await markStageStatus(stage, "pending", context);

  try {
    const result = await fn();
    await markStageStatus(stage, "success", { ...context, payload: result });
    return { ok: true, result };
  } catch (error) {
    await markStageStatus(stage, "failed", {
      ...context,
      detail: String(error),
    });
    return { ok: false, error };
  }
}
