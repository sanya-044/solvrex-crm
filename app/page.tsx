 "use client";

import { useCRM } from "@/context/CRMContent";
import Link from "next/link";

export default function Dashboard() {
  const { leads, calls } = useCRM();

  const totalLeads = leads.length;
  const pendingFollowups = leads.filter((l) => l.followUpDate).length;
  const wonDeals = leads.filter((l) => l.pipeline === "Won").length;
  const totalCalls = calls.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Caller Dashboard</h1>
          <p className="text-sm text-zinc-400">Welcome back! Here is your team's sales progress.</p>
        </div>
        <Link
          href="/leads"
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow"
        >
          + Add New Lead
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Leads" value={totalLeads} icon="👥" change="+12% this week" />
        <MetricCard title="Total Calls Logged" value={totalCalls} icon="📞" change="Active" />
        <MetricCard title="Pending Follow-ups" value={pendingFollowups} icon="📅" change="Scheduled" />
        <MetricCard title="Won Deals" value={wonDeals} icon="🎯" change={`${Math.round((wonDeals / totalLeads || 0) * 100)}% Conv. Rate`} />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">Recent Leads Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs uppercase bg-zinc-800/60 text-slate-300">
              <tr>
                <th className="p-3">Business Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Pipeline</th>
                <th className="p-3">Next Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-800/40">
                  <td className="p-3 font-medium text-slate-100">{lead.name}</td>
                  <td className="p-3">{lead.contactPerson}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 text-xs rounded-full bg-zinc-800 text-slate-200 border border-zinc-700">
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-3">{lead.pipeline}</td>
                  <td className="p-3">{lead.followUpDate || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, change }: { title: string; value: number; icon: string; change: string }) {
  return (
    <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex justify-between items-start">
      <div>
        <p className="text-xs font-medium text-zinc-400 uppercase">{title}</p>
        <h3 className="text-3xl font-extrabold text-white mt-1">{value}</h3>
        <p className="text-xs text-zinc-500 mt-2">{change}</p>
      </div>
      <span className="text-2xl p-2 rounded-lg bg-zinc-800">{icon}</span>
    </div>
  );
}