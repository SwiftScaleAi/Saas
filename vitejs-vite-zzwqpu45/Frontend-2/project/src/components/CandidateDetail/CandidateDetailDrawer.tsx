import React, { useEffect, useState, useRef } from "react";
import { Timeline } from "../Timeline/Timeline";
import { fetchTimelineForCandidate } from "../../lib/api/timeline";
import { updateStage } from "../../engine/stageEngine";
import { fetchNotes, createNote, Note } from "../../lib/api/notes";
import { supabase } from "../../lib/supabase";
import { exportOfferToPdf } from "../../engine/offerPdfEngine";

// OFFER ENGINE
import {
  fetchOfferForCandidate,
  createOfferDraft,
  updateOfferDraft,
  sendOffer,
  lockOffer,
} from "../../engine/candidateOfferEngine";

import { useCandidateStore } from "../../stores/candidateStore";
import { syncCandidate } from "../../engine/sync/syncCandidate";

interface CandidateDetailDrawerProps {
  candidate: any | null;
  open: boolean;
  onClose: () => void;

  // Notify PipelineBoard instantly when candidate updates
  onCandidateUpdated?: (candidate: any) => void;
}

const STAGES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "offer_accepted",
  "rejected",
];

export function CandidateDetailDrawer({
  candidate,
  open,
  onClose,
  onCandidateUpdated,
}: CandidateDetailDrawerProps) {
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentStage, setCurrentStage] = useState("");

  const [activeTab, setActiveTab] = useState<
    "timeline" | "notes" | "files" | "offer"
  >("timeline");

  const [newNote, setNewNote] = useState("");

  // OFFER STATE
  const [offer, setOffer] = useState<any | null>(null);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerSaving, setOfferSaving] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const notesEndRef = useRef<HTMLDivElement | null>(null);

  const store = useCandidateStore.getState();

  const scrollNotesToBottom = () => {
    if (notesEndRef.current) {
      notesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Load offer
  async function loadOffer(candidateId: string) {
    setOfferLoading(true);
    const data = await fetchOfferForCandidate(candidateId);
    setOffer(data);
    setOfferLoading(false);
  }

  // Load timeline + notes + fresh stage
  async function loadData(candidateId: string) {
    const events = await fetchTimelineForCandidate(candidateId);
    setTimeline(events);

    const notesData = await fetchNotes(candidateId);
    setNotes(notesData);

    const { data: freshCandidate } = await supabase
      .from("candidates")
      .select("stage")
      .eq("id", candidateId)
      .single();

    if (freshCandidate?.stage) {
      setCurrentStage(freshCandidate.stage);
    }

    setTimeout(scrollNotesToBottom, 50);
  }

  // ⭐ Stage change handler
  async function handleStageChange(stage: string) {
    if (!candidate) return;

    store.setLoadingState(candidate.id, true);

    try {
      // 1. Update stage in DB + timeline via central engine
      const { updatedCandidate } = await updateStage(candidate, stage as any);

      // 2. Update global store so pipeline columns update instantly
      store.replaceOrInsertCandidate(updatedCandidate);

      // 3. Update drawer state so highlight updates instantly
      setCurrentStage(updatedCandidate.stage);

      // 4. Refresh timeline
      const events = await fetchTimelineForCandidate(updatedCandidate.id);
      setTimeline(events);

      // 5. Notify PipelineBoard (moves card instantly)
      onCandidateUpdated?.(updatedCandidate);
    } catch (err) {
      console.error("Stage change failed:", err);
    }

    store.setLoadingState(candidate.id, false);
  }

  // Load everything when drawer opens
  useEffect(() => {
    if (!candidate?.id) return;

    loadData(candidate.id);
    loadOffer(candidate.id);

    // Sync drawer with pipeline store
    syncCandidate(candidate.id);
  }, [candidate?.id]);

  // Realtime candidate updates
  useEffect(() => {
    if (!candidate?.id) return;

    const candidateId = candidate.id;

    const channel = supabase
      .channel(`candidate_realtime_drawer_${candidateId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "candidates",
          filter: `id=eq.${candidateId}`,
        },
        async () => {
          const updated = await syncCandidate(candidateId);
          if (updated) {
            store.replaceOrInsertCandidate(updated);
            setCurrentStage(updated.stage);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [candidate?.id]);

  // Realtime offer updates
  useEffect(() => {
    if (!candidate?.id) return;

    const candidateId = candidate.id;

    const channel = supabase
      .channel(`candidate_realtime_offer_${candidateId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "candidate_offers",
          filter: `candidate_id=eq.${candidateId}`,
        },
        () => loadOffer(candidateId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [candidate?.id]);

  // ⭐ NEW: Listen for "open-offer-tab" events from Pipeline
  useEffect(() => {
    const handler = () => setActiveTab("offer");
    window.addEventListener("open-offer-tab", handler);
    return () => window.removeEventListener("open-offer-tab", handler);
  }, []);


  // ⭐ FIX: Sync highlight when candidate.stage changes
  useEffect(() => {
    if (candidate?.stage) {
      setCurrentStage(candidate.stage);
    }
  }, [candidate?.stage]);

  const cvUrl = candidate?.cv_file_path
    ? supabase.storage.from("cvs").getPublicUrl(candidate.cv_file_path).data
      .publicUrl
    : null;

  return (
    <div
      className={`
      fixed top-0 right-0 h-full w-[420px] bg-white shadow-xl border-l border-gray-200
      transform transition-transform duration-300 ease-out
      ${open ? "translate-x-0" : "translate-x-full"}
    `}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{candidate?.name}</h2>
          <p className="text-gray-500 text-sm">{candidate?.email}</p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-lg"
        >
          ✕
        </button>
      </div>

      {/* Stage Bar */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {STAGES.map((stage) => {
            const active = currentStage === stage;
            const isRejected = stage === "rejected";

            return (
              <button
                key={stage}
                onClick={async () => {
                  try {
                    await handleStageChange(stage);
                  } catch (err) {
                    console.error("Stage change failed:", err);
                  }
                }}
                className={`
                  px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all
                  ${active
                    ? isRejected
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-blue-600 text-white shadow-sm"
                    : isRejected
                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {stage.replace("_", " ")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 border-b border-gray-200 flex gap-6">
        {["timeline", "notes", "files", "offer"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`
              py-3 text-sm font-medium border-b-2 transition-all
              ${activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
              }
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="overflow-y-auto h-[calc(100%-200px)] p-4">
        {/* Timeline */}
        {activeTab === "timeline" && (
          <>
            <h3 className="text-lg font-medium mb-2">Timeline</h3>
            <Timeline events={timeline} />
          </>
        )}

        {/* Notes */}
        {activeTab === "notes" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-1">
              {notes.map((note) => (
                <div key={note.id} className="mb-4">
                  <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-800">
                    {note.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(note.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
              <div ref={notesEndRef} />
            </div>

            <div className="mt-4 border-t pt-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note..."
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />

              <button
                onClick={async () => {
                  if (!newNote.trim() || !candidate) return;

                  const saved = await createNote(
                    candidate.id,
                    newNote.trim()
                  );

                  setNotes((prev) => [...prev, saved]);
                  setNewNote("");

                  setTimeout(scrollNotesToBottom, 50);
                }}
                className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Add Note
              </button>
            </div>
          </div>
        )}

        {/* Files */}
        {activeTab === "files" && (
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <span className="font-medium">CV:</span>{" "}
              {cvUrl ? (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Download CV
                </a>
              ) : (
                <span className="text-gray-400">Not available</span>
              )}
            </div>

            <div>
              <span className="font-medium">Transcript:</span>{" "}
              {candidate?.transcript_url ? (
                <a
                  href={candidate.transcript_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Transcript
                </a>
              ) : (
                <span className="text-gray-400">Not available</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Reference Status:</span>
              <span>{candidate?.reference_status || "Unknown"}</span>
              {candidate?.reference_locked && (
                <span title="Reference locked" className="text-gray-400">
                  🔒
                </span>
              )}
            </div>
          </div>
        )}

        {/* OFFER TAB */}
        {activeTab === "offer" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-2">Offer</h3>

            {offerLoading && (
              <p className="text-gray-500 text-sm">Loading offer...</p>
            )}

            {!offerLoading && (
              <>
                {/* Salary */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Salary
                  </label>
                  <input
                    type="number"
                    value={offer?.salary ?? ""}
                    onChange={(e) =>
                      setOffer((prev: any) => ({
                        ...prev,
                        salary: Number(e.target.value),
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    placeholder="e.g. 85000"
                    disabled={offer?.locked}
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={offer?.start_date ?? ""}
                    onChange={(e) =>
                      setOffer((prev: any) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    disabled={offer?.locked}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Internal Notes
                  </label>
                  <textarea
                    value={offer?.notes ?? ""}
                    onChange={(e) =>
                      setOffer((prev: any) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    rows={3}
                    disabled={offer?.locked}
                  />
                </div>

                {/* Offer Content */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Offer Content
                  </label>
                  <textarea
                    value={offer?.content ?? ""}
                    onChange={(e) =>
                      setOffer((prev: any) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    rows={6}
                    disabled={offer?.locked}
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  {/* Save Draft */}
                  <button
                    disabled={offerSaving || offer?.locked}
                    onClick={async () => {
                      setOfferSaving(true);

                      let updated;

                      if (!offer) {
                        updated = await createOfferDraft({
                          candidateId: candidate.id,
                          content: offer?.content,
                          salary: offer?.salary,
                          startDate: offer?.start_date,
                          notes: offer?.notes,
                        });
                      } else {
                        updated = await updateOfferDraft(offer.id, {
                          content: offer.content,
                          salary: offer.salary,
                          startDate: offer.start_date,
                          notes: offer.notes,
                        });
                      }

                      setOffer(updated);

                      const fresh = await syncCandidate(candidate.id);
                      if (fresh) store.replaceOrInsertCandidate(fresh);

                      setOfferSaving(false);
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    {offerSaving ? "Saving..." : "Save Draft"}
                  </button>

                  {/* Send Offer */}
                  <button
                    disabled={!offer || offer?.locked}
                    onClick={async () => {
                      const sent = await sendOffer(offer.id);
                      setOffer(sent);

                      const fresh = await syncCandidate(candidate.id);
                      if (fresh) store.replaceOrInsertCandidate(fresh);
                    }}
                    className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                  >
                    Send Offer
                  </button>

                  {/* Lock Offer */}
                  <button
                    disabled={!offer || offer?.locked}
                    onClick={async () => {
                      const locked = await lockOffer(offer.id);
                      setOffer(locked);

                      const fresh = await syncCandidate(candidate.id);
                      if (fresh) store.replaceOrInsertCandidate(fresh);
                    }}
                    className="w-full bg-gray-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                  >
                    Lock Offer
                  </button>

                  {/* Export Offer as PDF */}
                  <button
                    disabled={!offer}
                    onClick={async () => {
                      setExporting(true);

                      try {
                        await exportOfferToPdf(candidate.id);
                        setExportSuccess(true);

                        setTimeout(() => {
                          setExportSuccess(false);
                        }, 1500);
                      } finally {
                        setExporting(false);
                      }
                    }}
                    className={`
                      w-full py-2 rounded-lg text-sm font-medium transition
                      ${exportSuccess
                        ? "bg-green-600 text-white"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                      }
                    `}
                  >
                    {exporting && !exportSuccess && (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Generating PDF...
                      </span>
                    )}

                    {!exporting && !exportSuccess && "Export Offer as PDF"}

                    {exportSuccess && (
                      <span className="flex items-center justify-center gap-2">
                        ✓ PDF Ready
                      </span>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
