export const STAGES = [
  "applied",
  "screening",
  "interview",
  "offer_sent",
  "offer_accepted",
  "rejected",
] as const;

export type Stage = (typeof STAGES)[number];

export const TERMINAL_STAGES: Stage[] = ["offer_accepted", "rejected"];

export const ALLOWED_TRANSITIONS: Record<Stage, Stage[]> = {
  applied: ["screening", "rejected"],
  screening: ["interview", "rejected"],
  interview: ["offer_sent", "rejected"],
  offer_sent: ["offer_accepted", "rejected"],
  offer_accepted: [], // terminal
  rejected: [], // terminal
};
