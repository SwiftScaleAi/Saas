import { useDroppable, useDraggable } from "@dnd-kit/core";
import CandidateCardNew from "../CandidateCardNew";

interface PipelineColumnProps {
  stage: string;
  candidates: any[];
  onOpen: (candidate: any) => void;
}

export default function PipelineColumn({
  stage,
  candidates,
  onOpen,
}: PipelineColumnProps) {
  const { setNodeRef: setDropRef } = useDroppable({
    id: stage,
  });

  return (
    <div
      ref={setDropRef}
      className="w-80 bg-gray-50 rounded-lg p-4 border border-gray-200 flex-shrink-0"
    >
      <h2 className="text-lg font-semibold mb-4 capitalize">{stage}</h2>

      <div className="flex flex-col gap-3">
        {candidates.map((candidate) => (
          <DraggableCandidate
            key={candidate.id}
            candidate={candidate}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableCandidate({
  candidate,
  onOpen,
}: {
  candidate: any;
  onOpen: (candidate: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: candidate.id,
    data: { candidate },
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        zIndex: 50,
        position: "relative",
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <CandidateCardNew
        variant="operational"
        name={candidate.name}
        role={candidate.role}
        company={candidate.company}
        years={candidate.years_experience}
        score={
          candidate.post_interview_score ??
          candidate.pre_interview_score ??
          0
        }
        delta={
          candidate.post_interview_score &&
          candidate.pre_interview_score
            ? candidate.post_interview_score -
              candidate.pre_interview_score
            : undefined
        }
        highlights={candidate.highlights ?? []}
        referenceCheckPassed={candidate.reference_status === "passed"}
        transcriptLink={candidate.transcript_url ?? undefined}
        profileImage={candidate.profile_image_url ?? undefined}
        cvUrl={candidate.cv_file_path}
        offerStatus={candidate.offer_status}
        onClick={() => onOpen(candidate)}
      />
    </div>
  );
}
