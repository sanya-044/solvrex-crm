"use client";

import { useCRM, Priority } from "@/context/CRMContent";
import Link from "next/link";
import { useState } from "react";

export default function FollowupsPage() {
  const { leads, updateLead, userRole, activeCallerName } = useCRM();
  const [activeTab, setActiveTab] = useState<"today" | "overdue" | "high" | "all">("today");

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter based on role (Admin sees all, Caller sees only their leads)
  const accessibleLeads =
    userRole === "Caller"
      ? leads.filter((l) => l.assignedCaller?.toLowerCase() === activeCallerName?.toLowerCase())
      : leads;

  const scheduledLeads = accessibleLeads.filter((l) => l.followUpDate);

  // Sorting: High priority first, then Medium, then Low
  const priorityOrder: Record<Priority, number> = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const sortedFollowups = [...scheduledLeads].sort((a, b) => {
    const pDiff =
      (priorityOrder[b.priority || "Medium"] || 0) -
      (priorityOrder[a.priority || "Medium"] || 0);
    if (pDiff !== 0) return pDiff;
    return (a.followUpTime || "").localeCompare(b.followUpTime || "");
  });

  const overdueLeads = sortedFollowups.filter(
    (l) => l.followUpDate < todayStr && l.pipeline !== "Won" && l.pipeline !== "Lost"
  );
  const dueTodayLeads = sortedFollowups.filter((l) => l.followUpDate === todayStr);
  const highPriorityLeads = sortedFollowups.filter((l) => l.priority === "High");

  const displayLeads = sortedFollowups.filter((l) => {
    if (activeTab === "today") return l.followUpDate === todayStr;
    if (activeTab === "overdue") return l.followUpDate < todayStr && l.pipeline !== "Won" && l.pipeline !== "Lost";
    if (activeTab === "high") return l.priority === "High";
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Follow-up Reminders &amp; Calling Queue
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Prioritized daily queue of scheduled callbacks and warm prospect follow-ups.
          </p>
        </div>

        <Link
          href="/calls/1"
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition transform hover:scale-[1.02]"
        >
          <span>⚡</span>
          <span>Start Queue Speed-Dial</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 w-fit text-xs gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("today")}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
            activeTab === "today"
              ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(8,199,233,0.35)] border border-cyan-400/50"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>🔥</span>
          <span>Due Today ({dueTodayLeads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overdue")}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
            activeTab === "overdue"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>⏰</span>
          <span>Overdue ({overdueLeads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("high")}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
            activeTab === "high"
              ? "bg-red-500/20 text-red-300 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.3)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>🚨</span>
          <span>High Priority ({highPriorityLeads.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
            activeTab === "all"
              ? "bg-zinc-800 text-white border border-slate-600"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>📅</span>
          <span>All Scheduled ({sortedFollowups.length})</span>
        </button>
      </div>

      {/* Follow-ups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayLeads.map((lead) => (
          <div
            key={lead.id}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-5 rounded-2xl space-y-3 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-base">{lead.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {lead.contactPerson} • {lead.category}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase shrink-0 border ${
                    lead.priority === "High"
                      ? "bg-red-950/70 text-red-300 border-red-700/60 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                      : lead.priority === "Medium"
                      ? "bg-amber-950/70 text-amber-300 border-amber-700/60"
                      : "bg-cyan-950/70 text-cyan-300 border-cyan-700/60 shadow-[0_0_8px_rgba(8,199,233,0.15)]"
                  }`}
                >
                  {lead.priority || "Medium"} Priority
                </span>
              </div>

              {/* Timing */}
              <div className="mt-3 p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 text-xs flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span>📅</span>
                  <span className="font-semibold">{lead.followUpDate}</span>
                </span>
                <span className="text-cyan-400 font-mono font-bold">
                  ⏰ {lead.followUpTime || "12:00 PM"}
                </span>
              </div>

              {lead.notes && (
                <p className="text-xs text-zinc-400 italic mt-2.5 line-clamp-2">
                  &ldquo;{lead.notes}&rdquo;
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center gap-2">
              <Link
                href={`/calls/${lead.id}`}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
              >
                <span>📞 Call Now</span>
              </Link>

              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hi ${lead.contactPerson || lead.name}, this is ${activeCallerName} from Solvrex. Following up on our scheduled discussion!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400/60 text-xs font-semibold transition flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                  title="Chat on WhatsApp"
                >
                  💬
                </a>
              )}

              <button
                type="button"
                onClick={() => updateLead(lead.id, { followUpDate: "" })}
                className="px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-750 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-semibold transition"
                title="Mark Completed"
              >
                ✓ Done
              </button>
            </div>
          </div>
        ))}

        {displayLeads.length === 0 && (
          <div className="col-span-full p-12 text-center text-zinc-500 text-sm bg-zinc-900/50 rounded-2xl border border-zinc-800/80">
            🎉 No follow-ups pending in this view! All prospect tasks are completed.
          </div>
        )}
      </div>
    </div>
  );
}
