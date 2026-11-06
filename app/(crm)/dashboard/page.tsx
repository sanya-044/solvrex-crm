"use client";

import { useCRM, PipelineStage } from "@/context/CRMContent";
import Link from "next/link";
import { useState } from "react";

/* ---------- Calls vs connected chart ---------- */

const NOT_CONNECTED_OUTCOMES = ["Not answered", "Busy", "Wrong number"];
const DAY_MS = 24 * 60 * 60 * 1000;

type Bucket = { label: string; total: number; connected: number };

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseCallDate(date: string): { day: string; hour: number } {
  const m = date.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2})/);
  return m ? { day: m[1], hour: Number(m[2]) } : { day: date.slice(0, 10), hour: 0 };
}

function buildBuckets(calls: { date: string; outcome: string }[], timeframe: "today" | "week" | "month"): Bucket[] {
  const parsed = calls.map((c) => ({
    ...parseCallDate(c.date),
    connected: !NOT_CONNECTED_OUTCOMES.includes(c.outcome),
  }));

  // Real-time anchor: today's date
  let anchor = ymd(new Date());
  for (const p of parsed) if (p.day > anchor) anchor = p.day;
  const [y, m, d] = anchor.split("-").map(Number);
  const anchorDate = new Date(y, m - 1, d);

  if (timeframe === "today") {
    const list: Bucket[] = Array.from({ length: 13 }, (_, i) => {
      const h = 8 + i; // 8am .. 8pm
      return { label: `${h > 12 ? h - 12 : h}${h < 12 ? "a" : "p"}`, total: 0, connected: 0 };
    });
    for (const p of parsed) {
      if (p.day !== anchor) continue;
      const idx = Math.min(Math.max(p.hour - 8, 0), list.length - 1);
      list[idx].total += 1;
      if (p.connected) list[idx].connected += 1;
    }
    return list;
  }

  const days = timeframe === "week" ? 7 : 30;
  const index = new Map<string, number>();
  const list: Bucket[] = Array.from({ length: days }, (_, i) => {
    const dt = new Date(anchorDate.getTime() - (days - 1 - i) * DAY_MS);
    index.set(ymd(dt), i);
    return {
      label: timeframe === "week" ? dt.toLocaleDateString("en-US", { weekday: "short" }) : String(dt.getDate()),
      total: 0,
      connected: 0,
    };
  });
  for (const p of parsed) {
    const i = index.get(p.day);
    if (i === undefined) continue;
    list[i].total += 1;
    if (p.connected) list[i].connected += 1;
  }
  return list;
}

function niceStep(max: number): number {
  const raw = Math.max(1, Math.ceil(max / 4));
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
}

/** Smooth area chart: calls (green, filled) vs connected (amber). */
function CallsChart({ buckets, timeframe }: { buckets: Bucket[]; timeframe: "today" | "week" | "month" }) {
  const W = 800, H = 250, L = 40, R = 12, T = 12, B = 28;
  const pw = W - L - R;
  const ph = H - T - B;
  const n = buckets.length;
  const step = niceStep(Math.max(1, ...buckets.map((b) => b.total)));
  const top = step * 4;

  const x = (i: number) => L + (n === 1 ? pw / 2 : (i * pw) / (n - 1));
  const y = (v: number) => T + ph - (v / top) * ph;
  const curve = (vals: number[]) =>
    vals
      .map((v, i) => {
        if (i === 0) return `M${x(0)},${y(v)}`;
        const mx = (x(i - 1) + x(i)) / 2;
        return `C${mx},${y(vals[i - 1])} ${mx},${y(v)} ${x(i)},${y(v)}`;
      })
      .join(" ");

  const totals = buckets.map((b) => b.total);
  const connected = buckets.map((b) => b.connected);
  const area = `${curve(totals)} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Calls versus connected calls">
      <defs>
        <linearGradient id="callsFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="text-zinc-500">
        {[0, 1, 2, 3, 4].map((k) => (
          <g key={k}>
            <line x1={L} x2={W - R} y1={y(k * step)} y2={y(k * step)} stroke="currentColor" strokeOpacity="0.25" />
            <text x={L - 8} y={y(k * step) + 4} textAnchor="end" fontSize="11" fill="currentColor">
              {k * step}
            </text>
          </g>
        ))}
        {buckets.map((b, i) => {
          const hide = timeframe === "month" ? i % 5 !== 0 : timeframe === "today" ? i % 2 !== 0 : false;
          return hide ? null : (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="currentColor">
              {b.label}
            </text>
          );
        })}
      </g>

      <path d={area} fill="url(#callsFill)" />
      <path d={curve(totals)} fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinejoin="round" />
      <path d={curve(connected)} fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeLinejoin="round" />

      {buckets.map((b, i) => (
        <circle key={i} cx={x(i)} cy={y(b.total)} r="9" fill="transparent">
          <title>{`${b.label}: ${b.total} calls, ${b.connected} connected`}</title>
        </circle>
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const { leads, calls, stats, userRole, activeCallerName } = useCRM();
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("today");

  // Role-based lead filtering: If Caller, filter only their assigned leads; Admin sees all
  const filteredLeads =
    userRole === "Caller"
      ? leads.filter((l) => l.assignedCaller === activeCallerName)
      : leads;

  const filteredCalls =
    userRole === "Caller"
      ? calls.filter((c) => c.callerName === activeCallerName)
      : calls;

  const chartBuckets = buildBuckets(filteredCalls, timeframe);
  const chartTotal = chartBuckets.reduce((sum, b) => sum + b.total, 0);
  const chartLabel = timeframe === "today" ? "today" : timeframe === "week" ? "this week" : "this month";

  const totalFilteredLeads = filteredLeads.length;
  const wonDeals = filteredLeads.filter((l) => l.pipeline === "Won").length;
  const meetingsBooked = filteredLeads.filter(
    (l) => l.pipeline === "Meeting Booked",
  ).length;

  const callsMetric =
    timeframe === "today"
      ? stats.callsToday
      : timeframe === "week"
      ? stats.callsThisWeek
      : stats.callsThisMonth;

  const pipelineStages: { stage: PipelineStage; color: string; bg: string }[] = [
    { stage: "Lead", color: "text-zinc-300", bg: "bg-zinc-800" },
    { stage: "Contacted", color: "text-blue-300", bg: "bg-blue-900/30 border border-blue-700/50" },
    { stage: "Proposal", color: "text-purple-300", bg: "bg-purple-900/30 border border-purple-700/50" },
    { stage: "Negotiation", color: "text-amber-300", bg: "bg-amber-900/30 border border-amber-700/50" },
    { stage: "Meeting Booked", color: "text-cyan-300", bg: "bg-cyan-900/30 border border-cyan-700/50" },
    { stage: "Won", color: "text-emerald-300", bg: "bg-emerald-900/30 border border-emerald-700/50" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Mode Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Sales & Caller Dashboard
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                userRole === "Admin"
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              }`}
            >
              {userRole === "Admin" ? "👑 Admin Overview" : `🎧 ${activeCallerName}`}
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time connect metrics, daily call quota, pipeline velocity, and follow-up queues.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Start Call Queue Button */}
          <Link
            href="/calls/1"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition transform hover:scale-[1.02]"
          >
            <span>📞</span>
            <span>Start Today&apos;s Call Queue</span>
          </Link>
          <Link
            href="/leads"
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium px-3.5 py-2 rounded-xl text-xs transition"
          >
            <span>👥</span>
            <span>Manage Leads</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calls Metric Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Calls Made
            </span>
            <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 text-[10px]">
              <button
                type="button"
                onClick={() => setTimeframe("today")}
                className={`px-1.5 py-0.5 rounded ${timeframe === "today" ? "bg-amber-400 text-black font-bold" : "text-zinc-400"}`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("week")}
                className={`px-1.5 py-0.5 rounded ${timeframe === "week" ? "bg-amber-400 text-black font-bold" : "text-zinc-400"}`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("month")}
                className={`px-1.5 py-0.5 rounded ${timeframe === "month" ? "bg-amber-400 text-black font-bold" : "text-zinc-400"}`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{callsMetric}</span>
            <span className="text-xs text-zinc-500">
              {timeframe === "today" ? "/ 50 target" : "total logged"}
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (callsMetric / 50) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Connect Rate Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Connect Rate
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold border border-emerald-500/20">
              ⚡
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">
              {stats.connectRate}%
            </span>
            <span className="text-xs text-zinc-400">answered / pickup</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Industry benchmark: ~45-55%
          </p>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Conversions
            </span>
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm font-bold border border-purple-500/20">
              🎯
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-400">
              {stats.conversionRate}%
            </span>
            <span className="text-xs text-zinc-400">meeting/won rate</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {meetingsBooked} booked • {wonDeals} deals won
          </p>
        </div>

        {/* Follow-ups Due Today Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Follow-ups Due Today
            </span>
            <span className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-sm font-bold border border-red-500/20">
              🔔
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {stats.followupsDueToday.length}
            </span>
            <span className="text-xs text-amber-400 font-medium">scheduled</span>
          </div>
          <Link
            href="/followups"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold mt-2 inline-block transition"
          >
            Review priority queue →
          </Link>
        </div>
      </div>

      {/* Calls vs Connected chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-base font-bold text-white">Calls vs Connected · {chartLabel}</h2>
          <div className="flex items-center gap-4">
            <div className="flex gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <i className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Calls
              </span>
              <span className="flex items-center gap-1.5">
                <i className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Connected
              </span>
            </div>
            <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 text-[10px]">
              {(["today", "week", "month"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeframe(t)}
                  className={`px-1.5 py-0.5 rounded capitalize ${timeframe === t ? "bg-amber-400 text-black font-bold" : "text-zinc-400"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <CallsChart buckets={chartBuckets} timeframe={timeframe} />
        {chartTotal === 0 && (
          <p className="text-xs text-zinc-500 mt-2">No calls logged in this period.</p>
        )}
      </div>

      {/* Pipeline By Stage (Horizontal Cards) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Pipeline Breakdown</h2>
            <p className="text-xs text-zinc-400">
              Total {totalFilteredLeads} leads across active deal stages
            </p>
          </div>
          <Link
            href="/leads"
            className="text-xs text-amber-400 hover:underline font-medium"
          >
            View Leads Table →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineStages.map((ps) => {
            const count = filteredLeads.filter((l) => l.pipeline === ps.stage).length;
            const percentage =
              totalFilteredLeads > 0
                ? Math.round((count / totalFilteredLeads) * 100)
                : 0;
            return (
              <div
                key={ps.stage}
                className={`p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${ps.color}`}>
                    {ps.stage}
                  </span>
                  <span className="text-[10px] text-zinc-500">{percentage}%</span>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-white">{count}</span>
                  <span className="text-[10px] text-zinc-500 ml-1">leads</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Follow-ups Due Today + Caller Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Follow-ups Due Today (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📅</span>
              <h2 className="text-base font-bold text-white">
                Today&apos;s Calls Queue ({stats.followupsDueToday.length})
              </h2>
            </div>
            <Link
              href="/calls/1"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
            >
              📞 Call First Lead
            </Link>
          </div>

          <div className="space-y-2.5">
            {stats.followupsDueToday.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {lead.name}
                    </h3>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        lead.priority === "High"
                          ? "bg-red-950/60 text-red-300 border border-red-800/80"
                          : "bg-amber-950/60 text-amber-300 border border-amber-800/80"
                      }`}
                    >
                      {lead.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                    <span>👤 {lead.contactPerson}</span>
                    <span>📍 {lead.city}</span>
                    <span>⏰ {lead.followUpTime || "Anytime"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/calls/${lead.id}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition flex items-center gap-1 shadow-md shadow-emerald-500/10"
                  >
                    <span>📞</span>
                    <span>Call Now</span>
                  </Link>
                </div>
              </div>
            ))}

            {stats.followupsDueToday.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-sm">
                🎉 No pending follow-ups due today. You&apos;re all caught up!
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard per Caller (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🏆</span>
              <h2 className="text-base font-bold text-white">Caller Leaderboard</h2>
            </div>
            <span className="text-xs text-zinc-500">Live Team Ranking</span>
          </div>

          <div className="space-y-2">
            {stats.callerLeaderboard.map((member, idx) => (
              <div
                key={member.callerName}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      idx === 0
                        ? "bg-amber-400 text-black shadow"
                        : idx === 1
                        ? "bg-slate-300 text-black"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white">
                      {member.callerName}
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      {member.callsMade} calls • {member.connected} connects
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">
                    {member.meetingsBooked} Booked
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {member.conversionRate}% Conv.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
