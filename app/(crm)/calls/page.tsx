"use client";

import { useCRM } from "@/context/CRMContent";
import Link from "next/link";
import { useState } from "react";

export default function CallLogsPage() {
  const { calls, userRole, activeCallerName } = useCRM();
  const [filterOutcome, setFilterOutcome] = useState<string>("All");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const filteredCalls = calls.filter((c) => {
    if (userRole === "Caller" && c.callerName?.toLowerCase() !== activeCallerName?.toLowerCase()) {
      return false;
    }
    if (filterOutcome !== "All" && c.outcome !== filterOutcome) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Call Logs & Audio Recordings
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Review logged conversations, agent dispositions, and audio recordings.
          </p>
        </div>

        <Link
          href="/calls/1"
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold px-4 py-2 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition transform hover:scale-[1.02]"
        >
          <span>📞</span>
          <span>Start Live Call Workspace</span>
        </Link>
      </div>

      {/* Filter by outcome */}
      <div className="flex flex-wrap items-center gap-2 bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-xs">
        <span className="text-zinc-400 font-semibold px-2">Filter Outcome:</span>
        {[
          "All",
          "Won",
          "Meeting booked",
          "Interested",
          "Call back",
          "Not answered",
          "Busy",
        ].map((outcome) => (
          <button
            key={outcome}
            type="button"
            onClick={() => setFilterOutcome(outcome)}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterOutcome === outcome
                ? "bg-amber-400 text-black font-bold shadow"
                : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            {outcome}
          </button>
        ))}
      </div>

      {/* Call Logs Table */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Lead Business</th>
                <th className="p-3.5">Caller</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Outcome</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Call Audio Player</th>
                <th className="p-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-zinc-800/40 transition">
                  {/* Lead Name */}
                  <td className="p-3.5 font-bold text-white text-sm">
                    <Link
                      href={`/calls/${call.leadId}`}
                      className="hover:text-amber-400 hover:underline"
                    >
                      {call.leadName}
                    </Link>
                  </td>

                  {/* Caller */}
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px]">
                      {call.callerName}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="p-3.5 text-zinc-400 font-mono text-[11px]">
                    {call.date}
                  </td>

                  {/* Outcome Badge */}
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-block border ${
                        call.outcome === "Won"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                          : call.outcome === "Meeting booked"
                          ? "bg-cyan-950 text-cyan-300 border-cyan-700"
                          : call.outcome === "Interested"
                          ? "bg-blue-950 text-blue-300 border-blue-700"
                          : call.outcome === "Call back"
                          ? "bg-purple-950 text-purple-300 border-purple-700"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      {call.outcome}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="p-3.5 font-mono text-zinc-300">
                    ⏱️ {call.duration}
                  </td>

                  {/* Audio Player */}
                  <td className="p-3.5 min-w-[220px]">
                    {call.recordingUrl ? (
                      <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            if (playingAudioId === call.id) {
                              setPlayingAudioId(null);
                            } else {
                              setPlayingAudioId(call.id);
                            }
                          }}
                          className="w-7 h-7 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center font-bold text-xs shrink-0 shadow"
                        >
                          {playingAudioId === call.id ? "⏸" : "▶"}
                        </button>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[10px] text-zinc-400 font-medium truncate">
                            {playingAudioId === call.id ? "Playing Audio..." : "Call Audio Recording"}
                          </p>
                          {playingAudioId === call.id && (
                            <audio
                              src={call.recordingUrl}
                              autoPlay
                              controls
                              className="w-full h-6 mt-1 scale-90 -ml-2"
                              onEnded={() => setPlayingAudioId(null)}
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-600 italic text-[11px]">
                        No recording attached
                      </span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="p-3.5 text-zinc-400 text-xs max-w-xs truncate">
                    {call.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCalls.length === 0 && (
            <div className="p-12 text-center text-zinc-500 text-sm">
              No calls match this filter. Start logging calls from the active lead queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
