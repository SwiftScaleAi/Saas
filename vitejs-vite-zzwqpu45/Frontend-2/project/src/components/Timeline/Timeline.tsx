import React from "react";

type TimelineEvent = {
  id?: string;
  event_type?: string;
  meta?: any;
  source?: string;
  created_at?: string;
};

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-4">
        No timeline events yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      {events.map((event) => {
        const label =
          event.meta?.message ??
          event.event_type?.replace(/_/g, " ") ??
          "Event";

        const timestamp = new Date(event.created_at || "").toLocaleString(
          "en-GB",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        );

        return (
          <div
            key={event.id || Math.random()}
            className="flex flex-col border-l border-gray-300 pl-4"
          >
            {/* Timestamp */}
            <div className="text-xs text-gray-500">{timestamp}</div>

            {/* Main label */}
            <div className="font-medium text-gray-800">{label}</div>

            {/* Rich metadata rendering */}
            {event.event_type === "stage_change" &&
            event.meta?.from &&
            event.meta?.to ? (
              <div className="text-sm text-gray-700 mt-1">
                Stage changed from{" "}
                <strong className="text-gray-800">{event.meta.from}</strong> to{" "}
                <strong className="text-gray-800">{event.meta.to}</strong>
              </div>
            ) : event.meta?.message ? (
              <div className="text-sm text-gray-700 mt-1">
                {event.meta.message}
              </div>
            ) : event.meta ? (
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 text-gray-700">
                {JSON.stringify(event.meta, null, 2)}
              </pre>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
