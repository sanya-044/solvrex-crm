"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Lead {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: string;
  pipeline: string;
  notes: string;
  followUpDate: string;
}

export interface CallLog {
  id: string;
  leadName: string;
  date: string;
  outcome: string;
  duration: string;
  notes: string;
}

interface CRMContextType {
  leads: Lead[];
  calls: CallLog[];
  addLead: (lead: Omit<Lead, "id">) => void;
  updateLead: (id: string, updated: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addCallLog: (call: Omit<CallLog, "id">) => void;
}

const initialLeads: Lead[] = [
  { id: "1", name: "Old Town Cafe", contactPerson: "Rohan Das", phone: "+91 9876543210", email: "contact@oldtown.com", status: "New", pipeline: "Lead", notes: "Interested in web redesign", followUpDate: "2026-11-02" },
  { id: "2", name: "Cafe De Arte", contactPerson: "Priya Singh", phone: "+91 9812345678", email: "info@cafedearte.in", status: "Contacted", pipeline: "Proposal", notes: "Sent proposal via email", followUpDate: "2026-10-30" },
  { id: "3", name: "Grounded Cafe", contactPerson: "Amit Patel", phone: "+91 9988776655", email: "hello@grounded.com", status: "Closed", pipeline: "Won", notes: "Contract signed!", followUpDate: "" }
];

const initialCalls: CallLog[] = [
  { id: "c1", leadName: "Cafe De Arte", date: "2026-10-28 14:30", outcome: "Connected", duration: "5 mins", notes: "Discussed custom CRM features" },
  { id: "c2", leadName: "Old Town Cafe", date: "2026-10-27 11:15", outcome: "No Answer", duration: "0 mins", notes: "Left voicemail" }
];

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("solvrex_crm_leads");
      return saved ? JSON.parse(saved) : initialLeads;
    }
    return initialLeads;
  });

  const [calls, setCalls] = useState<CallLog[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("solvrex_crm_calls");
      return saved ? JSON.parse(saved) : initialCalls;
    }
    return initialCalls;
  });

  useEffect(() => {
    localStorage.setItem("solvrex_crm_leads", JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem("solvrex_crm_calls", JSON.stringify(calls));
  }, [calls]);

  const addLead = (lead: Omit<Lead, "id">) => {
    const newLead: Lead = { ...lead, id: Date.now().toString() };
    setLeads((prev) => [newLead, ...prev]);
  };

  const updateLead = (id: string, updated: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)));
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const addCallLog = (call: Omit<CallLog, "id">) => {
    const newCall: CallLog = { ...call, id: Date.now().toString() };
    setCalls((prev) => [newCall, ...prev]);
  };

  return (
    <CRMContext.Provider value={{ leads, calls, addLead, updateLead, deleteLead, addCallLog }}>
      {children}
    </CRMContext.Provider>
  );
}

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
};