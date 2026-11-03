"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCRM, STAGES, STAGE_STYLE, callTime, toDateStr } from "@/context/CRMContent";
import type { CallLog, Lead } from "@/context/CRMContent";
import LogCallModal from "@/components/LogCallModal";
import TopbarActions from "@/components/TopbarActions";

type Range = "today" | "week" | "month";

const RANGES: { key: Range; label: string; days: number; chart: string }[] = [
  { key: "today", label: "Today", days: 1, chart: "today" },
  { key: "week", label: "This week", days: 7, chart: "this week" },
  { key: "month", label: "This month", days: 30, chart: "this month" },
];
const NOT_CONNECTED = ["No Answer", "Busy", "Wrong Number", "Not Interested"];
const DAY = 24 * 60 * 60 * 1000;
const PRIORITY_RANK: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
const PRIORITY_STYLE: Record<string, string> = {
  High: "bg-rose-100 text-rose-700 ",
  Medium: "bg-amber-100 text-amber-700 ",
  Low: "bg-slate-100 text-slate-600",
};

type Bucket = { label: string; total: number; connected: number };
type Delta = { text: string; dir: "up" | "down" | "flat" };

function startOfDay(base: Date, shiftDays = 0): Date {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + shiftDays);
  return d;
}

function summarize(list: CallLog[]) {
  const total = list.length;
  const connected = list.filter((c) => !NOT_CONNECTED.includes(c.outcome)).length;
  return {
    total,
    connected,
    rate: total ? (connected / total) * 100 : 0,
    meetings: list.filter((c) => c.outcome === "Meeting booked").length,
    won: list.filter((c) => c.outcome === "Won").length,
  };
}

function countDelta(cur: number, prev: number): Delta {
  if (prev === 0) return cur === 0 ? { text: "no change", dir: "flat" } : { text: "new activity", dir: "up" };
  const pct = Math.round(((cur - prev) / prev) * 100);
  return { text: `${pct >= 0 ? "+" : ""}${pct}% vs last`, dir: pct >= 0 ? "up" : "down" };
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function Svg({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const PHONE = "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z";

const IconPhone = () => (
  <Svg>
    <path d={PHONE} />
  </Svg>
);
const IconPhoneIn = () => (
  <Svg>
    <polyline points="16 2 16 8 22 8" />
    <line x1="23" y1="1" x2="16" y2="8" />
    <path d={PHONE} />
  </Svg>
);
const IconTarget = () => (
  <Svg>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </Svg>
);
const IconAward = () => (
  <Svg>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </Svg>
);
const IconClock = () => (
  <Svg size={15}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Svg>
);

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Kpi({ title, value, delta, icon }: { title: string; value: string; delta: Delta; icon: ReactNode }) {
  const tone =
    delta.dir === "up" ? "text-emerald-600 " : delta.dir === "down" ? "text-rose-600 " : "text-slate-500";
  return (
    <div className="bg-white border border-[#d9e7e3] rounded-2xl p-5">
      <div className="flex justify-between items-start">
        <p className="text-sm text-slate-500">{title}</p>
        <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600  flex items-center justify-center">{icon}</span>
      </div>
      <h3 className="text-4xl font-extrabold text-[#102a2a] mt-3">{value}</h3>
      <p className={`text-xs mt-2 flex items-center gap-1 ${tone}`}>
        {delta.dir !== "flat" && (
          <Svg size={12}>
            {delta.dir === "up" ? (
              <>
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </>
            ) : (
              <>
                <line x1="7" y1="7" x2="17" y2="17" />
                <polyline points="17 7 17 17 7 17" />
              </>
            )}
          </Svg>
        )}
        {delta.text}
      </p>
    </div>
  );
}

function niceStep(max: number): number {
  const raw = Math.max(1, Math.ceil(max / 4));
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
}

/** Smooth area chart: calls (teal, filled) vs connected (amber). */
function CallsChart({ buckets, range }: { buckets: Bucket[]; range: Range }) {
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
          <stop offset="0%" stopColor="#0f8f6d" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0f8f6d" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="text-slate-500">
        {[0, 1, 2, 3, 4].map((k) => (
          <g key={k}>
            <line x1={L} x2={W - R} y1={y(k * step)} y2={y(k * step)} stroke="currentColor" strokeOpacity="0.18" />
            <text x={L - 8} y={y(k * step) + 4} textAnchor="end" fontSize="11" fill="currentColor">
              {k * step}
            </text>
          </g>
        ))}
        {buckets.map((b, i) => {
          const hide = range === "month" ? i % 5 !== 0 : range === "today" ? i % 2 !== 0 : false;
          return hide ? null : (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="currentColor">
              {b.label}
            </text>
          );
        })}
      </g>

      <path d={area} fill="url(#callsFill)" />
      <path d={curve(totals)} fill="none" stroke="#0f8f6d" strokeWidth="2.2" strokeLinejoin="round" />
      <path d={curve(connected)} fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinejoin="round" />

      {buckets.map((b, i) => (
        <circle key={i} cx={x(i)} cy={y(b.total)} r="9" fill="transparent">
          <title>{`${b.label}: ${b.total} calls, ${b.connected} connected`}</title>
        </circle>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { hydrated, visibleLeads, visibleCalls, isManager, team, currentUser, updateLead } = useCRM();
  const router = useRouter();
  const [range, setRange] = useState<Range>("week");
  const [callLead, setCallLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");

  const cfg = RANGES.find((r) => r.key === range) ?? RANGES[1];

  const { cur, prev, startMs } = useMemo(() => {
    const start = startOfDay(new Date(), -(cfg.days - 1)).getTime();
    const prevStart = startOfDay(new Date(start), -cfg.days).getTime();
    const current: CallLog[] = [];
    const previous: CallLog[] = [];
    for (const c of visibleCalls) {
      const t = callTime(c);
      if (t >= start) current.push(c);
      else if (t >= prevStart) previous.push(c);
    }
    return { cur: current, prev: previous, startMs: start };
  }, [visibleCalls, cfg.days]);

  const s = summarize(cur);
  const p = summarize(prev);
  const rateDiff = s.rate - p.rate;
  const rateDelta: Delta =
    p.total === 0
      ? { text: "no previous data", dir: "flat" }
      : { text: `${rateDiff >= 0 ? "+" : ""}${rateDiff.toFixed(1)}% vs last`, dir: rateDiff >= 0 ? "up" : "down" };

  // Chart buckets: hours for "today", days otherwise.
  const buckets = useMemo<Bucket[]>(() => {
    const isToday = range === "today";
    const count = isToday ? 13 : cfg.days; // 8am..8pm
    const list: Bucket[] = Array.from({ length: count }, (_, i) => {
      let label: string;
      if (isToday) {
        const h = 8 + i;
        label = `${h > 12 ? h - 12 : h}${h < 12 ? "a" : "p"}`;
      } else {
        const d = new Date(startMs + i * DAY);
        label = range === "week" ? d.toLocaleDateString("en-US", { weekday: "short" }) : String(d.getDate());
      }
      return { label, total: 0, connected: 0 };
    });
    for (const c of cur) {
      const t = callTime(c);
      const idx = isToday
        ? Math.min(Math.max(new Date(t).getHours() - 8, 0), count - 1)
        : Math.min(Math.max(Math.floor((startOfDay(new Date(t)).getTime() - startMs) / DAY), 0), count - 1);
      list[idx].total += 1;
      if (!NOT_CONNECTED.includes(c.outcome)) list[idx].connected += 1;
    }
    return list;
  }, [cur, range, cfg.days, startMs]);

  // Pipeline by stage
  const stageCounts = useMemo(
    () => STAGES.map((st) => ({ stage: st, count: visibleLeads.filter((l) => l.stage === st).length })),
    [visibleLeads]
  );
  const maxStage = Math.max(1, ...stageCounts.map((x) => x.count));

  // Leaderboard (callers only see themselves)
  const leaderboard = useMemo(() => {
    const names = isManager ? team.map((t) => t.name) : [currentUser.name];
    return names
      .map((name) => ({ name, ...summarize(cur.filter((c) => c.caller === name)) }))
      .sort((a, b) => b.won - a.won || b.total - a.total);
  }, [cur, isManager, team, currentUser.name]);

  // Follow-ups due today (and overdue)
  const today = toDateStr(new Date());
  const queue = useMemo(() => {
    return visibleLeads
      .filter((l) => l.followUpDate && l.followUpDate <= today && l.stage !== "Won" && l.stage !== "Lost")
      .sort(
        (a, b) =>
          PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
          a.followUpDate.localeCompare(b.followUpDate) ||
          a.followUpTime.localeCompare(b.followUpTime)
      );
  }, [visibleLeads, today]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      sessionStorage.setItem("solvrex_lead_q", search.trim());
    } catch {}
    router.push("/leads");
  };

  if (!hydrated) return <p className="text-sm text-slate-500">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      {/* Search in the top bar: opens the Leads page with the text filled in */}
      <TopbarActions>
        <form onSubmit={submitSearch} className="relative hidden sm:block">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads, phone, city..."
            aria-label="Search leads"
            className="w-72 pl-9 pr-3 py-2 bg-white border border-[#d9e7e3] rounded-lg text-sm text-[#102a2a] placeholder:text-slate-500 outline-none focus:border-[#009879]"
          />
        </form>
      </TopbarActions>

      {/* Range toggle */}
      <div className="inline-flex bg-[#eaf2ef] rounded-xl p-1">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-4 py-1.5 text-sm rounded-lg transition ${
              range === r.key ? "bg-white text-[#102a2a] font-semibold shadow-sm" : "text-slate-500 hover:text-[#102a2a]"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Calls made" value={String(s.total)} delta={countDelta(s.total, p.total)} icon={<IconPhone />} />
        <Kpi title="Connect rate" value={`${Math.round(s.rate)}%`} delta={rateDelta} icon={<IconPhoneIn />} />
        <Kpi title="Meetings booked" value={String(s.meetings)} delta={countDelta(s.meetings, p.meetings)} icon={<IconTarget />} />
        <Kpi title="Conversions" value={String(s.won)} delta={countDelta(s.won, p.won)} icon={<IconAward />} />
      </div>

      {/* Chart + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-[#d9e7e3] rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-[#102a2a]">Calls vs connected · {cfg.chart}</h2>
            <div className="flex gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-[#0f8f6d] inline-block" /> Calls</span>
              <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block" /> Connected</span>
            </div>
          </div>
          <CallsChart buckets={buckets} range={range} />
          {s.total === 0 && <p className="text-xs text-slate-500 mt-2">No calls logged in this period. Log a call from the Leads page.</p>}
        </div>

        <div className="bg-white border border-[#d9e7e3] rounded-2xl p-5">
          <h2 className="text-base font-semibold text-[#102a2a] mb-5">Pipeline by stage</h2>
          <div className="space-y-4">
            {stageCounts.map(({ stage, count }) => (
              <div key={stage}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${STAGE_STYLE[stage]}`}>{stage}</span>
                  <span className="text-sm font-semibold text-[#102a2a]">{count}</span>
                </div>
                <div className="h-1.5 bg-[#eaf2ef] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(count / maxStage) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard + Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-[#d9e7e3] rounded-2xl p-5">
          <h2 className="text-base font-semibold text-[#102a2a] mb-4">Leaderboard</h2>
          <ul className="space-y-3.5">
            {leaderboard.map((row, i) => (
              <li key={row.name} className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full text-sm font-semibold flex items-center justify-center shrink-0 ${
                    i === 0 ? "bg-amber-100 text-amber-700 " : "bg-[#eaf2ef] text-slate-600"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#102a2a] truncate">{row.name}</p>
                  <p className="text-xs text-slate-500">{row.total} calls · {Math.round(row.rate)}% connect</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 ">
                  {row.won} won
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2 bg-white border border-[#d9e7e3] rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-[#102a2a]">Today&apos;s calls queue</h2>
            <a href="/leads" className="text-xs text-slate-500 hover:text-[#102a2a]">View all</a>
          </div>
          {queue.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No follow-ups due today.</p>
          ) : (
            <ul className="divide-y divide-[#d9e7e3]">
              {queue.slice(0, 8).map((lead) => (
                <li key={lead.id} className="py-3.5 flex items-center gap-4">
                  <div className="w-20 shrink-0">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 ">
                      <IconClock />
                      <span className="text-[#102a2a]">{lead.followUpTime || "--:--"}</span>
                    </div>
                    {lead.followUpDate < today && <div className="text-[11px] text-rose-500 pl-5">Overdue</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#102a2a] truncate">{lead.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {[lead.contactPerson, lead.city, lead.assignedTo].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_STYLE[lead.priority]}`}>{lead.priority}</span>
                  <button
                    onClick={() => updateLead(lead.id, { followUpDate: "", followUpTime: "" })}
                    className="text-xs text-slate-500 hover:text-[#102a2a] px-1"
                    title="Mark follow-up done"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setCallLead(lead)}
                    title="Call"
                    className="w-9 h-9 rounded-lg border border-[#d9e7e3] text-slate-500 hover:bg-[#eaf2ef] hover:text-[#102a2a] flex items-center justify-center"
                  >
                    <IconPhone />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {callLead && <LogCallModal key={callLead.id} lead={callLead} onClose={() => setCallLead(null)} />}
    </div>
  );
}
