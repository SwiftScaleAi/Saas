import type { Stage } from "./stages";

export type Candidate = {
  id: string;
  name: string;
  email?: string;

  // Pipeline
  stage: Stage;

  // Scoring model
  pre_score?: number;   // Score before interview
  post_score?: number;  // Score after interview
  delta?: number;       // post_score - pre_score

  created_at?: string;
};
