import React from "react";
import "./CandidateCardNew.css";

type Variant = "operational" | "highlight" | "ai";

type CandidateCardProps = {
  variant?: Variant;
  name: string;
  score: number;
  delta?: number;
  role: string;
  company: string;
  years: number;
  highlights: string[];
  referenceCheckPassed: boolean;
  transcriptLink?: string;
  profileImage?: string;
  cvUrl?: string;
  onReferenceCheck?: () => void;
  onOfferCheck?: () => void;
  onOnboardingCheck?: () => void;
  loadingStates?: {
    reference?: boolean;
    offer?: boolean;
    onboarding?: boolean;
  };
};

const CandidateCardNew: React.FC<CandidateCardProps> = ({
  variant = "highlight",
  name,
  score,
  delta,
  role,
  company,
  years,
  highlights,
  referenceCheckPassed,
  transcriptLink,
  profileImage,
  cvUrl,
  onReferenceCheck,
  onOfferCheck,
  onOnboardingCheck,
  loadingStates = {},
}) => {
  return (
    <div className={`candidate-card-new ${variant === "ai" ? "ai-glow" : ""}`}>
      <div className="candidate-header">
        <div className="candidate-info">
          <img
            src={profileImage || "/default-profile.png"}
            alt={name}
            className="candidate-avatar"
          />
          <div>
            <h3 className="candidate-name">{name}</h3>
            <p className="candidate-role">
              {role} at {company} ({years} years)
            </p>
          </div>
        </div>
        <div className="candidate-score">
          <span className="score-number">
            {score}
            {delta !== undefined && delta !== 0 && (
              <sup className={`score-delta ${delta > 0 ? "up" : "down"}`}>
                {delta > 0 ? `+${delta}` : `${delta}`}
              </sup>
            )}
          </span>
        </div>
      </div>

      <ul className="candidate-highlights">
        {highlights.slice(0, 2).map((point, index) => (
          <li key={index} className="highlight-item">
            • {point}
          </li>
        ))}
      </ul>

      <div className="candidate-footer">
        {referenceCheckPassed && (
          <div className="reference-badge">
            <span className="badge-icon">✔</span>
            Reference Check Passed
          </div>
        )}
        {transcriptLink && (
          <a
            href={transcriptLink}
            className="transcript-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="transcript-icon">📄</span>
            View Interview Transcript
          </a>
        )}
        {cvUrl && (
          <a
            href={cvUrl}
            className="transcript-link"
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <span className="transcript-icon">⬇️</span>
            Download CV
          </a>
        )}
      </div>

      {variant === "operational" && (
        <div className="action-buttons">
          <button
            onClick={onReferenceCheck}
            disabled={loadingStates.reference}
            className="action-btn reference"
          >
            {loadingStates.reference ? "Sending..." : "Reference Check"}
          </button>
          <button
            onClick={onOfferCheck}
            disabled={loadingStates.offer}
            className="action-btn offer"
          >
            {loadingStates.offer ? "Sending..." : "Offer Check"}
          </button>
          <button
            onClick={onOnboardingCheck}
            disabled={loadingStates.onboarding}
            className="action-btn onboarding"
          >
            {loadingStates.onboarding ? "Sending..." : "Onboarding Check"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateCardNew;
