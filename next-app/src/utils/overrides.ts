import { supabase } from "../lib/supabase";

/**
 * Override a candidate step and log the event.
 * Keeps automation intact but returns updated rows + errors for UI feedback.
 */
export async function overrideStep(
  candidateId: string,
  step: "reference" | "offer" | "onboarding",
  value: string
) {
  const field = {
    reference: "reference_status",
    offer: "offer_status",
    onboarding: "onboarding_status",
  }[step];

  const sourceField = {
    reference: "reference_source",
    offer: "offer_source",
    onboarding: "onboarding_source",
  }[step];

  const lockField = {
    reference: "reference_locked",
    offer: "offer_locked",
    onboarding: "onboarding_locked",
  }[step];

  const update = {
    [field]: value,
    [sourceField]: "manual",
    [lockField]: true,
    last_status_changed_at: new Date().toISOString(),
  };

  // Update candidate record and return updated row
  const { data: candidate, error: updateError } = await supabase
    .from("candidates")
    .update(update)
    .eq("id", candidateId)
    .select()
    .single();

  if (updateError) {
    console.error("Candidate update failed:", updateError);
    throw updateError;
  }

  // Insert audit event and return inserted row
  const { data: event, error: eventError } = await supabase
    .from("candidate_events")
    .insert({
      candidate_id: candidateId,
      event_type: `${step}_${value}`,
      source: "manual",
      meta: { ui: "dashboard_button" },
    })
    .select()
    .single();

  if (eventError) {
    console.error("Event insert failed:", eventError);
    throw eventError;
  }

  return { candidate, event };
}
