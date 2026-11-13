"use client";

import { use, useState, useEffect, useRef } from "react";
import {
  useCRM,
  CallOutcome,
  Priority,
  SAVED_TEMPLATES,
  PITCH_SCRIPTS,
} from "@/context/CRMContent";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./calls.module.css";

export default function CallWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const leadId = unwrappedParams.id;
  const router = useRouter();

  const {
    leads,
    getLeadById,
    getCallsForLead,
    addCallLog,
    activeCallerName,
  } = useCRM();

  const lead = getLeadById(leadId) || leads[0];
  const previousCalls = lead ? getCallsForLead(lead.id) : [];

  // Live Call History from Database API
  const [callHistory, setCallHistory] = useState<typeof previousCalls>(previousCalls);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchCallHistory = async (targetLeadId: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/calls?leadId=${encodeURIComponent(targetLeadId)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.calls && Array.isArray(data.calls)) {
          setCallHistory(data.calls);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to fetch call history from /api/calls:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (lead?.id) {
      fetchCallHistory(lead.id);
    }
  }, [lead?.id]);

  const currentIndex = leads.findIndex((l) => l.id === lead?.id);
  const prevLead = currentIndex > 0 ? leads[currentIndex - 1] : null;
  const nextLead = currentIndex < leads.length - 1 ? leads[currentIndex + 1] : null;

  // Call Timer State
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Outcome & Call Log Form
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome>("Interested");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("2026-11-04");
  const [followUpTime, setFollowUpTime] = useState("14:30");
  const [priority, setPriority] = useState<Priority>("High");
  const [recordingUrl, setRecordingUrl] = useState(
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  );
  const [showRecordingInput, setShowRecordingInput] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // In-app Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Right Panel Tabs: Scripts vs Objections vs Templates
  const [activeTab, setActiveTab] = useState<"scripts" | "objections" | "templates">("scripts");
  const [scriptLang, setScriptLang] = useState<"English" | "Hindi">("English");
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Save feedback toast
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Timer logic
  useEffect(() => {
    if (isCalling) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCalling]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartCall = () => {
    setIsCalling(true);
  };

  const handleEndCall = () => {
    setIsCalling(false);
  };

  const handleResetTimer = () => {
    setIsCalling(false);
    setSeconds(0);
  };

  const handleSaveCallLog = async () => {
    if (!lead) return;
    const finalDuration = formatTimer(seconds > 0 ? seconds : 142);
    const durSec = seconds > 0 ? seconds : 142;

    const newLogData = {
      leadId: lead.id,
      leadName: lead.name,
      callerName: activeCallerName,
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      outcome: selectedOutcome,
      duration: finalDuration,
      durationSeconds: durSec,
      notes: notes.trim() || `Outcome logged: ${selectedOutcome}.`,
      recordingUrl: recordingUrl || undefined,
      nextFollowUp: followUpDate ? `${followUpDate} ${followUpTime}` : undefined,
      priority,
    };

    // 1. Persist directly to Database via /api/calls
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLogData),
      });
      // Refresh timeline from API
      await fetchCallHistory(lead.id);
    } catch (e) {
      console.error("Failed to post call log to /api/calls:", e);
    }

    // 2. Also sync to CRM context for optimistic UI updates
    addCallLog(newLogData);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (nextLead) {
        router.push(`/calls/${nextLead.id}`);
        setSeconds(0);
        setIsCalling(false);
        setNotes("");
      } else {
        router.push("/calls");
      }
    }, 1100);
  };

  // Audio Playback handlers
  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Variable replacement in scripts and templates
  const fillTemplate = (text: string) => {
    if (!lead) return text;
    return text
      .replace(/{contact_name}/g, lead.contactPerson || "Sir/Ma'am")
      .replace(/{business_name}/g, lead.name)
      .replace(/{caller_name}/g, activeCallerName)
      .replace(/{city}/g, lead.city)
      .replace(/{rating}/g, lead.googleRating.toString());
  };

  const handleCopyPhone = () => {
    if (!lead) return;
    navigator.clipboard.writeText(lead.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyTemplate = (t: typeof SAVED_TEMPLATES[0]) => {
    const filled = fillTemplate(t.content);
    navigator.clipboard.writeText(filled);
    setCopiedTemplateId(t.id);
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  const handleSendWhatsApp = (t: typeof SAVED_TEMPLATES[0]) => {
    if (!lead) return;
    const filled = fillTemplate(t.content);
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(filled)}`;
    window.open(waUrl, "_blank");
  };

  const appendNoteSnippet = (snippet: string) => {
    setNotes((prev) => (prev ? `${prev} • ${snippet}` : snippet));
  };

  const quickSnippets = [
    "Interested in WhatsApp demo",
    "Asked for brochure on WhatsApp",
    "Decision maker not available",
    "Quotation shared via email",
    "Requested callback before weekend",
    "Meeting confirmed on Google Meet",
  ];

  const outcomesList: { outcome: CallOutcome; label: string; icon: string; color: string }[] = [
    { outcome: "Interested", label: "Interested", icon: "🟢", color: "bg-emerald-950/80 border-emerald-500 text-emerald-300" },
    { outcome: "Meeting booked", label: "Meeting Booked", icon: "🟣", color: "bg-cyan-950/80 border-cyan-500 text-cyan-300" },
    { outcome: "Won", label: "Deal Won", icon: "🏆", color: "bg-amber-950/80 border-amber-500 text-amber-300" },
    { outcome: "Call back", label: "Call Back", icon: "🔵", color: "bg-blue-950/80 border-blue-500 text-blue-300" },
    { outcome: "Not answered", label: "Not Answered", icon: "🔴", color: "bg-red-950/80 border-red-500 text-red-300" },
    { outcome: "Busy", label: "Busy / In Meeting", icon: "🟡", color: "bg-yellow-950/80 border-yellow-500 text-yellow-300" },
    { outcome: "Not interested", label: "Not Interested", icon: "⚪", color: "bg-zinc-800 border-zinc-600 text-zinc-300" },
    { outcome: "Wrong number", label: "Wrong Number", icon: "⛔", color: "bg-rose-950/80 border-rose-500 text-rose-300" },
  ];

  if (!lead) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No active lead selected.</p>
        <Link href="/leads" className="text-amber-400 underline mt-2 block">
          Return to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className={`${styles.page} max-w-[1500px] mx-auto space-y-4 pb-10`}>
      {/* Top Calling HUD & Navigation Bar */}
      <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800/90 rounded-2xl p-4 shadow-lg shadow-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Queue Status & Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
          >
            <span>←</span>
            <span>Leads Directory</span>
          </Link>

          <div className="h-4 w-px bg-zinc-800"></div>

          {/* Queue Step Navigator */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">
              Queue Position:
            </span>
            <span className="text-xs font-bold text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Lead {currentIndex + 1} of {leads.length}
            </span>

            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                disabled={!prevLead}
                onClick={() => prevLead && router.push(`/calls/${prevLead.id}`)}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs transition"
                title="Previous Lead"
              >
                ◀
              </button>
              <button
                type="button"
                disabled={!nextLead}
                onClick={() => nextLead && router.push(`/calls/${nextLead.id}`)}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs transition"
                title="Next Lead"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* Center: Live Call Status Indicator */}
        <div className="flex items-center justify-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              isCalling
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-500/10"
                : "bg-zinc-950 text-zinc-400 border-zinc-800"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isCalling ? "bg-emerald-400 animate-ping" : "bg-zinc-600"
              }`}
            ></span>
            <span>{isCalling ? "AUDIO CALL CONNECTED" : "READY TO CALL"}</span>
            {isCalling && (
              <div className="flex items-center gap-0.5 ml-1">
                <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse delay-75"></span>
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150"></span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Action Hub & Active Caller Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 hidden sm:inline">Active Caller:</span>
          <div className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2 text-xs font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{activeCallerName}</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Lead Profile, Intel & Touchpoint History (3.5 cols)           */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* Main Lead Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
            {/* Ambient category glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-xl font-black text-white leading-tight">
                    {lead.name}
                  </h1>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    📍 {lead.city} • <span className="text-amber-400 font-semibold">{lead.category}</span>
                  </p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full font-bold uppercase bg-amber-400/10 text-amber-300 border border-amber-400/30 shrink-0">
                  {lead.pipeline}
                </span>
              </div>

              {/* Google Rating Badge */}
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-amber-400 font-black text-sm">★ {lead.googleRating}</span>
                <span className="text-zinc-400 text-xs font-medium">Google Rating</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500 text-xs">{lead.googleReviewsCount} Reviews</span>
              </div>
            </div>

            {/* Decision Maker & Dial Box */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                    Contact Person
                  </span>
                  <p className="text-sm font-bold text-white">{lead.contactPerson}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Primary Lead
                </span>
              </div>

              {/* Phone with 1-Click Dial & Copy */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <div className="font-mono text-sm font-bold text-emerald-400 tracking-wider">
                  📞 {lead.phone}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs transition"
                    title="Copy Phone Number"
                  >
                    {copiedPhone ? "✓ Copied" : "📋 Copy"}
                  </button>
                  <a
                    href={`tel:${lead.phone}`}
                    onClick={handleStartCall}
                    className="px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1 shadow-sm transition"
                  >
                    <span>Dial</span>
                  </a>
                </div>
              </div>

              {lead.email && (
                <div className="text-xs text-zinc-400 flex items-center justify-between truncate pt-1">
                  <span>✉️ {lead.email}</span>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-blue-400 hover:underline text-[11px]"
                  >
                    Email
                  </a>
                </div>
              )}
            </div>

            {/* Quick External Links */}
            <div className="flex items-center gap-2 pt-1">
              {lead.websiteUrl && (
                <a
                  href={lead.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-2 text-center rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-blue-400 transition"
                >
                  🌐 Website
                </a>
              )}
              {lead.instagramUrl && (
                <a
                  href={lead.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-2 text-center rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-pink-400 transition"
                >
                  📸 Instagram
                </a>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.name + " " + lead.city)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-2 text-center rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-amber-400 transition"
              >
                🗺️ Maps
              </a>
            </div>

            {/* Prospect Brief / Lead Notes */}
            {lead.notes && (
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Prospect Background:
                </span>
                <p className="text-xs text-zinc-300 italic leading-relaxed">
                  &ldquo;{lead.notes}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Past Touchpoints Timeline */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Call History ({(callHistory.length > 0 ? callHistory : previousCalls).length})
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  api/calls
                </span>
              </div>
              <button
                type="button"
                onClick={() => lead?.id && fetchCallHistory(lead.id)}
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/60 hover:bg-zinc-800 transition"
                title="Refresh Call History from API"
              >
                <span>🔄</span>
                <span>{isLoadingHistory ? "Syncing..." : "Sync"}</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {isLoadingHistory && (callHistory.length === 0 && previousCalls.length === 0) && (
                <div className="p-4 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></span>
                  <span>Fetching history from database API...</span>
                </div>
              )}

              {(callHistory.length > 0 ? callHistory : previousCalls).map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-1.5 text-xs hover:border-zinc-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>📞</span>
                      <span>{c.outcome}</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {c.date}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {c.notes}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                    <span>⏱️ Duration: {c.duration}</span>
                    <span>Caller: {c.callerName}</span>
                  </div>
                </div>
              ))}

              {(callHistory.length === 0 && previousCalls.length === 0) && !isLoadingHistory && (
                <div className="p-4 text-center text-zinc-500 text-xs italic">
                  No previous touchpoints recorded for this prospect. Be the first to log a call!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER COLUMN: Live Call Logger & Audio Recording Controls (4.5 cols)    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Call HUD & Digital Timer */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Call Timer & Controls
              </span>
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                  isMuted
                    ? "bg-red-500/20 text-red-300 border-red-500/40"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {isMuted ? "🔇 Mic Muted" : "🎙️ Mic Active"}
              </button>
            </div>

            {/* Huge Digital Timer Display */}
            <div className="text-center py-4 bg-zinc-950 rounded-2xl border border-zinc-800 relative overflow-hidden">
              <span
                className={`font-mono text-5xl sm:text-6xl font-black tracking-widest transition-colors ${
                  isCalling ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" : "text-white"
                }`}
              >
                {formatTimer(seconds)}
              </span>
              <p className="text-[11px] text-zinc-500 mt-1 uppercase font-semibold tracking-wider">
                {isCalling ? "Active Talking Time" : "Call Paused / Inactive"}
              </p>
            </div>

            {/* Call Action Triggers */}
            <div className="grid grid-cols-3 gap-2">
              {!isCalling ? (
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="col-span-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transform hover:scale-[1.01]"
                >
                  <span className="text-base">📞</span>
                  <span>{seconds === 0 ? "Start Call Now" : "Resume Conversation"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="col-span-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                >
                  <span className="text-base">⏹</span>
                  <span>Pause / End Call</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetTimer}
                className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-300 text-xs font-semibold transition"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Disposition Matrix (One-Click Outcomes) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider">
                  1-Click Call Outcome *
                </label>
                <span className="text-[10px] text-amber-400 font-semibold">
                  Required for CRM
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Select the prospect&apos;s reaction to log this attempt:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {outcomesList.map((item) => {
                const isSelected = selectedOutcome === item.outcome;
                return (
                  <button
                    key={item.outcome}
                    type="button"
                    onClick={() => setSelectedOutcome(item.outcome)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                      isSelected
                        ? `${item.color} ring-2 ring-amber-400/40 shadow-md scale-[1.02]`
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Snippets Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                Quick Insert Snippets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickSnippets.map((snippet) => (
                  <button
                    key={snippet}
                    type="button"
                    onClick={() => appendNoteSnippet(snippet)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
                  >
                    + {snippet}
                  </button>
                ))}
              </div>
            </div>

            {/* Call Notes Input */}
            <div className="space-y-1">
              <textarea
                rows={3}
                placeholder="Type call minutes, client objections, custom pricing requested..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-amber-400 transition"
              ></textarea>
            </div>

            {/* Next Follow-up & Priority Scheduling */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200">📅 Next Follow-up</span>
                {/* Quick Presets */}
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setFollowUpDate("2026-11-03");
                      setFollowUpTime("16:00");
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    Today 4 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFollowUpDate("2026-11-04");
                      setFollowUpTime("11:00");
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    Tmrw 11 AM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFollowUpDate("2026-11-06");
                      setFollowUpTime("14:30");
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    In 3 Days
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1">Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white outline-none focus:border-amber-400 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1">Time</label>
                  <input
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white outline-none focus:border-amber-400 text-xs"
                  />
                </div>
              </div>

              {/* Priority Pills */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-zinc-400 text-[11px]">Follow-up Urgency:</span>
                <div className="flex gap-1">
                  {(["High", "Medium", "Low"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                        priority === p
                          ? p === "High"
                            ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                            : p === "Medium"
                            ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                            : "bg-blue-500 text-white"
                          : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* In-App Call Recording Audio Player */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                  <span>🎙️</span>
                  <span>Call Recording Audio</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowRecordingInput(!showRecordingInput)}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  {showRecordingInput ? "Hide Link" : "Attach / Link MP3"}
                </button>
              </div>

              {showRecordingInput && (
                <input
                  type="text"
                  placeholder="Paste audio URL (.mp3 or stream link)"
                  value={recordingUrl}
                  onChange={(e) => setRecordingUrl(e.target.value)}
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white outline-none focus:border-amber-400"
                />
              )}

              {/* Custom Waveform Player Bar */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleAudioPlay}
                    className="w-9 h-9 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-amber-400/20 transition transform active:scale-95"
                  >
                    {isPlayingAudio ? "⏸" : "▶"}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                      <span className="font-mono text-zinc-300">
                        {formatTimer(Math.floor(audioCurrentTime))}
                      </span>
                      <span className="font-semibold text-zinc-400 truncate max-w-[150px]">
                        Sample Recording ({formatTimer(Math.floor(audioDuration || 180))})
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={audioDuration || 180}
                      value={audioCurrentTime}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setAudioCurrentTime(val);
                        if (audioRef.current) audioRef.current.currentTime = val;
                      }}
                      className="w-full accent-amber-400 h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Speed Toggles */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                  <span>Playback Speed:</span>
                  <div className="flex gap-1">
                    {[1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => changeSpeed(s)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          playbackSpeed === s
                            ? "bg-amber-400 text-black"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src={recordingUrl}
                  onTimeUpdate={() => {
                    if (audioRef.current) setAudioCurrentTime(audioRef.current.currentTime);
                  }}
                  onLoadedMetadata={() => {
                    if (audioRef.current) setAudioDuration(audioRef.current.duration);
                  }}
                  onEnded={() => setIsPlayingAudio(false)}
                />
              </div>
            </div>

            {/* Save & Advance Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveCallLog}
                disabled={savedSuccess}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-black font-black text-sm shadow-xl shadow-amber-400/20 transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {savedSuccess ? (
                  <span>✅ Call Logged! Advancing to next lead...</span>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Save Call Log &amp; Next Lead</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Live Pitch Scripts & Instant WhatsApp Outreach (4.5 cols)   */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col h-full min-h-[650px]">
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("scripts")}
                className={`flex-1 pb-3 font-bold border-b-2 transition ${
                  activeTab === "scripts"
                    ? "border-amber-400 text-amber-300"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                📖 Pitch Script
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("objections")}
                className={`flex-1 pb-3 font-bold border-b-2 transition ${
                  activeTab === "objections"
                    ? "border-amber-400 text-amber-300"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                🛡️ Objections
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("templates")}
                className={`flex-1 pb-3 font-bold border-b-2 transition ${
                  activeTab === "templates"
                    ? "border-amber-400 text-amber-300"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                💬 WhatsApp
              </button>
            </div>

            {/* TAB 1: Live Pitch Scripts */}
            {activeTab === "scripts" && (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {/* Language Switcher */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Pitch Dialect:</span>
                  <div className="flex bg-zinc-950 rounded-xl p-0.5 border border-zinc-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setScriptLang("English")}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        scriptLang === "English"
                          ? "bg-amber-400 text-black shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setScriptLang("Hindi")}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        scriptLang === "Hindi"
                          ? "bg-amber-400 text-black shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      हिंदी / Hinglish
                    </button>
                  </div>
                </div>

                {/* Script Cards */}
                <div className="space-y-3">
                  {PITCH_SCRIPTS.filter((s) => s.language === scriptLang).map((sec) => (
                    <div
                      key={sec.id}
                      className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 text-sm">
                          {sec.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold">
                          {sec.category}
                        </span>
                      </div>

                      <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 text-zinc-100 leading-relaxed font-sans text-xs">
                        {fillTemplate(sec.script)}
                      </div>

                      {sec.bullets && (
                        <div className="pt-1">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                            Coaching Notes:
                          </span>
                          <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-0.5">
                            {sec.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Objection Handling Framework */}
            {activeTab === "objections" && (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-400 text-xs">
                      1. &quot;WhatsApp me the details&quot;
                    </span>
                    <span className="text-[10px] text-zinc-500">Most Common</span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-zinc-200 text-xs leading-relaxed">
                    &ldquo;I would love to send that right over, {lead.contactPerson}! So I don&apos;t spam you with irrelevant docs—are you looking to attract more customers in {lead.city} this month, or is your team already at full capacity?&rdquo;
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 text-xs">
                      2. &quot;We already have an agency / vendor&quot;
                    </span>
                    <span className="text-[10px] text-zinc-500">Vendor Objection</span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-zinc-200 text-xs leading-relaxed">
                    &ldquo;That&apos;s awesome! Most of our top clients already had an agency. We don&apos;t ask you to fire them—we simply plug in our automated WhatsApp follow-up engine that adds 20-30% more conversions from the calls you already pay for.&rdquo;
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-400 text-xs">
                      3. &quot;How much does it cost?&quot;
                    </span>
                    <span className="text-[10px] text-zinc-500">Pricing Inquiry</span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-zinc-200 text-xs leading-relaxed">
                    &ldquo;Our plans start from a small monthly pilot and are designed so just 1-2 extra clients pay for the entire year. Can I show you our live dashboard on a quick 10-minute screen share tomorrow?&rdquo;
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400 text-xs">
                      4. &quot;Call me back later&quot;
                    </span>
                    <span className="text-[10px] text-zinc-500">Stall / Delay</span>
                  </div>
                  <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-zinc-200 text-xs leading-relaxed">
                    &ldquo;Understood, I know you&apos;re busy running the business! Would 4:30 PM today work, or does tomorrow morning around 11 AM suit your calendar better?&rdquo;
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Instant WhatsApp & Email Outreach */}
            {activeTab === "templates" && (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <div className="space-y-3">
                  {SAVED_TEMPLATES.map((tmpl) => {
                    const isCopied = copiedTemplateId === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">
                            {tmpl.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
                            {tmpl.channel}
                          </span>
                        </div>

                        <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 text-zinc-300 text-xs whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto font-sans">
                          {fillTemplate(tmpl.content)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleCopyTemplate(tmpl)}
                            className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition border border-zinc-700 flex items-center justify-center gap-1"
                          >
                            <span>{isCopied ? "✓" : "📋"}</span>
                            <span>{isCopied ? "Copied!" : "Copy Text"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(tmpl)}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-sm"
                          >
                            <span>💬</span>
                            <span>Send WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
