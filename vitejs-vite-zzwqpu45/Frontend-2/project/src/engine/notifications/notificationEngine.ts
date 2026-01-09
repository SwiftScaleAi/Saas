import { IntakeResult } from "../../agents/_shared/prompts/intakeSchema";

/**
 * Notification Engine
 *
 * Sends alerts when a new inbound application is processed.
 * This is intentionally minimal — your real implementation may
 * integrate Slack, email, SMS, or internal dashboards.
 */

export interface InboundNotificationPayload {
  candidate: {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  intake: IntakeResult;
}

export async function sendInboundNotification(
  payload: InboundNotificationPayload
) {
  const { candidate, intake } = payload;

  // Placeholder for Slack/email/etc.
  // Replace with your real notification integrations.
  console.log("📥 New inbound application received:");
  console.log(`Candidate: ${candidate.fullName}`);
  console.log(`Email: ${candidate.email ?? "N/A"}`);
  console.log(`Source: ${intake.source ?? "inbound"}`);
  console.log("Skills:", intake.skills ?? []);
  console.log("Summary:", intake.summary ?? "");
}
