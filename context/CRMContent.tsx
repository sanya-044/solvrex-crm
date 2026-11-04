"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

/* =====================================================================
   Constants
   ===================================================================== */

export const STAGES = ["New", "Contacted", "Interested", "Meeting", "Won", "Lost"] as const;
export type Stage = (typeof STAGES)[number];

export const OUTCOMES = [
  "Not answered",
  "Busy",
  "Call back",
  "Interested",
  "Not interested",
  "Wrong number",
  "Meeting booked",
  "Won",
] as const;

/** Outcomes that do NOT count as a connected call ("No Answer" is the old mock value). */
export const NOT_CONNECTED: readonly string[] = ["Not answered", "Busy", "Wrong number", "No Answer"];

export const PRIORITIES = ["High", "Medium", "Low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export type Role = "admin" | "manager" | "caller";
export interface TeamUser {
  name: string;
  role: Role;
}

/** Assignable callers. Temporary list until a "list users" API exists; the logged-in user is always added. */
export const TEAM: TeamUser[] = [
  { name: "Raj", role: "admin" },
  { name: "Shruti", role: "manager" },
  { name: "Saurav", role: "caller" },
  { name: "Priya", role: "caller" },
];

export const STAGE_STYLE: Record<Stage, string> = {
  New: "bg-zinc-800 text-zinc-300 border-zinc-700",
  Contacted: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  Interested: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  Meeting: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30",
  Won: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  Lost: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
};

export const STAGE_BAR: Record<Stage, string> = {
  New: "bg-slate-400",
  Contacted: "bg-sky-500",
  Interested: "bg-amber-500",
  Meeting: "bg-violet-500",
  Won: "bg-emerald-500",
  Lost: "bg-rose-500",
};

/* =====================================================================
   Types
   ===================================================================== */

export interface Lead {
  id: string;
  name: string; // business name
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  category: string;
  rating: number | null; // Google rating 0-5
  website: string;
  instagram: string;
  source: string;
  stage: Stage; // single source of truth for lead progress
  assignedTo: string; // TEAM member name, "" = unassigned
  notes: string;
  followUpDate: string; // YYYY-MM-DD or ""
  followUpTime: string; // HH:MM or ""
  priority: Priority;
  /** Legacy mirrors of `stage`. Kept in sync automatically so Analytics and other old pages keep working. */
  status: string;
  pipeline: string;
}

/** What callers pass when creating a lead. Everything except the business name is optional. */
export type NewLead = Partial<Omit<Lead, "id" | "name" | "status" | "pipeline">> & { name: string };

export interface CallLog {
  id: string;
  leadName: string;
  date: string; // display string, e.g. "2026-10-28 14:30"
  outcome: string;
  duration: string; // display string, e.g. "5m 12s"
  notes: string;
  // New optional fields (old saved calls don't have them)
  leadId?: string;
  caller?: string;
  at?: string; // ISO timestamp - used for dashboard date ranges
  durationSeconds?: number;
}

export type NewCall = Pick<CallLog, "leadName" | "outcome"> &
  Partial<Omit<CallLog, "id" | "leadName" | "outcome">>;

interface CRMContextType {
  hydrated: boolean;
  leads: Lead[];
  calls: CallLog[];
  /** Admin/Manager: everything. Caller: only their own leads/calls. */
  visibleLeads: Lead[];
  visibleCalls: CallLog[];
  isManager: boolean;
  team: TeamUser[];
  currentUser: TeamUser;
  addLead: (lead: NewLead) => void;
  addLeads: (leads: NewLead[]) => void;
  updateLead: (id: string, updated: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addCallLog: (call: NewCall) => void;
}

/* =====================================================================
   Helpers
   ===================================================================== */

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function toDateStr(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${toDateStr(d)} ${hh}:${mm}`;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

/** Last 10 digits, so "+91 98100 22341" and "9810022341" count as the same number. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/** Time a call happened (ms). 0 if unknown. */
export function callTime(c: CallLog): number {
  if (c.at) {
    const t = Date.parse(c.at);
    if (!Number.isNaN(t)) return t;
  }
  const t = Date.parse(c.date.replace(" ", "T"));
  return Number.isNaN(t) ? 0 : t;
}

/** Stage change that logically follows a call outcome. */
export function stageAfterCall(outcome: string, current: Stage): Stage {
  switch (outcome) {
    case "Interested":
      return "Interested";
    case "Meeting booked":
      return "Meeting";
    case "Won":
      return "Won";
    case "Not interested":
      return "Lost";
    case "Not answered":
    case "Busy":
    case "Call back":
      return current === "New" ? "Contacted" : current;
    default:
      return current;
  }
}

/** Old 4-value "pipeline" that Analytics still reads, derived from the new stage. */
export function pipelineForStage(stage: Stage): string {
  switch (stage) {
    case "Interested":
      return "Proposal";
    case "Meeting":
      return "Negotiation";
    case "Won":
      return "Won";
    case "Lost":
      return "Lost";
    default:
      return "Lead";
  }
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

/** Old records only had status + pipeline. Convert them to a single stage. */
function legacyStage(status: string, pipeline: string): Stage {
  if (pipeline === "Won") return "Won";
  if (status === "Closed") return "Lost";
  if (pipeline === "Negotiation") return "Meeting";
  if (pipeline === "Proposal" || status === "Interested") return "Interested";
  if (status === "Contacted") return "Contacted";
  return "New";
}

/** Fills defaults and migrates old saved records so nothing is ever half-empty. */
function normalizeLead(raw: Record<string, unknown>): Lead {
  const rawStage = str(raw.stage);
  const stage: Stage = (STAGES as readonly string[]).includes(rawStage)
    ? (rawStage as Stage)
    : legacyStage(str(raw.status), str(raw.pipeline));
  const rawPriority = str(raw.priority);
  const priority: Priority = (PRIORITIES as readonly string[]).includes(rawPriority)
    ? (rawPriority as Priority)
    : "Medium";
  return {
    id: str(raw.id) || uid(),
    name: str(raw.name),
    contactPerson: str(raw.contactPerson),
    phone: str(raw.phone),
    email: str(raw.email),
    city: str(raw.city),
    category: str(raw.category),
    rating: typeof raw.rating === "number" && Number.isFinite(raw.rating) ? raw.rating : null,
    website: str(raw.website),
    instagram: str(raw.instagram),
    source: str(raw.source),
    stage,
    assignedTo: str(raw.assignedTo),
    notes: str(raw.notes),
    followUpDate: str(raw.followUpDate),
    followUpTime: str(raw.followUpTime),
    priority,
    status: stage,
    pipeline: pipelineForStage(stage),
  };
}

function normalizeCall(raw: Record<string, unknown>): CallLog {
  const date = str(raw.date);
  let at = str(raw.at);
  if (!at) {
    const t = Date.parse(date.replace(" ", "T"));
    if (!Number.isNaN(t)) at = new Date(t).toISOString();
  }
  return {
    id: str(raw.id) || uid(),
    leadName: str(raw.leadName),
    date,
    outcome: str(raw.outcome),
    duration: str(raw.duration),
    notes: str(raw.notes),
    leadId: str(raw.leadId) || undefined,
    caller: str(raw.caller) || undefined,
    at: at || undefined,
    durationSeconds: typeof raw.durationSeconds === "number" ? raw.durationSeconds : undefined,
  };
}

/* =====================================================================
   Initial (demo) data - only used when nothing is saved yet
   ===================================================================== */

const initialLeads: Lead[] = [
  {
    id: "1", name: "Old Town Cafe", contactPerson: "Rohan Das", phone: "+91 9876543210", email: "contact@oldtown.com",
    city: "Delhi", category: "Cafe", rating: 4.2, source: "Referral", stage: "New", assignedTo: "Saurav",
    notes: "Interested in web redesign", followUpDate: "2026-11-02", followUpTime: "11:00", priority: "Medium",
  },
  {
    id: "2", name: "Cafe De Arte", contactPerson: "Priya Singh", phone: "+91 9812345678", email: "info@cafedearte.in",
    city: "Mumbai", category: "Cafe", rating: 4.5, instagram: "https://instagram.com/cafedearte", source: "Instagram",
    stage: "Interested", assignedTo: "Priya", notes: "Sent proposal via email", followUpDate: "2026-10-30",
    followUpTime: "15:00", priority: "High",
  },
  {
    id: "3", name: "Grounded Cafe", contactPerson: "Amit Patel", phone: "+91 9988776655", email: "hello@grounded.com",
    city: "Pune", category: "Cafe", rating: 4.4, website: "https://grounded.example", source: "Google Maps",
    stage: "Won", assignedTo: "Raj", notes: "Contract signed!", followUpDate: "", followUpTime: "", priority: "Low",
  },
].map((l) => normalizeLead(l));

const initialCalls: CallLog[] = [
  { id: "c1", leadName: "Cafe De Arte", date: "2026-10-28 14:30", outcome: "Connected", duration: "5 mins", notes: "Discussed custom CRM features" },
  { id: "c2", leadName: "Old Town Cafe", date: "2026-10-27 11:15", outcome: "No Answer", duration: "0 mins", notes: "Left voicemail" },
].map((c) => normalizeCall(c));

const LEADS_KEY = "solvrex_crm_leads";
const CALLS_KEY = "solvrex_crm_calls";

/* =====================================================================
   Provider
   ===================================================================== */

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [calls, setCalls] = useState<CallLog[]>(initialCalls);
  const { user } = useAuth();
  const fullName = user?.fullName ?? "";
  const rawRole = user?.role ?? "";
  const currentUser = useMemo<TeamUser>(() => {
    const r = rawRole.toLowerCase();
    const role: Role = r.includes("admin") ? "admin" : r.includes("manager") ? "manager" : "caller";
    return { name: fullName || "User", role };
  }, [fullName, rawRole]);
  const team = useMemo<TeamUser[]>(() => {
    const names = [currentUser.name, ...TEAM.map((t) => t.name)].filter((n, i, a) => a.indexOf(n) === i);
    return names.map((name) => ({
      name,
      role: name === currentUser.name ? currentUser.role : (TEAM.find((t) => t.name === name)?.role ?? "caller"),
    }));
  }, [currentUser]);
  const [hydrated, setHydrated] = useState(false);

  // Load saved data once, after the first render (avoids server/browser mismatch).
  useEffect(() => {
    try {
      const savedLeads = localStorage.getItem(LEADS_KEY);
      if (savedLeads) {
        const parsed: unknown = JSON.parse(savedLeads);
        if (Array.isArray(parsed)) setLeads(parsed.map((l) => normalizeLead(l as Record<string, unknown>)));
      }
      const savedCalls = localStorage.getItem(CALLS_KEY);
      if (savedCalls) {
        const parsed: unknown = JSON.parse(savedCalls);
        if (Array.isArray(parsed)) setCalls(parsed.map((c) => normalizeCall(c as Record<string, unknown>)));
      }
    } catch {
      // Corrupted saved data: keep the demo data instead of crashing.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    } catch {}
  }, [leads, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CALLS_KEY, JSON.stringify(calls));
    } catch {}
  }, [calls, hydrated]);

  const addLead = useCallback((lead: NewLead) => {
    const newLead = normalizeLead({ ...lead, id: uid() });
    setLeads((prev) => [newLead, ...prev]);
  }, []);

  const addLeads = useCallback((incoming: NewLead[]) => {
    const created = incoming.map((l) => normalizeLead({ ...l, id: uid() }));
    setLeads((prev) => [...created, ...prev]);
  }, []);

  const updateLead = useCallback((id: string, updated: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next: Lead = { ...l, ...updated };
        next.status = next.stage;
        next.pipeline = pipelineForStage(next.stage);
        return next;
      })
    );
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addCallLog = useCallback((call: NewCall) => {
    const at = call.at ?? new Date().toISOString();
    const seconds = call.durationSeconds ?? 0;
    const newCall: CallLog = {
      id: uid(),
      leadName: call.leadName,
      leadId: call.leadId,
      caller: call.caller,
      outcome: call.outcome,
      notes: call.notes ?? "",
      at,
      date: call.date ?? formatDateTime(at),
      durationSeconds: seconds,
      duration: call.duration ?? formatDuration(seconds),
    };
    setCalls((prev) => [newCall, ...prev]);
  }, []);

  const isManager = currentUser.role !== "caller";

  const visibleLeads = useMemo(
    () => (isManager ? leads : leads.filter((l) => l.assignedTo === currentUser.name)),
    [leads, isManager, currentUser.name]
  );

  const visibleCalls = useMemo(
    () => (isManager ? calls : calls.filter((c) => c.caller === currentUser.name)),
    [calls, isManager, currentUser.name]
  );

  const value = useMemo<CRMContextType>(
    () => ({
      hydrated,
      leads,
      calls,
      visibleLeads,
      visibleCalls,
      isManager,
      team,
      currentUser,
      addLead,
      addLeads,
      updateLead,
      deleteLead,
      addCallLog,
    }),
    [hydrated, leads, calls, visibleLeads, visibleCalls, isManager, team, currentUser, addLead, addLeads, updateLead, deleteLead, addCallLog]
  );

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
};
