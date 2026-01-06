"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { advanceStage } from "@/engine/stageActions";
import { rejectCandidate } from "@/engine/rejectionEngine";

import { ArrowUp, ArrowDown, FileText } from "lucide-react";

export default function CandidateDetailPage({ params }: { params: { candidateId: string } }) {
  const router = useRouter();
  const candidateId = params.candidateId;

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      const { data } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", candidateId)
        .single();

      setCandidate(data);
    };

    fetchCandidate();
  }, [candidateId]);

  if (!candidate) {
    return <div className="p-10 text-gray-600">Loading candidate…</div>;
  }

  const effectiveScore = candidate.post_score ?? candidate.pre_score ?? null;

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-10">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
          <p className="text-gray-600 mt-1">
            {candidate.role} at {candidate.company}
          </p>
        </div>

        {/* SCORE PILL */}
        {effectiveScore !== null && (
          <div className="relative">
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-md border border-green-300">
              {effectiveScore}
            </span>

            {candidate.delta !== 0 && candidate.delta !== null && (
              <span
                className={`absolute -top-2 -right-3 text-xs font-semibold flex items-center ${
                  candidate.delta > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {candidate.delta > 0 ? (
                  <ArrowUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowDown className="w-3 h-3 mr-0.5" />
                )}
                {Math.abs(candidate.delta)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <Link
          href={`/interview/${candidate.id}/score`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Score Interview
        </Link>

        <button
          onClick={async () => {
            setLoading(true);
            try {
              await advanceStage(candidate.id);
              router.refresh();
            } finally {
              setLoading(false);
            }
          }}
          className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200 transition"
        >
          {loading ? "Updating…" : "Next Stage"}
        </button>

        <button
          onClick={async () => {
            setLoading(true);
            try {
              await rejectCandidate(candidate.id, "Rejected from detail page");
              router.refresh();
            } finally {
              setLoading(false);
            }
          }}
          className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 transition"
        >
          {loading ? "Updating…" : "Reject"}
        </button>
      </div>

      {/* TRANSCRIPT */}
      {candidate.transcript_url && (
        <div>
          <a
            href={candidate.transcript_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <FileText className="w-4 h-4" />
            View Interview Transcript
          </a>
        </div>
      )}

      {/* CV */}
      {candidate.cv_url && (
        <div>
          <a
            href={candidate.cv_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <FileText className="w-4 h-4" />
            Download CV
          </a>
        </div>
      )}

      {/* OFFER STATUS */}
      {candidate.offer_status && (
        <div className="p-4 bg-gray-50 border rounded">
          <h2 className="font-semibold mb-2">Offer Status</h2>
          <p className="text-gray-700">{candidate.offer_status}</p>
        </div>
      )}

      {/* TIMELINE */}
      <div className="p-4 bg-white border rounded shadow-sm">
        <h2 className="font-semibold mb-4">Timeline</h2>

        <Timeline candidateId={candidate.id} />
      </div>
    </div>
  );
}

/* --- TIMELINE COMPONENT --- */

function Timeline({ candidateId }: { candidateId: string }) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchTimeline = async () => {
      const { data } = await supabase
        .from("timeline")
        .select("*")
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: false });

      setEvents(data || []);
    };

    fetchTimeline();
  }, [candidateId]);

  if (!events.length) {
    return <p className="text-gray-500 text-sm">No timeline events yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="text-sm text-gray-700">
          <span className="font-medium">{event.type}</span> —{" "}
          <span className="text-gray-500">{event.created_at}</span>
        </li>
      ))}
    </ul>
  );
}
