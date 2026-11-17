"use client";

import { useState, useMemo } from "react";
import { useCRM, Lead, CALLER_TEAM } from "@/context/CRMContent";
import Link from "next/link";
import styles from "./leads.module.css";

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
    teamMembers,
  } = useCRM();

  const callerOptions = useMemo(() => {
    const names = new Set<string>();
    teamMembers.forEach((t) => names.add(t.fullName));
    CALLER_TEAM.forEach((c) => names.add(c.name));
    return Array.from(names);
  }, [teamMembers]);

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
    followUpDate: new Date().toISOString().slice(0, 10),
    followUpTime: "14:00",
  });

  // Filter leads based on role & search criteria
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Role enforcement: Callers only see their assigned leads unless Admin
      if (
        userRole === "Caller" &&
        lead.assignedCaller?.toLowerCase() !== activeCallerName?.toLowerCase()
      ) {
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
    <main className={styles.page}>
      {/* Header bar */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Lead Management Directory
          </h1>
          <p className={styles.description}>
            Browse, reassign, search, and trigger calls for prospect accounts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className={styles.headerActions}>
          {/* CSV Import */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className={styles.secondaryAction}
          >
            <span aria-hidden="true">↓</span>
            <span>Import CSV</span>
          </button>

          {/* CSV Export */}
          <button
            type="button"
            onClick={exportLeadsCSV}
            className={styles.secondaryAction}
          >
            <span aria-hidden="true">↑</span>
            <span>Export CSV</span>
          </button>

          {/* Add Lead */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className={styles.primaryAction}
          >
            <span aria-hidden="true">+</span>
            <span>Add New Lead</span>
          </button>
        </div>
      </header>

      {/* Filter and Search Controls */}
      <section className={styles.filterPanel} aria-label="Filter leads">
        <div className={styles.filterGrid}>
          {/* Search Input */}
          <div className={styles.searchField}>
            <label className={styles.filterLabel} htmlFor="lead-search">
              Search by Business, Contact, or Phone:
            </label>
            <input
              id="lead-search"
              type="text"
              placeholder="e.g. Cafe, Priya, +91 98..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.filterControl}
            />
          </div>

          {/* Stage Filter */}
          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="lead-stage">
              Pipeline Stage:
            </label>
            <select
              id="lead-stage"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className={styles.filterControl}
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
          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="lead-caller">
              Assigned Caller:
            </label>
            <select
              id="lead-caller"
              disabled={userRole === "Caller"}
              value={userRole === "Caller" ? activeCallerName : callerFilter}
              onChange={(e) => setCallerFilter(e.target.value)}
              className={styles.filterControl}
            >
              <option value="All">All Callers</option>
              {callerOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="lead-city">City:</label>
            <select
              id="lead-city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className={styles.filterControl}
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
        <div className={styles.filterFooter}>
          <span>
            Showing <strong>{filteredLeads.length}</strong> of{" "}
            <strong>{leads.length}</strong> total leads
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
              className={styles.clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Leads Table */}
      <section className={styles.tablePanel} aria-label="Lead directory">
        <div className={styles.tableScroller}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th scope="col">Business &amp; Rating</th>
                <th scope="col">Contact Person</th>
                <th scope="col">Category &amp; City</th>
                <th scope="col">Stage</th>
                <th scope="col">Assigned Caller</th>
                <th scope="col">Next Follow-up</th>
                <th scope="col" className={styles.actionsHeading}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className={styles.leadRow}>
                  {/* Business & Rating */}
                  <td className={styles.cell}>
                    <div className={styles.businessName}>{lead.name}</div>
                    <div className={styles.ratingLine}>
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        ★ {lead.googleRating}
                      </span>
                      <span className={styles.reviews}>
                        ({lead.googleReviewsCount} reviews)
                      </span>
                      {lead.websiteUrl && (
                        <a
                          href={lead.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.externalLink}
                        >
                          ◉ Web
                        </a>
                      )}
                      {lead.instagramUrl && (
                        <a
                          href={lead.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.instagramLink}
                        >
                          ◎ Insta
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Contact Person & Phone */}
                  <td className={styles.cell}>
                    <div className={styles.contactName}>
                      {lead.contactPerson}
                    </div>
                    <div className={styles.phoneLine}>
                      <span><span className={styles.phoneIcon} aria-hidden="true">☎</span> {lead.phone}</span>
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Hi ${lead.contactPerson || lead.name}, this is ${activeCallerName} from Solvrex.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.whatsappAction}
                          title="Message on WhatsApp"
                        >
                          <span>💬 WA</span>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Category & City */}
                  <td className={styles.cell}>
                    <span className={styles.categoryBadge}>
                      {lead.category}
                    </span>
                    <span className={styles.cityName}><span aria-hidden="true">📍</span> {lead.city}</span>
                  </td>

                  {/* Pipeline Stage */}
                  <td className={styles.cell}>
                    <span
                      className={`${styles.stageBadge} ${
                        lead.pipeline === "Won"
                          ? styles.stageWon
                          : lead.pipeline === "Meeting Booked"
                          ? styles.stageMeeting
                          : lead.pipeline === "Negotiation"
                          ? styles.stageNegotiation
                          : lead.pipeline === "Proposal"
                          ? styles.stageProposal
                          : lead.pipeline === "Contacted"
                          ? styles.stageContacted
                          : styles.stageLead
                      }`}
                    >
                      {lead.pipeline}
                    </span>
                  </td>

                  {/* Assigned Caller / Reassign */}
                  <td className={styles.cell}>
                    {userRole === "Admin" ? (
                      <select
                        value={lead.assignedCaller}
                        onChange={(e) => reassignLead(lead.id, e.target.value)}
                        className={styles.callerSelect}
                      >
                        {callerOptions.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.callerName}>
                        {lead.assignedCaller}
                      </span>
                    )}
                  </td>

                  {/* Next Follow-up */}
                  <td className={styles.cell}>
                    {lead.followUpDate ? (
                      <div>
                        <span className={styles.followUpDate}>
                          {lead.followUpDate}
                        </span>
                        <span className={styles.followUpTime}>
                          {lead.followUpTime || "12:00 PM"}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.noFollowUp}>None set</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className={styles.cell}>
                    <div className={styles.rowActions}>
                      <Link
                        href={`/calls/${lead.id}`}
                        className={styles.callAction}
                      >
                        <span aria-hidden="true">☎</span>
                        <span>Call</span>
                      </Link>

                      {userRole === "Admin" && (
                        <button
                          type="button"
                          onClick={() => deleteLead(lead.id)}
                          className={styles.deleteAction}
                          aria-label={`Delete ${lead.name}`}
                          title="Delete Lead"
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 14h11l1-14M9 7V4h6v3" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLeads.length === 0 && (
            <div className={styles.emptyState}>
              No leads match your search criteria. Try modifying your filters or add a new lead.
            </div>
          )}
        </div>
      </section>

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
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
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
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
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
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Restaurant, Dental Clinic, Salon..."
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
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
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Assigned Caller</label>
                  <select
                    value={formData.assignedCaller}
                    onChange={(e) => setFormData({ ...formData, assignedCaller: e.target.value })}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
                  >
                    {callerOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
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
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Instagram URL</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
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
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
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
                  className={styles.primaryAction}
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
                  className="w-full p-3 font-mono text-[11px] bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 outline-none focus:border-cyan-400"
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
                    className={styles.primaryAction}
                  >
                    Import Leads
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
