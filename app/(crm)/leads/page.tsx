"use client";

import { useEffect, useMemo, useState } from "react";
import { useCRM, STAGES, STAGE_STYLE, PRIORITIES, normalizePhone, toDateStr } from "@/context/CRMContent";
import type { Lead, NewLead, Stage, Priority, TeamUser } from "@/context/CRMContent";
import { parseCSV, toCSV } from "@/lib/csv";
import LogCallModal from "@/components/LogCallModal";
import TopbarActions from "@/components/TopbarActions";

const inputCls = "w-full p-2 bg-white border border-[#e0ebe7] rounded text-[#203b37] text-sm";

/* ------------------------------------------------------------------ */
/* CSV import helpers                                                  */
/* ------------------------------------------------------------------ */

const ALIASES: Record<string, string> = {
  businessname: "name", business: "name", name: "name", companyname: "name",
  contactperson: "contactPerson", contact: "contactPerson", contactname: "contactPerson",
  phone: "phone", mobile: "phone", phonenumber: "phone",
  email: "email", emailaddress: "email",
  city: "city", category: "category",
  googlerating: "rating", rating: "rating",
  websiteurl: "website", website: "website",
  instagramurl: "instagram", instagram: "instagram",
  source: "source", stage: "stage", status: "stage",
  assignedto: "assignedTo", assignedcaller: "assignedTo", caller: "assignedTo",
  notes: "notes",
};

interface ImportRow {
  line: number;
  name: string;
  status: "ok" | "duplicate" | "invalid";
  reason: string;
  lead?: NewLead;
}

function buildImportRows(text: string, existing: Lead[], team: TeamUser[]): { rows: ImportRow[]; error?: string } {
  const table = parseCSV(text);
  if (table.length < 2) return { rows: [], error: "No data rows found after the header." };

  const headers = table[0].map((h) => ALIASES[h.toLowerCase().replace(/[^a-z0-9]/g, "")] ?? "");
  if (!headers.includes("name") || !headers.includes("phone")) {
    return { rows: [], error: "The CSV must have business_name and phone columns." };
  }

  const seen = new Set(existing.map((l) => normalizePhone(l.phone)));

  const rows = table.slice(1).map((cells, i): ImportRow => {
    const line = i + 2;
    const get = (key: string) => {
      const idx = headers.indexOf(key);
      return idx >= 0 ? (cells[idx] ?? "").trim() : "";
    };

    const name = get("name");
    const phone = get("phone");
    const digits = normalizePhone(phone);

    if (!name) return { line, name: "(no name)", status: "invalid", reason: "Business name missing" };
    if (digits.length < 7) return { line, name, status: "invalid", reason: "Phone number invalid" };
    if (seen.has(digits)) return { line, name, status: "duplicate", reason: "Phone already exists" };

    const ratingRaw = get("rating");
    const rating = ratingRaw ? Number(ratingRaw) : null;
    if (rating !== null && (Number.isNaN(rating) || rating < 0 || rating > 5)) {
      return { line, name, status: "invalid", reason: "Rating must be between 0 and 5" };
    }

    seen.add(digits);

    const stageRaw = get("stage").toLowerCase();
    const stage: Stage = STAGES.find((s) => s.toLowerCase() === stageRaw) ?? "New";
    const callerRaw = get("assignedTo").toLowerCase();
    const assignedTo = team.find((t) => t.name.toLowerCase() === callerRaw)?.name;

    return {
      line,
      name,
      status: "ok",
      reason: "",
      lead: {
        name,
        contactPerson: get("contactPerson"),
        phone,
        email: get("email"),
        city: get("city"),
        category: get("category"),
        rating,
        website: get("website"),
        instagram: get("instagram"),
        source: get("source"),
        stage,
        notes: get("notes"),
        ...(assignedTo ? { assignedTo } : {}),
      },
    };
  });

  return { rows };
}

/* ------------------------------------------------------------------ */
/* Modals                                                              */
/* ------------------------------------------------------------------ */

function LeadFormModal({
  lead,
  allLeads,
  canAssign,
  defaultAssignee,
  onClose,
  onSave,
}: {
  lead: Lead | null;
  allLeads: Lead[];
  canAssign: boolean;
  defaultAssignee: string;
  onClose: () => void;
  onSave: (data: NewLead, id?: string) => void;
}) {
  const { team } = useCRM();
  const [f, setF] = useState({
    name: lead?.name ?? "",
    contactPerson: lead?.contactPerson ?? "",
    phone: lead?.phone ?? "",
    email: lead?.email ?? "",
    city: lead?.city ?? "",
    category: lead?.category ?? "",
    rating: lead?.rating != null ? String(lead.rating) : "",
    website: lead?.website ?? "",
    instagram: lead?.instagram ?? "",
    source: lead?.source ?? "",
    stage: (lead?.stage ?? "New") as Stage,
    assignedTo: lead ? lead.assignedTo : defaultAssignee,
    followUpDate: lead?.followUpDate ?? "",
    followUpTime: lead?.followUpTime ?? "",
    priority: (lead?.priority ?? "Medium") as Priority,
    notes: lead?.notes ?? "",
  });
  const [error, setError] = useState("");

  const set = <K extends keyof typeof f>(key: K, value: (typeof f)[K]) => setF((prev) => ({ ...prev, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = f.name.trim();
    if (!name) return setError("Business name is required.");

    const digits = normalizePhone(f.phone);
    if (digits.length < 7) return setError("Enter a valid phone number.");
    const dup = allLeads.find((l) => l.id !== lead?.id && normalizePhone(l.phone) === digits);
    if (dup) return setError(`This phone number already exists (${dup.name}).`);

    let rating: number | null = null;
    if (f.rating.trim() !== "") {
      rating = Number(f.rating);
      if (Number.isNaN(rating) || rating < 0 || rating > 5) return setError("Rating must be between 0 and 5.");
    }

    onSave(
      {
        name,
        contactPerson: f.contactPerson.trim(),
        phone: f.phone.trim(),
        email: f.email.trim(),
        city: f.city.trim(),
        category: f.category.trim(),
        rating,
        website: f.website.trim(),
        instagram: f.instagram.trim(),
        source: f.source.trim(),
        stage: f.stage,
        assignedTo: f.assignedTo,
        followUpDate: f.followUpDate,
        followUpTime: f.followUpTime,
        priority: f.priority,
        notes: f.notes.trim(),
      },
      lead?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#183d35]/35 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#e0ebe7] p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-[#203b37] mb-4">{lead ? "Edit Lead" : "Create New Lead"}</h2>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Business name *" value={f.name} onChange={(e) => set("name", e.target.value)} />
            <input className={inputCls} placeholder="Contact person" value={f.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} />
            <input className={inputCls} placeholder="Phone *" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
            <input className={inputCls} type="email" placeholder="Email" value={f.email} onChange={(e) => set("email", e.target.value)} />
            <input className={inputCls} placeholder="City" value={f.city} onChange={(e) => set("city", e.target.value)} />
            <input className={inputCls} placeholder="Category (Restaurant, Salon...)" value={f.category} onChange={(e) => set("category", e.target.value)} />
            <input className={inputCls} type="number" step="0.1" min="0" max="5" placeholder="Google rating (0-5)" value={f.rating} onChange={(e) => set("rating", e.target.value)} />
            <input className={inputCls} placeholder="Source (Google Maps, Instagram...)" value={f.source} onChange={(e) => set("source", e.target.value)} />
            <input className={inputCls} placeholder="Website link" value={f.website} onChange={(e) => set("website", e.target.value)} />
            <input className={inputCls} placeholder="Instagram link" value={f.instagram} onChange={(e) => set("instagram", e.target.value)} />
            <select className={inputCls} value={f.stage} onChange={(e) => set("stage", e.target.value as Stage)}>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {canAssign ? (
              <select className={inputCls} value={f.assignedTo} onChange={(e) => set("assignedTo", e.target.value)}>
                <option value="">Unassigned</option>
                {team.map((t) => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
            ) : (
              <input className={inputCls} value={f.assignedTo} disabled readOnly />
            )}
            <input className={inputCls} type="date" value={f.followUpDate} onChange={(e) => set("followUpDate", e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input className={inputCls} type="time" value={f.followUpTime} onChange={(e) => set("followUpTime", e.target.value)} />
              <select className={inputCls} value={f.priority} onChange={(e) => set("priority", e.target.value as Priority)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <textarea className={inputCls} rows={3} placeholder="Notes..." value={f.notes} onChange={(e) => set("notes", e.target.value)} />

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[#718985]">Cancel</button>
            <button type="submit" className="btn-primary">
              {lead ? "Save changes" : "Save Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImportModal({
  existing,
  defaultAssignee,
  onClose,
  onImport,
}: {
  existing: Lead[];
  defaultAssignee: string;
  onClose: () => void;
  onImport: (leads: NewLead[]) => void;
}) {
  const { team } = useCRM();
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [assignee, setAssignee] = useState(defaultAssignee);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    const result = buildImportRows(await file.text(), existing, team);
    setError(result.error ?? "");
    setRows(result.error ? null : result.rows);
  };

  const ok = rows?.filter((r) => r.status === "ok").length ?? 0;
  const dup = rows?.filter((r) => r.status === "duplicate").length ?? 0;
  const bad = rows?.filter((r) => r.status === "invalid").length ?? 0;

  const confirm = () => {
    if (!rows) return;
    const leads = rows.flatMap((r) =>
      r.status === "ok" && r.lead ? [{ ...r.lead, assignedTo: r.lead.assignedTo ?? assignee }] : []
    );
    onImport(leads);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#183d35]/35 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#e0ebe7] p-6 rounded-2xl shadow-xl w-full max-w-lg space-y-4 max-h-[92vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-[#203b37]">Import leads from CSV</h2>
        <p className="text-xs text-[#718985]">
          Columns: business_name, contact_person, phone, email, city, category, google_rating, website_url, instagram_url,
          source, stage, assigned_to. Only <b>business_name</b> and <b>phone</b> are required.
        </p>

        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => onFile(e.target.files?.[0])}
          className="block w-full text-sm text-[#526d67] file:mr-3 file:rounded-lg file:border file:border-[#dce9e5] file:bg-[#f2f8f6] file:px-3 file:py-1.5 file:text-[#526d67]"
        />

        {error && <p className="text-sm text-rose-400">{error}</p>}

        {rows && (
          <div className="space-y-3">
            <p className="text-sm text-[#526d67]">
              <span className="text-[#168568] font-semibold">{ok} will be imported</span>
              {dup > 0 && <span className="text-amber-300"> · {dup} duplicates skipped</span>}
              {bad > 0 && <span className="text-rose-300"> · {bad} invalid rows</span>}
              <span className="text-[#91a6a1]"> ({fileName})</span>
            </p>

            {(dup > 0 || bad > 0) && (
              <ul className="text-xs text-[#718985] max-h-32 overflow-y-auto space-y-1 bg-white border border-[#e0ebe7] rounded p-2">
                {rows
                  .filter((r) => r.status !== "ok")
                  .map((r) => (
                    <li key={r.line}>
                      Line {r.line}: {r.name} - {r.reason}
                    </li>
                  ))}
              </ul>
            )}

            <label className="flex items-center gap-2 text-sm text-[#526d67]">
              Assign rows with an empty assigned_to to:
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="bg-white border border-[#e0ebe7] rounded px-2 py-1 text-[#203b37] text-sm">
                <option value="">Unassigned</option>
                {team.map((t) => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[#718985]">Cancel</button>
          <button
            type="button"
            disabled={ok === 0}
            onClick={confirm}
            className="btn-primary"
          >
            Import {ok > 0 ? ok : ""} leads
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LeadsPage() {
  const { leads, visibleLeads, hydrated, isManager, team, currentUser, addLead, addLeads, updateLead, deleteLead } = useCRM();

  const [q, setQ] = useState("");

  // The Dashboard search box sends its text here
  useEffect(() => {
    try {
      const fromDashboard = sessionStorage.getItem("solvrex_lead_q");
      if (fromDashboard) {
        setQ(fromDashboard);
        sessionStorage.removeItem("solvrex_lead_q");
      }
    } catch {}
  }, []);
  const [stageFilter, setStageFilter] = useState<"All" | Stage>("All");
  const [callerFilter, setCallerFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [callLead, setCallLead] = useState<Lead | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const digits = needle.replace(/\D/g, "");
    return visibleLeads.filter((l) => {
      if (stageFilter !== "All" && l.stage !== stageFilter) return false;
      if (isManager && callerFilter !== "All") {
        if (callerFilter === "Unassigned" ? l.assignedTo !== "" : l.assignedTo !== callerFilter) return false;
      }
      if (!needle) return true;
      const text = [l.name, l.contactPerson, l.city, l.category, l.source, l.email].some((v) =>
        v.toLowerCase().includes(needle)
      );
      const phone = digits !== "" && l.phone.replace(/\D/g, "").includes(digits);
      return text || phone;
    });
  }, [visibleLeads, q, stageFilter, callerFilter, isManager]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setFormOpen(true);
  };

  const handleSave = (data: NewLead, id?: string) => {
    if (id) updateLead(id, data);
    else addLead(data);
  };

  const handleDelete = (lead: Lead) => {
    if (window.confirm(`Delete "${lead.name}"?`)) deleteLead(lead.id);
  };

  const exportCSV = () => {
    const header = [
      "business_name", "contact_person", "phone", "email", "city", "category", "google_rating",
      "website_url", "instagram_url", "source", "stage", "assigned_to", "follow_up_date", "notes",
    ];
    const body = filtered.map((l) => [
      l.name, l.contactPerson, l.phone, l.email, l.city, l.category, l.rating,
      l.website, l.instagram, l.source, l.stage, l.assignedTo, l.followUpDate, l.notes,
    ]);
    const blob = new Blob(["﻿" + toCSV([header, ...body])], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${toDateStr(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hydrated) return <p className="text-sm text-[#91a6a1]">Loading leads...</p>;

  return (
    <div className="space-y-5">
      {/* Buttons shown in the top bar (like the reference) */}
      <TopbarActions>
        <div className="relative hidden xl:block">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91a6a1]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search leads, phone, city..."
            className="w-64 pl-9 pr-3 py-2 bg-white border border-[#dce9e5] rounded-lg text-sm text-[#203b37] placeholder:text-[#91a6a1] outline-none focus:border-[#39a98b]"
          />
        </div>
        {isManager && (
          <>
            <button onClick={() => setImportOpen(true)} className="btn-ghost">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              Import
            </button>
            <button onClick={exportCSV} className="btn-ghost">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Export
            </button>
          </>
        )}
        <button onClick={openAdd} className="btn-primary">+ Add lead</button>
      </TopbarActions>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, phone, city..."
          className="flex-1 min-w-[240px] max-w-md px-4 py-2.5 bg-white border border-[#e0ebe7] rounded-xl text-sm text-[#203b37] placeholder:text-[#91a6a1] outline-none focus:border-[#39a98b]"
        />
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as "All" | Stage)} className="w-44 px-3 py-2.5 bg-white border border-[#e0ebe7] rounded-xl text-sm text-[#203b37] outline-none">
          <option value="All">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {isManager && (
          <select value={callerFilter} onChange={(e) => setCallerFilter(e.target.value)} className="w-44 px-3 py-2.5 bg-white border border-[#e0ebe7] rounded-xl text-sm text-[#203b37] outline-none">
            <option value="All">All callers</option>
            <option value="Unassigned">Unassigned</option>
            {team.map((t) => (
              <option key={t.name} value={t.name}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e0ebe7] rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm text-[#526d67]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-[#91a6a1] border-b border-[#e0ebe7]">
              <th className="px-5 py-3.5 font-semibold">Business</th>
              <th className="px-3 py-3.5 font-semibold">Contact</th>
              <th className="px-3 py-3.5 font-semibold">City</th>
              <th className="px-3 py-3.5 font-semibold">Category</th>
              <th className="px-3 py-3.5 font-semibold">Rating</th>
              <th className="px-3 py-3.5 font-semibold">Links</th>
              <th className="px-3 py-3.5 font-semibold">Source</th>
              <th className="px-3 py-3.5 font-semibold">Stage</th>
              <th className="px-3 py-3.5 font-semibold">Caller</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8efec]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="p-10 text-center text-[#91a6a1]">
                  No leads found. Change the filters or add a new lead.
                </td>
              </tr>
            )}
            {filtered.map((lead) => (
              <tr key={lead.id} className="hover:bg-[#f3f8f6]">
                <td className="px-5 py-4 font-semibold text-[#203b37]">{lead.name}</td>
                <td className="px-3 py-4">
                  <div className="text-[#526d67]">{lead.contactPerson || "-"}</div>
                  <div className="text-xs text-[#91a6a1]">{lead.phone}</div>
                </td>
                <td className="px-3 py-4">{lead.city || "-"}</td>
                <td className="px-3 py-4">{lead.category || "-"}</td>
                <td className="px-3 py-4 whitespace-nowrap">
                  {lead.rating != null ? (
                    <span className="text-[#526d67]"><span className="text-amber-400">★</span> {lead.rating.toFixed(1)}</span>
                  ) : (
                    <span className="text-[#a4b6b1]">-</span>
                  )}
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-2.5 text-[#718985]">
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" title="Website" className="hover:text-[#203b37]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                      </a>
                    )}
                    {lead.instagram && (
                      <a href={lead.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" className="hover:text-[#203b37]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 text-[#718985]">{lead.source || "-"}</td>
                <td className="px-3 py-4">
                  <select
                    value={lead.stage}
                    onChange={(e) => updateLead(lead.id, { stage: e.target.value as Stage })}
                    className={`appearance-none cursor-pointer text-xs font-medium px-3 py-1 rounded-full border outline-none text-center ${STAGE_STYLE[lead.stage]}`}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s} className="bg-white text-[#203b37]">{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-4">
                  {isManager ? (
                    <select
                      value={lead.assignedTo}
                      onChange={(e) => updateLead(lead.id, { assignedTo: e.target.value })}
                      className="w-36 bg-white border border-[#dce9e5] rounded-lg px-2.5 py-1.5 text-sm text-[#526d67] outline-none"
                    >
                      <option value="">Unassigned</option>
                      {team.map((t) => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  ) : (
                    lead.assignedTo || "-"
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end items-center gap-3">
                    <button onClick={() => openEdit(lead)} className="text-xs text-[#91a6a1] hover:text-[#203b37]">Edit</button>
                    {isManager && (
                      <button onClick={() => handleDelete(lead)} className="text-xs text-[#91a6a1] hover:text-red-400">Delete</button>
                    )}
                    <button onClick={() => setCallLead(lead)} className="btn-primary !py-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                      Call
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <LeadFormModal
          key={editing?.id ?? "new"}
          lead={editing}
          allLeads={leads}
          canAssign={isManager}
          defaultAssignee={currentUser.name}
          onClose={() => setFormOpen(false)}
          onSave={handleSave}
        />
      )}

      {callLead && <LogCallModal key={callLead.id} lead={callLead} onClose={() => setCallLead(null)} />}

      {importOpen && (
        <ImportModal existing={leads} defaultAssignee={currentUser.name} onClose={() => setImportOpen(false)} onImport={addLeads} />
      )}
    </div>
  );
}
