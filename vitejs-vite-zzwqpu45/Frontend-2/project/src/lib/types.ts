// -----------------------------
// Stage Type
// -----------------------------
export type Stage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "offer_accepted"
  | "rejected";

// -----------------------------
// Candidate Interface
// -----------------------------
export interface Candidate {
  id: string;
  name: string;
  email?: string;
  role?: string;

  // IMPORTANT: stage must use the Stage union type
  stage: Stage;

  interview_score?: number;
  rating?: string;

  reference_status?: string;
  offer_status?: string;
  onboarding_status?: string;

  created_at?: string;

  pre_interview_score?: number;
  post_interview_score?: number;

  job_id?: string;

  reference_source?: string;
  offer_source?: string;
  onboarding_source?: string;

  reference_locked?: boolean;
  offer_locked?: boolean;
  onboarding_locked?: boolean;

  last_status_changed_at?: string;

  cand_source?: string;
  profile_image_url?: string;

  highlights?: string[];
  transcript_url?: string;

  reference_check_passed?: boolean;

  company?: string;
  years_experience?: number;

  ai_analysis?: string;
  cv_file_path?: string;
}
