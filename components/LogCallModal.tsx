"use client";

import { useEffect, useState } from "react";
import { useCRM, OUTCOMES, PRIORITIES, stageAfterCall } from "@/context/CRMContent";
import type { Lead, Priority } from "@/context/CRMContent";

const POSITIVE = ["Interested", "Meeting booked", "Won"];

function clock(total: number) {
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/** One-click call outcome + notes + next follow-up + call timer. */
export default function LogCallModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { addCallLog, updateLead, currentUser } = useCRM();
  const [seconds, setSeconds] = useState(0);
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [fuDate, setFuDate] = useState(lead.followUpDate);
  const [fuTime, setFuTime] = useState(lead.followUpTime);
  const [priority, setPriority] = useState<Priority>(lead.priority);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const save = () => {
    if (!outcome) return;
    addCallLog({
      leadId: lead.id,
      leadName: lead.name,
      caller: currentUser.name,
      outcome,
      notes,
      durationSeconds: seconds,
    });
    const nextStage = stageAfterCall(outcome, lead.stage);
    const finished = nextStage === "Won" || nextStage === "Lost";
    updateLead(lead.id, {
      stage: nextStage,
      followUpDate: finished ? "" : fuDate,
      followUpTime: finished ? "" : fuTime,
      priority,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-lg space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">{lead.name}</h2>
            <p className="text-xs text-zinc-400">
              {lead.contactPerson}
              {lead.city ? ` · ${lead.city}` : ""}
            </p>
            {lead.phone && (
              <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="text-sm text-slate-200 underline underline-offset-2">
                {lead.phone}
              </a>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase text-zinc-500">Call timer</p>
            <p className="text-2xl font-mono font-bold text-white">{clock(seconds)}</p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase text-zinc-500 mb-2">Call outcome</p>
          <div className="grid grid-cols-2 gap-2">
            {OUTCOMES.map((o) => {
              const selected = outcome === o;
              const tone = POSITIVE.includes(o)
                ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10"
                : "border-zinc-700 text-slate-300 bg-zinc-950";
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutcome(o)}
                  className={`text-sm px-3 py-2 rounded-lg border transition ${tone} ${
                    selected ? "ring-2 ring-slate-300" : "hover:border-zinc-500"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          placeholder="Call notes..."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded text-white text-sm"
        />

        <div>
          <p className="text-xs uppercase text-zinc-500 mb-2">Next follow-up</p>
          <div className="grid grid-cols-3 gap-2">
            <input type="date" value={fuDate} onChange={(e) => setFuDate(e.target.value)} className="p-2 bg-zinc-950 border border-zinc-800 rounded text-white text-sm" />
            <input type="time" value={fuTime} onChange={(e) => setFuTime(e.target.value)} className="p-2 bg-zinc-950 border border-zinc-800 rounded text-white text-sm" />
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="p-2 bg-zinc-950 border border-zinc-800 rounded text-white text-sm">
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-zinc-400">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!outcome}
            className="btn-primary"
          >
            Save call
          </button>
        </div>
      </div>
    </div>
  );
}
