"use client";

import { useCRM } from "@/context/CRMContent";

export default function AnalyticsPage() {
  const { leads, calls } = useCRM();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sales & Caller Analytics</h1>
        <p className="text-sm text-zinc-400">Performance insights for Solvrex business outreach.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white">Pipeline Breakdown</h2>
          <div className="space-y-3">
            {["Lead", "Proposal", "Negotiation", "Won"].map((stage) => {
              const count = leads.filter((l) => l.pipeline === stage).length;
              const percentage = leads.length ? (count / leads.length) * 100 : 0;
              return (
                <div key={stage}>
                  <div className="flex justify-between text-xs mb-1 text-slate-300">
                    <span>{stage}</span>
                    <span>{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-2">
                    <div className="bg-slate-300 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold text-white">Call Performance Summary</h2>
          <p className="text-sm text-zinc-400">Total calls completed: <span className="font-bold text-white">{calls.length}</span></p>
          <div className="p-4 bg-zinc-950 rounded-lg text-xs text-slate-300 space-y-2 border border-zinc-800">
            <p>⚡ Connected rate: <span className="text-white font-medium">85%</span></p>
            <p>⏱️ Avg Call Duration: <span className="text-white font-medium">3.5 mins</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}