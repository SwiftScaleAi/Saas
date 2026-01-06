import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import CandidateProgressCard from "./CandidateProgressCard";

type Candidate = {
  id: string;
  name: string;
  role: string;
  offer_status: "draft" | "sent" | "accepted" | "onboarding" | "declined";
  onboarding_status: "pending" | "complete" | "n/a";
  created_at: string;
};

export default function CandidateProgressList() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Fetch candidates from Supabase
  const fetchCandidates = async () => {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching candidates:", error);
    } else {
      setCandidates(data || []);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const active = candidates.filter(c => c.onboarding_status !== "complete");
  const completed = candidates.filter(c => c.onboarding_status === "complete");

  return (
    <div className="space-y-8">
      {/* Active candidates */}
      <div>
        <h2 className="text-lg font-bold mb-2">Active Candidates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {active.map(c => (
            <CandidateProgressCard key={c.id} {...c} refresh={fetchCandidates} />
          ))}
        </div>
      </div>

      {/* Completed candidates */}
      <div>
        <h2 className="text-lg font-bold mt-6 mb-2">Completed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {completed.map(c => (
            <CandidateProgressCard key={c.id} {...c} refresh={fetchCandidates} />
          ))}
        </div>
      </div>
    </div>
  );
}
