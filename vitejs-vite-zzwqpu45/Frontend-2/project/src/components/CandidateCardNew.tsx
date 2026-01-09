import React, { useState } from "react";
import "./CandidateCardNew.css";
import { CheckCircle, FileText, ArrowUp, ArrowDown } from "lucide-react";

import { advanceStage } from "../engine/stageActions";
import { rejectCandidate } from "../engine/rejectionEngine";
import { useCandidateStore } from "../stores/candidateStore";

type Variant = "operational" | "highlight" | "ai";

type OfferStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "passed"
  | ""
  | null;

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
  offerStatus?: OfferStatus;
  candidateId?: string;
  onReferenceCheck?: () => void;

  // ⭐ This now ALWAYS opens the drawer on the Offer tab
  onDraftOffer?: () => void;

  loadingStates?: {
    reference?: boolean;
  };
  onClick?: () => void;
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
  offerStatus,
  candidateId,
  onReferenceCheck,
  onDraftOffer,
  loadingStates = {},
  onClick,
}) => {
  const [loading, setLoading] = useState(false);
  const mergeCandidates = useCandidateStore((s) => s.mergeCandidates);
  const status = (offerStatus || "").toLowerCase() as OfferStatus;

  const handleAdvanceStage = async () => {
    if (!candidateId) return;
    setLoading(true);
    try {
      const updated = await advanceStage(candidateId);
      if (updated) mergeCandidates([updated]);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!candidateId) return;
    setLoading(true);
    try {
      const updated = await rejectCandidate(candidateId, "Rejected from UI");
      if (updated) mergeCandidates([updated]);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ NEW — Pipeline card NEVER sends the offer directly.
  // It ONLY opens the drawer on the Offer tab.
  const openOfferDrawer = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDraftOffer?.();
  };

  const renderOfferStatus = () => {
    if (status === "accepted") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-300">
          Offer Accepted
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-300">
          Offer Rejected
        </span>
      );
    }

    // ⭐ If a draft exists, show "Send Offer" — but this opens the drawer.
    if (status === "draft") {
      return (
        <button
          onClick={openOfferDrawer}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded border border-blue-300 transition"
        >
          Send Offer
        </button>
      );
    }

    // ⭐ If already sent
    if (status === "sent" || status === "passed") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-300">
          Offer Sent
        </span>
      );
    }

    // ⭐ Default: No draft exists → Draft Offer
    return (
      <button
        onClick={openOfferDrawer}
        className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded border border-blue-300 transition"
      >
        Draft Offer
      </button>
    );
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <div
      className={`
        candidate-card-new cursor-pointer rounded-lg border bg-white p-5 shadow-sm 
        transition-all hover:shadow-md hover:-translate-y-[1px]
        ${variant === "ai" ? "ai-glow" : ""}
      `}
      onClick={onClick}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-4 items-center">
          {profileImage ? (
            <img
              src={profileImage}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border border-gray-300 aspect-square"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm border border-gray-300 aspect-square leading-none">
              {initials}
            </div>
          )}

          <div>
            <h3 className="text-base font-semibold text-gray-900 leading-tight">
              {name}
            </h3>
            <p className="text-sm text-gray-600 leading-snug">
              {role} at {company} ({years} years)
            </p>
          </div>
        </div>

        {/* SCORE + DELTA INLINE */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-md border border-green-300">
            {score}
          </span>

          {delta !== undefined && delta !== 0 && (
            <span
              className={`text-xs font-semibold flex items-center ${
                delta > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {delta > 0 ? (
                <ArrowUp className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-0.5" />
              )}
              {Math.abs(delta)}
            </span>
          )}
        </div>
      </div>

      {/* HIGHLIGHTS */}
      {highlights.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-gray-800 leading-snug">
          {highlights.slice(0, 2).map((point, index) => (
            <li key={index}>• {point}</li>
          ))}
        </ul>
      )}

      {/* FOOTER */}
      <div className="mt-4 space-y-2 text-sm">
        {referenceCheckPassed && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-300 w-fit">
            <CheckCircle className="w-4 h-4" />
            Reference Check Passed
          </span>
        )}

        {transcriptLink && (
          <a
            href={transcriptLink}
            className="flex items-center gap-1 text-sm hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <strong className="text-blue-600">View Interview Transcript</strong>
          </a>
        )}

        {cvUrl && (
          <a
            href={cvUrl}
            className="flex items-center gap-1 text-sm hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            download
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <strong className="text-blue-600">Download CV</strong>
          </a>
        )}
      </div>

      {/* OPERATIONAL BUTTONS */}
      {variant === "operational" && (
        <div className="mt-5 flex flex-wrap gap-2 items-center">
          {!referenceCheckPassed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReferenceCheck?.();
              }}
              disabled={loadingStates.reference}
              className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded border border-green-300 transition"
            >
              {loadingStates.reference ? "Sending..." : "Reference Check"}
            </button>
          )}

          {candidateId && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdvanceStage();
                }}
                disabled={loading}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border transition"
              >
                {loading ? "Updating..." : "Next Stage"}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject();
                }}
                disabled={loading}
                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded border border-red-300 transition"
              >
                {loading ? "Updating..." : "Reject"}
              </button>
            </>
          )}

          {renderOfferStatus()}
        </div>
      )}
    </div>
  );
};

export default CandidateCardNew;
