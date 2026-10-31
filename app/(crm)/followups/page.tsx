"use client";

import { useCRM } from "@/context/CRMContent";

export default function FollowupsPage() {
  const { leads } = useCRM();
  const scheduledLeads = leads.filter((l) => l.followUpDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Scheduled Follow-ups</h1>
        <p className="text-sm text-zinc-400">Keep track of sales calls that need urgent follow-up attention.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scheduledLeads.map((lead) => (
          <div key={lead.id} className="bg-zinc-900 p-4 rounded-xl flex justify-between items-center border border-zinc-800">
            <div>
              <h3 className="font-semibold text-white">{lead.name}</h3>
              <p className="text-xs text-zinc-400">Contact: {lead.contactPerson} ({lead.phone})</p>
              <p className="text-xs text-cyan-400 mt-1">📅 Scheduled Date: {lead.followUpDate}</p>
            </div>
            <button className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded text-xs text-white">
              Mark Completed
            </button>
          </div>
        ))}

        {scheduledLeads.length === 0 && (
          <p className="text-sm text-zinc-500 italic">No upcoming follow-ups scheduled.</p>
        )}
      </div>
    </div>
  );
}