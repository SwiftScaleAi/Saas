/**
 * Payload received by the inbound application pipeline.
 * This is the raw input BEFORE AI processing.
 */

export interface InboundApplicationPayload {
  rawText: string;   // full email body, resume text, or form submission
  source?: string;   // e.g. "careers_page", "email", "referral"
}
