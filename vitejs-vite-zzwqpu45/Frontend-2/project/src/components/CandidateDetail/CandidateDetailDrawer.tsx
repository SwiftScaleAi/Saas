import React, { useEffect, useState, useRef } from "react";
import { Timeline } from "../Timeline/Timeline";
import { fetchTimelineForCandidate } from "../../lib/api/timeline";
import { updateStage } from "../../engine/stageEngine";
import { fetchNotes, createNote, Note } from "../../lib/api/notes";
import { supabase } from "../../lib/supabase";

interface CandidateDetailDrawerProps {
  candidate: any | null;
  open: boolean;
  onClose: () => void;
}

const STAGES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "offer_accepted"
];

export function CandidateDetailDrawer({
  candidate,
  open,
  onClose,
}: CandidateDetailDrawerProps) {
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentStage, setCurrentStage] = useState("");
  const [activeTab, setActiveTab] = useState<"timeline" | "notes" | "files">(
    "timeline"
  );
  const [newNote, setNewNote] = useState("");

  const notesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollNotesToBottom = () => {
    if (notesEndRef.current) {
      notesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!candidate?.id) return;

    setCurrentStage(candidate.offer_status || "");

    async function loadData() {
      const events = await fetchTimelineForCandidate(candidate.id);
      setTimeline(events);

      const notesData = await fetchNotes(candidate.id);
      setNotes(notesData);

      setTimeout(scrollNotesToBottom, 50);
    }

    loadData();
  }, [candidate?.id]);

  async function handleStageChange(stage: string) {
    if (!candidate) return;

    setCurrentStage(stage);
    await updateStage(candidate.id, stage);

    const events = await fetchTimelineForCandidate(candidate.id);
    setTimeline(events);
  }

  async function handleAddNote() {
    if (!newNote.trim() || !candidate) return;

    const saved = await createNote(candidate.id, newNote.trim());

    setNotes((prev) => [...prev, saved]);
    setNewNote("");

    setTimeout(scrollNotesToBottom, 50);
  }

  const cvUrl = candidate?.cv_file_path
    ? supabase.storage.from("cvs").getPublicUrl(candidate.cv_file_path).data.publicUrl
    : null;

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[420px] bg-white shadow-xl border-l border-gray-200 transform transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
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

            return (
              <button
                key={stage}
                onClick={() => handleStageChange(stage)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {stage.replace("_", " ")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 border-b border-gray-200 flex gap-6">
        {["timeline", "notes", "files"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
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
                onClick={handleAddNote}
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
      </div>
    </div>
  );
}
