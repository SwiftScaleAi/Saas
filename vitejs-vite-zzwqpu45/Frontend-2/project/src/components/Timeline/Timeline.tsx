import React from "react";

type TimelineEvent = {
  id?: string;
  type?: string; // make optional to avoid crashes
  message?: string | null;
  metadata?: any;
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
      {events.map((event) => (
        <div
          key={event.id || Math.random()}
          className="flex flex-col border-l border-gray-300 pl-4"
        >
          <div className="text-xs text-gray-500">
            {new Date(event.created_at || "").toLocaleString()}
          </div>

          {/* Safe type formatting */}
          <div className="font-medium text-gray-800 capitalize">
            {(event.type ?? "event").replace(/_/g, " ")}
          </div>

          {/* Show message if present */}
          {event.message && (
            <div className="text-sm text-gray-700 mt-1">
              {event.message}
            </div>
          )}

          {/* Show metadata if present */}
          {event.metadata && (
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 text-gray-700">
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
