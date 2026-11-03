"use client";

import { useCRM } from "@/context/CRMContent";

export default function AnalyticsPage() {
  const { leads, calls, stats } = useCRM();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white">Sales &amp; Caller Analytics</h1>
        <p className="text-sm text-zinc-400 mt-1">Performance insights for Solvrex business outreach.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white">Calls Volume &amp; Quota</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1">
                <span>Today ({stats.callsToday} / 50 target)</span>
                <span className="font-bold text-amber-400">{Math.round((stats.callsToday / 50) * 100)}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(100, (stats.callsToday / 50) * 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1">
                <span>Weekly Connect Rate</span>
                <span className="font-bold text-emerald-400">{stats.connectRate}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${stats.connectRate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1">
                <span>Deal Conversion Rate</span>
                <span className="font-bold text-purple-400">{stats.conversionRate}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: `${stats.conversionRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white">Pipeline Summary</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 block">Total Active Leads</span>
              <span className="text-xl font-bold text-white mt-1 block">{leads.length}</span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 block">Deals Won</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">
                {leads.filter((l) => l.pipeline === "Won").length}
              </span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 block">Meetings Booked</span>
              <span className="text-xl font-bold text-cyan-400 mt-1 block">
                {leads.filter((l) => l.pipeline === "Meeting Booked").length}
              </span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 block">Total Calls Logged</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">{calls.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
