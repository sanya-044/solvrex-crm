"use client";

import { useState, useMemo } from "react";
import { useCRM, PipelineStage } from "@/context/CRMContent";
import Link from "next/link";

export default function DealsPage() {
  const { leads, updateLead } = useCRM();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("All");

  const stages: PipelineStage[] = [
    "Lead",
    "Contacted",
    "Proposal",
    "Negotiation",
    "Meeting Booked",
    "Won",
    "Lost",
  ];

  const filteredDeals = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStage = stageFilter === "All" || l.pipeline === stageFilter;
      return matchSearch && matchStage;
    });
  }, [leads, searchTerm, stageFilter]);

  const stats = useMemo(() => {
    const totalDeals = leads.length;
    const wonDeals = leads.filter((l) => l.pipeline === "Won").length;
    const activePipeline = leads.filter(
      (l) => !["Won", "Lost"].includes(l.pipeline)
    ).length;
    const totalPipelineValue = leads.length * 45000;

    return { totalDeals, wonDeals, activePipeline, totalPipelineValue };
  }, [leads]);

  return (
    <div className="space-y-4 max-w-[1550px] mx-auto select-none pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Deals &amp; Pipeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              {filteredDeals.length} Deals
            </span>
          </div>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Track revenue, deal stages, and close rates across your enterprise pipeline
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/leads"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5"
          >
            <span>+ Add New Deal</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl glass-panel relative overflow-hidden">
          <div className="glass-rim" />
          <p className="text-[11px] font-semibold text-slate-400">Total Deals</p>
          <p className="text-2xl font-black text-white mt-1">{stats.totalDeals}</p>
        </div>
        <div className="p-3.5 rounded-2xl glass-panel relative overflow-hidden">
          <div className="glass-rim" />
          <p className="text-[11px] font-semibold text-cyan-400">Active Pipeline</p>
          <p className="text-2xl font-black text-white mt-1">{stats.activePipeline}</p>
        </div>
        <div className="p-3.5 rounded-2xl glass-panel relative overflow-hidden">
          <div className="glass-rim" />
          <p className="text-[11px] font-semibold text-emerald-400">Won Deals</p>
          <p className="text-2xl font-black text-emerald-300 mt-1">{stats.wonDeals}</p>
        </div>
        <div className="p-3.5 rounded-2xl glass-panel relative overflow-hidden">
          <div className="glass-rim" />
          <p className="text-[11px] font-semibold text-purple-400">Pipeline Value</p>
          <p className="text-2xl font-black text-purple-200 mt-1">
            ₹{stats.totalPipelineValue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-3 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search deals by company, person or category..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Stage:</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-[#091122] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All Stages</option>
            {stages.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deals List */}
      <div className="rounded-2xl glass-panel overflow-hidden relative">
        <div className="glass-rim" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-4 py-3">Company / Deal</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assigned Caller</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No deals match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {deal.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">{deal.name}</p>
                          <p className="text-[10px] text-slate-400">{deal.city} • {deal.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{deal.contactPerson}</p>
                      <p className="text-[10px] text-slate-400">{deal.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={deal.pipeline}
                        onChange={(e) => updateLead(deal.id, { pipeline: e.target.value as PipelineStage })}
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0d1628] border border-cyan-500/40 text-cyan-300 focus:outline-none cursor-pointer"
                      >
                        {stages.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          deal.priority === "High"
                            ? "bg-rose-950/70 border-rose-500/50 text-rose-300"
                            : deal.priority === "Medium"
                            ? "bg-amber-950/70 border-amber-500/50 text-amber-300"
                            : "bg-slate-800/60 border-slate-700/50 text-slate-400"
                        }`}
                      >
                        {deal.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {deal.assignedCaller || "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/calls`}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition text-[11px] font-semibold border border-white/10"
                      >
                        View Calls
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
