import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';

import { updateStage } from './engine/stageEngine';
import { subscribeToCandidateRealtime } from './engine/realtime/candidatesChannel';

import Navigation from './components/Navigation';

import Dashboard from './pages/Dashboard';
import AddJob from './pages/AddJob';
import Jobs from './pages/Jobs';
import Candidates from './pages/Candidates';
import Offers from './pages/Offers';
import Onboarding from './pages/Onboarding';
import KnowledgeUpload from './pages/knowledgeupload';

// ⭐ NEW: Draft Offer Page
import OfferDraftPage from './pages/OfferDraftPage';

// ⭐ NEW: Pipeline Board Page
import PipelineBoard from './pages/PipelineBoard';

function App() {
  // ⭐ REALTIME SUBSCRIPTION
  useEffect(() => {
    const channel = subscribeToCandidateRealtime();
    return () => channel.unsubscribe();
  }, []);

  // ⭐ DRAG & DROP STAGE UPDATE
  async function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) return; // dropped outside any column

    const candidate = active.data.current?.candidate;
    const newStage = over.id;

    if (!candidate) return;

    // Only update if stage actually changed
    if (candidate.stage !== newStage) {
      try {
        await updateStage(candidate, newStage);
      } catch (err) {
        console.error("Stage update failed:", err);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DndContext onDragEnd={handleDragEnd}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-job" element={<AddJob />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* ⭐ NEW: Draft Offer Route */}
            <Route path="/offers/draft" element={<OfferDraftPage />} />

            {/* ⭐ NEW: Pipeline Board Route */}
            <Route path="/pipeline" element={<PipelineBoard />} />

            {/* Knowledge Base Upload */}
            <Route path="/knowledgeupload" element={<KnowledgeUpload />} />
          </Routes>
        </DndContext>
      </div>
    </div>
  );
}

export default App;
