export const STAGES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "offer_accepted",
  "rejected",
] as const;

export type Stage = (typeof STAGES)[number];

export const TERMINAL_STAGES: Stage[] = ["offer_accepted", "rejected"];

/**
 * Allowed transitions between stages.
 * This matches the linear pipeline your UI expects.
 */
export const ALLOWED_TRANSITIONS: Record<Stage, Stage[]> = {
  applied: ["screening", "rejected"],
  screening: ["interview", "rejected"],
  interview: ["offer", "rejected"],
  offer: ["offer_accepted", "rejected"],
  offer_accepted: [],
  rejected: [],
};
