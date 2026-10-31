"use client";

import { useState } from "react";
import { useCRM, Lead } from "@/context/CRMContent";

export default function LeadsPage() {
  const { leads, addLead, deleteLead, addCallLog } = useCRM();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Lead, "id">>({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    status: "New",
    pipeline: "Lead",
    notes: "",
    followUpDate: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addLead(formData);
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      status: "New",
      pipeline: "Lead",
      notes: "",
      followUpDate: ""
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads Directory</h1>
          <p className="text-sm text-zinc-400">Manage business prospects, edit details, and trigger calls.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 rounded-lg text-sm text-white font-medium"
        >
          + Add Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">{lead.name}</h3>
                <p className="text-xs text-zinc-400">{lead.contactPerson}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-slate-200 border border-zinc-700">{lead.status}</span>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p>📞 {lead.phone}</p>
              <p>✉️ {lead.email}</p>
              <p>📌 Stage: <span className="text-white font-medium">{lead.pipeline}</span></p>
              {lead.followUpDate && <p>📅 Follow-up: {lead.followUpDate}</p>}
            </div>

            {lead.notes && (
              <p className="text-xs italic bg-zinc-950 p-2 rounded text-zinc-400 border border-zinc-800">&quot;{lead.notes}&quot;</p>
            )}

            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() =>
                  addCallLog({
                    leadName: lead.name,
                    date: new Date().toLocaleString(),
                    outcome: "Connected",
                    duration: "2 mins",
                    notes: "Quick check-in call"
                  })
                }
                className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded text-white flex-1"
              >
                📞 Log Call
              </button>
              <button
                onClick={() => deleteLead(lead.id)}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-white">Create New Lead</h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <input type="text" placeholder="Business Name" required className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-white" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <input type="text" placeholder="Contact Person" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-white" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
              <input type="text" placeholder="Phone Number" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-white" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <input type="email" placeholder="Email Address" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-white" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              
              <div className="flex gap-2">
                <select className="w-1/2 p-2 bg-zinc-950 border border-zinc-800 rounded text-white" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Closed">Closed</option>
                </select>
                <select className="w-1/2 p-2 bg-zinc-950 border border-zinc-800 rounded text-white" value={formData.pipeline} onChange={(e) => setFormData({ ...formData, pipeline: e.target.value })}>
                  <option value="Lead">Lead</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                </select>
              </div>

              <input type="date" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-white" value={formData.followUpDate} onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })} />
              <textarea placeholder="Notes..." className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-white" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}></textarea>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-zinc-400">Cancel</button>
                <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2 rounded text-white">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}