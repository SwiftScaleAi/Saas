import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { STAGES } from "../lib/stages";
import PipelineColumn from "../components/Pipeline/PipelineColumn";
import { CandidateDetailDrawer } from "../components/CandidateDetail/CandidateDetailDrawer";

export default function PipelineBoard() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchCandidates();

    const channel = supabase
      .channel("pipeline-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
        () => fetchCandidates()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchCandidates() {
    const { data } = await supabase.from("candidates").select("*");
    setCandidates(data || []);
  }

  function openCandidate(candidate) {
    setSelectedCandidate(candidate);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedCandidate(null);
  }

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {STAGES.map((stage) => (
        <PipelineColumn
          key={stage}
          stage={stage}
          candidates={candidates.filter((c) => c.stage === stage)}
          onOpen={openCandidate}
        />
      ))}

      <CandidateDetailDrawer
        candidate={selectedCandidate}
        open={drawerOpen}
        onClose={closeDrawer}
      />
    </div>
  );
}
