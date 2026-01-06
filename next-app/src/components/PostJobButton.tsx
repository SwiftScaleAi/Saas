import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase"; // keep your supabase client import
import { postToJobBoards } from "../../../agents/agents/jobPoster/jobPoster";
import { ingestCv } from "../../../agents/agents/cvingester/cvingester";

export default function PostJobButton() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePostJob = async () => {
    setLoading(true);
    try {
      // Example: fetch a job from Supabase or use form data
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .limit(1);

      if (error) throw error;
      const jobRow = data?.[0];
      if (!jobRow) throw new Error("No job found to post");

      // Construct a Job object that matches your interface
      const job = {
        id: jobRow.id,
        title: jobRow.title,
        department: jobRow.department,
        location: jobRow.location,
        salary_range: jobRow.salary_range,
        description: jobRow.description,
        status: jobRow.status as "Draft" | "Published",
      };

      const result = await postToJobBoards(job);

      // Optionally trigger CV ingestion
      if (job.status === "Published") {
        await ingestCv(job.id, { name: "Jane Doe", role: "Software Engineer" });
        await ingestCv(job.id, { name: "John Smith", role: "Frontend Developer" });
      }

      console.log("Job posted:", result);
      alert(`Job ${result.jobId} posted successfully!`);

      // Navigate back to jobs list
      navigate("/jobs");
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePostJob}
      disabled={loading}
      className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
    >
      {loading ? "Posting..." : "Post Job"}
    </button>
  );
}
