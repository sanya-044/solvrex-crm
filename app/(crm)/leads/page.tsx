"use client";

import { useState, useMemo } from "react";
import { useCRM, Lead, PipelineStage, CALLER_TEAM } from "@/context/CRMContent";
import Link from "next/link";

export default function LeadsPage() {
  const {
    leads,
    addLead,
    deleteLead,
    reassignLead,
    exportLeadsCSV,
    importLeadsCSV,
    userRole,
    activeCallerName,
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("All");
  const [callerFilter, setCallerFilter] = useState<string>("All");
  const [cityFilter, setCityFilter] = useState<string>("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvInput, setCsvInput] = useState("");
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // New Lead form state
  const [formData, setFormData] = useState<Omit<Lead, "id" | "totalCalls" | "createdAt">>({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    city: "Mumbai",
    category: "Restaurant",
    googleRating: 4.8,
    googleReviewsCount: 120,
    websiteUrl: "",
    instagramUrl: "",
    source: "Google Maps",
    assignedCaller: activeCallerName,
    status: "New",
    pipeline: "Lead",
    priority: "High",
    notes: "",
    followUpDate: "2026-11-03",
    followUpTime: "14:00",
  });

  // Filter leads based on role & search criteria
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Role enforcement: Callers only see their assigned leads unless Admin
      if (userRole === "Caller" && lead.assignedCaller !== activeCallerName) {
        return false;
      }

      // Filter by stage
      if (stageFilter !== "All" && lead.pipeline !== stageFilter) {
        return false;
      }

      // Filter by assigned caller (if Admin looking at specific caller)
      if (callerFilter !== "All" && lead.assignedCaller !== callerFilter) {
        return false;
      }

      // Filter by city
      if (cityFilter !== "All" && lead.city !== cityFilter) {
        return false;
      }

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches =
          lead.name.toLowerCase().includes(query) ||
          lead.contactPerson.toLowerCase().includes(query) ||
          lead.phone.includes(query) ||
          lead.city.toLowerCase().includes(query) ||
          lead.category.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [leads, userRole, activeCallerName, stageFilter, callerFilter, cityFilter, searchTerm]);

  // Unique cities for filter
  const uniqueCities = useMemo(() => {
    return Array.from(new Set(leads.map((l) => l.city))).filter(Boolean);
  }, [leads]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addLead(formData);
    setShowAddModal(false);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvInput.trim()) return;
    const res = importLeadsCSV(csvInput);
    setImportNotice(`Successfully imported ${res.added} leads.`);
    setTimeout(() => {
      setImportNotice(null);
      setShowImportModal(false);
      setCsvInput("");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Lead Management Directory
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse, reassign, search, and trigger calls for prospect accounts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Import */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-xs font-semibold text-zinc-300 transition"
          >
            <span>📥</span>
            <span>Import CSV</span>
          </button>

          {/* CSV Export */}
          <button
            type="button"
            onClick={exportLeadsCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-xs font-semibold text-zinc-300 transition"
          >
            <span>📤</span>
            <span>Export CSV</span>
          </button>

          {/* Add Lead */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition shadow-lg shadow-amber-400/20"
          >
            <span>+</span>
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="text-[11px] text-zinc-400 block mb-1">
              Search by Business, Contact, or Phone:
            </label>
            <input
              type="text"
              placeholder="e.g. Cafe, Priya, +91 98..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white outline-none focus:border-amber-400"
            />
          </div>

          {/* Stage Filter */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">
              Pipeline Stage:
            </label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white outline-none focus:border-amber-400"
            >
              <option value="All">All Stages</option>
              <option value="Lead">Lead</option>
              <option value="Contacted">Contacted</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Meeting Booked">Meeting Booked</option>
              <option value="Won">Won</option>
            </select>
          </div>

          {/* Caller Filter (Available for Admin) */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">
              Assigned Caller:
            </label>
            <select
              disabled={userRole === "Caller"}
              value={userRole === "Caller" ? activeCallerName : callerFilter}
              onChange={(e) => setCallerFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white outline-none focus:border-amber-400 disabled:opacity-50"
            >
              <option value="All">All Callers</option>
              {CALLER_TEAM.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">City:</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white outline-none focus:border-amber-400"
            >
              <option value="All">All Cities</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick results count */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
          <span>
            Showing <strong className="text-white">{filteredLeads.length}</strong> of{" "}
            <strong className="text-white">{leads.length}</strong> total leads
          </span>
          {(searchTerm || stageFilter !== "All" || callerFilter !== "All" || cityFilter !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStageFilter("All");
                setCallerFilter("All");
                setCityFilter("All");
              }}
              className="text-amber-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Business & Rating</th>
                <th className="p-3.5">Contact Person</th>
                <th className="p-3.5">Category & City</th>
                <th className="p-3.5">Stage</th>
                <th className="p-3.5">Assigned Caller</th>
                <th className="p-3.5">Next Follow-up</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-800/40 transition">
                  {/* Business & Rating */}
                  <td className="p-3.5">
                    <div className="font-bold text-white text-sm">{lead.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        ★ {lead.googleRating}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        ({lead.googleReviewsCount} reviews)
                      </span>
                      {lead.websiteUrl && (
                        <a
                          href={lead.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-400 hover:underline"
                        >
                          🌐 Web
                        </a>
                      )}
                      {lead.instagramUrl && (
                        <a
                          href={lead.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-pink-400 hover:underline"
                        >
                          📸 Insta
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Contact Person & Phone */}
                  <td className="p-3.5">
                    <div className="font-semibold text-zinc-200">
                      {lead.contactPerson}
                    </div>
                    <div className="text-zinc-400 text-[11px] mt-0.5 flex items-center gap-1">
                      <span>📞</span>
                      <span>{lead.phone}</span>
                    </div>
                  </td>

                  {/* Category & City */}
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 block w-fit mb-1">
                      {lead.category}
                    </span>
                    <span className="text-zinc-400 text-[11px]">📍 {lead.city}</span>
                  </td>

                  {/* Pipeline Stage */}
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-block border ${
                        lead.pipeline === "Won"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                          : lead.pipeline === "Meeting Booked"
                          ? "bg-cyan-950 text-cyan-300 border-cyan-700"
                          : lead.pipeline === "Negotiation"
                          ? "bg-amber-950 text-amber-300 border-amber-700"
                          : lead.pipeline === "Proposal"
                          ? "bg-purple-950 text-purple-300 border-purple-700"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {lead.pipeline}
                    </span>
                  </td>

                  {/* Assigned Caller / Reassign */}
                  <td className="p-3.5">
                    {userRole === "Admin" ? (
                      <select
                        value={lead.assignedCaller}
                        onChange={(e) => reassignLead(lead.id, e.target.value)}
                        className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none focus:border-amber-400"
                      >
                        {CALLER_TEAM.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-zinc-300 font-medium">
                        {lead.assignedCaller}
                      </span>
                    )}
                  </td>

                  {/* Next Follow-up */}
                  <td className="p-3.5">
                    {lead.followUpDate ? (
                      <div>
                        <span className="text-zinc-200 font-semibold block">
                          {lead.followUpDate}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {lead.followUpTime || "12:00 PM"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-500 italic">None set</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/calls/${lead.id}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition flex items-center gap-1 shadow-sm"
                      >
                        <span>📞</span>
                        <span>Call</span>
                      </Link>

                      {userRole === "Admin" && (
                        <button
                          type="button"
                          onClick={() => deleteLead(lead.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition"
                          title="Delete Lead"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLeads.length === 0 && (
            <div className="p-12 text-center text-zinc-500 text-sm">
              No leads match your search criteria. Try modifying your filters or add a new lead.
            </div>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-lg font-bold text-white">Create New Lead</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Cafe & Lounge"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Owner / Manager name"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Mumbai, Delhi, Bengaluru..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Restaurant, Dental Clinic, Salon..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Google Rating (★)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.googleRating}
                    onChange={(e) =>
                      setFormData({ ...formData, googleRating: parseFloat(e.target.value) || 4.5 })
                    }
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Assigned Caller</label>
                  <select
                    value={formData.assignedCaller}
                    onChange={(e) => setFormData({ ...formData, assignedCaller: e.target.value })}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                  >
                    {CALLER_TEAM.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Instagram URL</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Notes / Call Brief</label>
                <textarea
                  rows={2}
                  placeholder="Key background info about the business..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-amber-400"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-lg font-bold text-white">Import Leads via CSV</h2>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-zinc-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {importNotice ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-center font-semibold">
                {importNotice}
              </div>
            ) : (
              <form onSubmit={handleImportSubmit} className="space-y-3.5 text-xs">
                <p className="text-zinc-400">
                  Paste raw CSV text below or export from Google Sheets / Excel. Columns can include:{" "}
                  <code className="text-amber-300">
                    Business Name, Contact, Phone, City, Category, Rating
                  </code>
                  .
                </p>

                <textarea
                  rows={7}
                  required
                  placeholder={`Business Name,Contact Person,Phone,City,Category,Rating\nGolden Spoon Cafe,Rajesh Gupta,+91 9811223344,Mumbai,Cafe,4.6\nApex Ortho Clinic,Dr. Anjali Rao,+91 9922334455,Delhi,Clinic,4.9`}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="w-full p-3 font-mono text-[11px] bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 outline-none focus:border-amber-400"
                ></textarea>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold"
                  >
                    Import Leads
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
