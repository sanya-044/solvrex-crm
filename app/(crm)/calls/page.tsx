"use client";

import { useCRM } from "@/context/CRMContent";

export default function CallLogsPage() {
  const { calls } = useCRM();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Call Logs</h1>
        <p className="text-sm text-zinc-400">Track all caller activity, outcomes, and agent notes.</p>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-zinc-800/50 text-slate-300 text-xs uppercase">
            <tr>
              <th className="p-3">Lead Name</th>
              <th className="p-3">Date & Time</th>
              <th className="p-3">Outcome</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {calls.map((call) => (
              <tr key={call.id} className="hover:bg-zinc-800/40">
                <td className="p-3 font-semibold text-slate-100">{call.leadName}</td>
                <td className="p-3">{call.date}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs border ${call.outcome === "Connected" ? "bg-emerald-950 text-emerald-300 border-emerald-800" : "bg-amber-950 text-amber-300 border-amber-800"}`}>
                    {call.outcome}
                  </span>
                </td>
                <td className="p-3">{call.duration}</td>
                <td className="p-3 text-zinc-400">{call.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}