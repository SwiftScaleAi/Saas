"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateScore } from "@/engine/scoreEngine";

export default function InterviewScorePage({
  params,
}: {
  params: { candidateId: string };
}) {
  const router = useRouter();
  const candidateId = params.candidateId;

  // Rubric fields
  const [communication, setCommunication] = useState(0);
  const [technical, setTechnical] = useState(0);
  const [problemSolving, setProblemSolving] = useState(0);
  const [cultureFit, setCultureFit] = useState(0);

  // AI + final score
  const [aiSuggestedScore, setAiSuggestedScore] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  // Pre vs Post scoring
  const [mode, setMode] = useState<"pre" | "post">("post");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const computeRubricScore = () => {
    return Math.round(
      (communication + technical + problemSolving + cultureFit) / 4
    );
  };

  const handleAISuggestion = async () => {
    setAiLoading(true);

    // Simulated AI scoring logic — replace with your real AI endpoint later
    const simulated =
      computeRubricScore() + Math.floor(Math.random() * 10 - 5);

    setTimeout(() => {
      setAiSuggestedScore(simulated);
      setFinalScore(simulated);
      setAiLoading(false);
    }, 800);
  };

  const handleSubmit = async () => {
    if (finalScore === null) return;

    setLoading(true);
    try {
      await updateScore(candidateId, finalScore, mode);
      router.push(`/candidate/${candidateId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Interview Scoring</h1>

      {/* MODE SELECTOR */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Score Type</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "pre" | "post")}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="pre">Pre‑Interview Score</option>
          <option value="post">Post‑Interview Score</option>
        </select>
      </div>

      {/* RUBRIC */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold">Rubric</h2>

        <div>
          <label className="block text-sm font-medium">Communication</label>
          <input
            type="number"
            min={0}
            max={100}
            value={communication}
            onChange={(e) => setCommunication(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Technical Depth</label>
          <input
            type="number"
            min={0}
            max={100}
            value={technical}
            onChange={(e) => setTechnical(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Problem Solving</label>
          <input
            type="number"
            min={0}
            max={100}
            value={problemSolving}
            onChange={(e) => setProblemSolving(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Culture Fit</label>
          <input
            type="number"
            min={0}
            max={100}
            value={cultureFit}
            onChange={(e) => setCultureFit(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      {/* AI SUGGESTION */}
      <div className="mb-8">
        <button
          onClick={handleAISuggestion}
          disabled={aiLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {aiLoading ? "Analyzing…" : "Generate AI Suggested Score"}
        </button>

        {aiSuggestedScore !== null && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700">
              AI Suggested Score: <strong>{aiSuggestedScore}</strong>
            </p>
          </div>
        )}
      </div>

      {/* FINAL SCORE */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-1">Final Score</label>
        <input
          type="number"
          min={0}
          max={100}
          value={finalScore ?? ""}
          onChange={(e) => setFinalScore(Number(e.target.value))}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading || finalScore === null}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
      >
        {loading ? "Saving…" : "Save Score"}
      </button>
    </div>
  );
}
