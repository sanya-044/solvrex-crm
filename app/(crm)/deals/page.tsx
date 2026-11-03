"use client";

import Link from "next/link";
import { useCRM, PipelineStage } from "@/context/CRMContent";

const dealStages: PipelineStage[] = [
  "Proposal",
  "Negotiation",
  "Meeting Booked",
  "Won",
  "Lost",
];

export default function DealsPage() {
  const { leads, userRole, activeCallerName } = useCRM();

  const accessibleLeads =
    userRole === "Caller"
      ? leads.filter((lead) => lead.assignedCaller === activeCallerName)
      : leads;

  const deals = accessibleLeads.filter((lead) => dealStages.includes(lead.pipeline));
  const dealValue = (lead: (typeof leads)[number]) =>
    lead.category === "Enterprise"
      ? 75000
      : lead.category === "Premium"
        ? 45000
        : 25000;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white">Deals</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Track opportunities through the sales pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-400">Open deals</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {deals.filter((lead) => !["Won", "Lost"].includes(lead.pipeline)).length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-400">Pipeline value</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">
            {deals
              .filter((lead) => !["Won", "Lost"].includes(lead.pipeline))
              .reduce((total, lead) => total + dealValue(lead), 0)
              .toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs text-zinc-400">Won deals</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {deals.filter((lead) => lead.pipeline === "Won").length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        {deals.length === 0 ? (
          <div className="p-10 text-center text-sm text-zinc-400">No deals found in the current pipeline.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {deals.map((lead) => (
              <div key={lead.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-semibold text-white">{lead.name}</p>
                  <p className="text-xs text-zinc-500">{lead.contactPerson} • {lead.city}</p>
                </div>
                <span className="text-sm font-semibold text-amber-400">
                  {dealValue(lead).toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  })}
                </span>
                <Link
                  href={`/calls/${lead.id}`}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-center text-xs font-semibold text-zinc-200 hover:border-amber-400 hover:text-amber-400"
                >
                  {lead.pipeline}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
