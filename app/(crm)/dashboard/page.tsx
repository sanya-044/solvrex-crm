"use client";

import Link from "next/link";
import { useState } from "react";
import { useCRM } from "@/context/CRMContent";
import chartMotionStyles from "./chart-animations.module.css";

export default function Dashboard() {
  const { stats } = useCRM();
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("month");
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredFunnelTier, setHoveredFunnelTier] = useState<number | null>(null);
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState<"converted" | "qualified" | "raw" | null>(null);

  // 5 Compact KPI Cards with Luxury Metallic Silver & Brushed Titanium Surfaces
  const kpiData = [
    {
      title: "Calls Today",
      value: stats.callsToday > 0 ? stats.callsToday : 48,
      growth: "+12%",
      border: "border-[#AEB5BF]/45 hover:border-[#ffffff]/80",
      glow: "shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.45),inset_0_-1px_1.5px_0_rgba(0,0,0,0.65),0_14px_30px_-4px_rgba(0,0,0,0.80),0_0_18px_0_rgba(192,192,192,0.18)]",
      cardBg: "from-[#384353] via-[#29323f] to-[#1c222b]",
      badgeBg: "bg-gradient-to-br from-[#3b2064] to-[#20103b]",
      badgeBorder: "border-purple-400/50",
      badgeText: "text-purple-200",
      badgeShadow: "shadow-[0_0_14px_rgba(168,85,247,0.4)]",
      headerIcon: (
        <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      badgeIcon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      title: "Calls This Week",
      value: stats.callsThisWeek > 0 ? stats.callsThisWeek : 312,
      growth: "+18%",
      border: "border-[#AEB5BF]/45 hover:border-[#ffffff]/80",
      glow: "shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.45),inset_0_-1px_1.5px_0_rgba(0,0,0,0.65),0_14px_30px_-4px_rgba(0,0,0,0.80),0_0_18px_0_rgba(192,192,192,0.18)]",
      cardBg: "from-[#384353] via-[#29323f] to-[#1c222b]",
      badgeBg: "bg-gradient-to-br from-[#1b3562] to-[#0e1d38]",
      badgeBorder: "border-blue-400/50",
      badgeText: "text-blue-200",
      badgeShadow: "shadow-[0_0_14px_rgba(59,130,246,0.4)]",
      headerIcon: (
        <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      badgeIcon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Calls This Month",
      value: stats.callsThisMonth > 0 ? stats.callsThisMonth.toLocaleString() : "1,246",
      growth: "+21%",
      border: "border-[#AEB5BF]/45 hover:border-[#ffffff]/80",
      glow: "shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.45),inset_0_-1px_1.5px_0_rgba(0,0,0,0.65),0_14px_30px_-4px_rgba(0,0,0,0.80),0_0_18px_0_rgba(192,192,192,0.18)]",
      cardBg: "from-[#384353] via-[#29323f] to-[#1c222b]",
      badgeBg: "bg-gradient-to-br from-[#123d4e] to-[#09222c]",
      badgeBorder: "border-cyan-400/50",
      badgeText: "text-cyan-200",
      badgeShadow: "shadow-[0_0_14px_rgba(6,182,212,0.4)]",
      headerIcon: (
        <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      ),
      badgeIcon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      ),
    },
    {
      title: "Connect Rate",
      value: stats.connectRate > 0 ? `${stats.connectRate}%` : "64.2%",
      growth: "+5.8%",
      border: "border-[#AEB5BF]/45 hover:border-[#ffffff]/80",
      glow: "shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.45),inset_0_-1px_1.5px_0_rgba(0,0,0,0.65),0_14px_30px_-4px_rgba(0,0,0,0.80),0_0_18px_0_rgba(192,192,192,0.18)]",
      cardBg: "from-[#384353] via-[#29323f] to-[#1c222b]",
      badgeBg: "bg-gradient-to-br from-[#123e2b] to-[#092218]",
      badgeBorder: "border-emerald-400/50",
      badgeText: "text-emerald-200",
      badgeShadow: "shadow-[0_0_14px_rgba(16,185,129,0.4)]",
      headerIcon: (
        <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      badgeIcon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "Conversions",
      value: (stats.pipelineCount?.Won ?? 0) > 0 ? stats.pipelineCount.Won : 78,
      growth: "+14%",
      border: "border-[#AEB5BF]/45 hover:border-[#ffffff]/80",
      glow: "shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.45),inset_0_-1px_1.5px_0_rgba(0,0,0,0.65),0_14px_30px_-4px_rgba(0,0,0,0.80),0_0_18px_0_rgba(192,192,192,0.18)]",
      cardBg: "from-[#384353] via-[#29323f] to-[#1c222b]",
      badgeBg: "bg-gradient-to-br from-[#401a46] to-[#250d28]",
      badgeBorder: "border-fuchsia-400/50",
      badgeText: "text-fuchsia-200",
      badgeShadow: "shadow-[0_0_14px_rgba(217,70,239,0.4)]",
      headerIcon: (
        <svg className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      badgeIcon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  // Pipeline stages from Image 1
  const pipelineStages = [
    { label: "New Leads", count: "1,120", dotColor: "bg-[#a855f7]" },
    { label: "Prospecting", count: "642", dotColor: "bg-[#818cf8]" },
    { label: "Proposal Sent", count: "321", dotColor: "bg-[#06b6d4]" },
    { label: "Won / Closed", count: "189", dotColor: "bg-[#10b981]" },
    { label: "Lost", count: "76", dotColor: "bg-[#cbd5e1]" },
  ];

  // Top Callers from Image 1
  const topCallers = [
    {
      rank: 1,
      name: "Sarah J.",
      calls: 499,
      conversions: 62,
      badgeGradient: "from-amber-300 via-amber-400 to-amber-500",
      badgeShadow: "shadow-[0_0_12px_rgba(245,158,11,0.5)]",
      textColor: "text-slate-950",
    },
    {
      rank: 2,
      name: "Rahul S.",
      calls: 296,
      conversions: 41,
      badgeGradient: "from-slate-200 via-slate-300 to-slate-400",
      badgeShadow: "shadow-[0_0_10px_rgba(203,213,225,0.4)]",
      textColor: "text-slate-950",
    },
    {
      rank: 3,
      name: "Priya K.",
      calls: 276,
      conversions: 37,
      badgeGradient: "from-amber-600 via-amber-700 to-amber-800",
      badgeShadow: "shadow-[0_0_10px_rgba(217,119,6,0.4)]",
      textColor: "text-white",
    },
  ];

  // Follow-ups from Image 1
  const followupsList = [
    {
      company: "Apex Cloud Solutions",
      time: "11:00 AM",
      priority: "High",
      priorityColor: "bg-rose-600/90 border-rose-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]",
      icon: (
        <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      company: "Vanguard Logistics",
      time: "2:30 PM",
      priority: "Medium",
      priorityColor: "bg-amber-500/90 border-amber-400 text-white shadow-[0_0_8px_rgba(245,158,11,0.4)]",
      icon: (
        <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      company: "Nexis Health Innovations",
      time: "4:00 PM",
      priority: "High",
      priorityColor: "bg-rose-600/90 border-rose-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]",
      icon: (
        <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  // Recent calls from Image 1
  const recentCallsList = [
    {
      company: "TechFlow Systems",
      status: "Interested",
      statusStyle: "bg-emerald-600/90 border-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]",
      statusPrefix: "●",
      time: "10:30 AM",
    },
    {
      company: "Acroba Retail Group",
      status: "Call Back",
      statusStyle: "bg-amber-500/90 border-amber-400 text-white shadow-[0_0_8px_rgba(245,158,11,0.4)]",
      statusPrefix: "✔",
      time: "09:45 AM",
    },
    {
      company: "Zenith Financials",
      status: "Not Interested",
      statusStyle: "bg-slate-700/80 border-slate-600 text-slate-200",
      statusPrefix: "⊝",
      time: "09:10 AM",
    },
  ];

  return (
    <div className="space-y-3 max-w-[1550px] mx-auto select-none pb-2 relative">
      {/* ========================================================
          1. HEADER SECTION (Left: Title + Live, Right: Search, Bell, Profile)
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1.5 pb-0.5">
        {/* Title and Subtitle */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-white via-[#E5E4E2] to-[#AEB5BF] bg-clip-text text-transparent tracking-tight leading-normal drop-shadow-sm">
              Dashboard
            </h1>

            {/* Small Green Live Badge with Silver-Aluminium Rim */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1c2422] border border-[#AEB5BF]/50 text-emerald-300 text-[11px] font-semibold shrink-0 shadow-[0_0_8px_rgba(174,181,191,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live</span>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-[#AEB5BF] font-normal mt-0.5 leading-snug">
            Calling &amp; Sales Performance Overview
          </p>
        </div>

        {/* Search, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Compact Pill Search bar */}
          <div className="relative">
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads, deals, contacts, reports..."
              className="w-48 sm:w-60 md:w-72 pl-8 pr-3 py-1.5 rounded-full bg-[#1c222b]/95 border border-[#717985]/35 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#C0C0C0] focus:ring-1 focus:ring-[#C0C0C0]/40 transition-all shadow-inner h-8"
            />
          </div>

          {/* Compact Notification Bell */}
          <button
            type="button"
            className="relative w-8 h-8 rounded-full bg-[#1c222b]/95 border border-[#717985]/35 flex items-center justify-center text-slate-300 hover:text-white hover:border-[#C0C0C0] transition shadow-sm shrink-0"
            aria-label="3 notifications"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)]">
              3
            </span>
          </button>

          {/* User Profile dropdown button */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1c222b]/95 border border-[#717985]/35 hover:border-[#C0C0C0] transition cursor-pointer shadow-sm h-8">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#3b4352] to-[#1c222b] border border-[#AEB5BF]/60 text-[#F0F2F5] font-black text-[10px] flex items-center justify-center shadow-[0_0_6px_rgba(174,181,191,0.3)]">
              A
            </div>
            <div className="hidden xl:block text-left pr-1 leading-tight">
              <p className="text-xs font-bold text-white leading-tight">Alex Morgan</p>
              <p className="text-[9px] text-[#AEB5BF] leading-tight">VP of Enterprise Sales</p>
            </div>
            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Date Filter: Aligned to the right directly above Conversions card */}
      <div className="flex justify-end pt-0.5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1c222b]/95 border border-[#717985]/35 text-[11px] font-semibold text-[#E5E4E2] hover:text-white hover:border-[#C0C0C0] transition shadow-sm"
          >
            <svg className="w-3 h-3 text-[#AEB5BF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{timeframe === "month" ? "This Month" : timeframe === "week" ? "This Week" : "Today"}</span>
            <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dateDropdownOpen && (
            <div className="absolute right-0 mt-1 w-32 rounded-xl bg-[#1c222b] border border-[#717985]/40 shadow-2xl py-1 z-30 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => { setTimeframe("today"); setDateDropdownOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => { setTimeframe("week"); setDateDropdownOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => { setTimeframe("month"); setDateDropdownOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                This Month
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          2. KPI CARDS: EXACTLY 5 CARDS IN ONE HORIZONTAL ROW
          ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiData.map((kpi) => (
          <div
            key={kpi.title}
            className={`p-4 rounded-2xl bg-gradient-to-b ${kpi.cardBg} border ${kpi.border} border-t-[#ffffff] border-l-[#E5E4E2]/70 border-r-[#AEB5BF]/40 ${kpi.glow} backdrop-blur-xl relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}
          >
            {/* Polished Chrome Top Rim & Brushed Aluminium Specular Corner */}
            <div className="glass-rim" />
            <div className="silver-corner-shine" />

            {/* Header: Small Icon on Left + Label */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 relative z-10">
              {kpi.headerIcon}
              <span className="truncate text-[11px] text-[#E5E4E2]">{kpi.title}</span>
            </div>

            {/* Metric Value + Growth + Circular Glowing Icon on Right */}
            <div className="mt-3 flex items-end justify-between relative z-10">
              <div>
                <div className="text-[28px] sm:text-[30px] font-black text-white tracking-tight leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {kpi.value}
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <span>↑</span>
                  <span>{kpi.growth}</span>
                </div>
              </div>

              {/* Circular Glowing Icon Container — matches reference image proportions */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${kpi.badgeBg} border ${kpi.badgeBorder} ${kpi.badgeText} ${kpi.badgeShadow} shrink-0 group-hover:scale-110 transition-transform duration-200`}
              >
                {kpi.badgeIcon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================
          3. ANALYTICS SECTION: 3 PANELS (Pipeline | Conversion | Top Callers)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Panel 1: Pipeline by Stage (Inverted Colorful Funnel) */}
        <div className="lg:col-span-5 p-4 rounded-2xl glass-panel relative overflow-hidden group/panel">
          <div className="glass-rim" />
          <div className="silver-corner-shine" />

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-white tracking-wide">
              Pipeline by Stage
            </h2>
            <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1 opacity-80">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              Live Funnel
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 relative z-10">
            {/* Inverted Funnel Chart (SVG) */}
            <div className="w-[150px] sm:w-[165px] shrink-0">
              <svg viewBox="0 0 220 180" className="w-full h-auto drop-shadow-lg overflow-visible">
                <defs>
                  <linearGradient id="fn1" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                  <linearGradient id="fn2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="fn3" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                  <linearGradient id="fn4" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="fn5" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>
                </defs>

                {/* Tier 1: New Leads — widest */}
                <polygon
                  points="6,6 214,6 192,38 28,38"
                  fill="url(#fn1)"
                  onMouseEnter={() => setHoveredFunnelTier(1)}
                  onMouseLeave={() => setHoveredFunnelTier(null)}
                  style={{ animationDelay: "0ms" }}
                  className={`${chartMotionStyles.funnelTier} ${
                    hoveredFunnelTier === 1
                      ? "opacity-100 filter drop-shadow-[0_0_12px_rgba(168,85,247,0.95)] scale-[1.04]"
                      : "opacity-90 hover:opacity-100"
                  }`}
                />
                {/* Tier 2: Prospecting */}
                <polygon
                  points="31,43 189,43 168,75 52,75"
                  fill="url(#fn2)"
                  onMouseEnter={() => setHoveredFunnelTier(2)}
                  onMouseLeave={() => setHoveredFunnelTier(null)}
                  style={{ animationDelay: "85ms" }}
                  className={`${chartMotionStyles.funnelTier} ${
                    hoveredFunnelTier === 2
                      ? "opacity-100 filter drop-shadow-[0_0_12px_rgba(99,102,241,0.95)] scale-[1.04]"
                      : "opacity-90 hover:opacity-100"
                  }`}
                />
                {/* Tier 3: Proposal Sent */}
                <polygon
                  points="55,80 165,80 143,112 77,112"
                  fill="url(#fn3)"
                  onMouseEnter={() => setHoveredFunnelTier(3)}
                  onMouseLeave={() => setHoveredFunnelTier(null)}
                  style={{ animationDelay: "170ms" }}
                  className={`${chartMotionStyles.funnelTier} ${
                    hoveredFunnelTier === 3
                      ? "opacity-100 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.95)] scale-[1.04]"
                      : "opacity-90 hover:opacity-100"
                  }`}
                />
                {/* Tier 4: Won / Closed */}
                <polygon
                  points="80,117 140,117 124,149 96,149"
                  fill="url(#fn4)"
                  onMouseEnter={() => setHoveredFunnelTier(4)}
                  onMouseLeave={() => setHoveredFunnelTier(null)}
                  style={{ animationDelay: "255ms" }}
                  className={`${chartMotionStyles.funnelTier} ${
                    hoveredFunnelTier === 4
                      ? "opacity-100 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.95)] scale-[1.04]"
                      : "opacity-90 hover:opacity-100"
                  }`}
                />
                {/* Tier 5: Lost — narrowest */}
                <polygon
                  points="97,154 123,154 115,170 105,170"
                  fill="url(#fn5)"
                  onMouseEnter={() => setHoveredFunnelTier(5)}
                  onMouseLeave={() => setHoveredFunnelTier(null)}
                  style={{ animationDelay: "340ms" }}
                  className={`${chartMotionStyles.funnelTier} ${
                    hoveredFunnelTier === 5
                      ? "opacity-100 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] scale-[1.04]"
                      : "opacity-90 hover:opacity-100"
                  }`}
                />
              </svg>
            </div>

            {/* Stage List with Counts */}
            <div className="flex-1 space-y-2">
              {pipelineStages.map((ps, idx) => (
                <div
                  key={ps.label}
                  onMouseEnter={() => setHoveredFunnelTier(idx + 1)}
                  onMouseLeave={() => setHoveredFunnelTier(null)}
                  style={{ animationDelay: `${idx * 70}ms` }}
                  className={`${chartMotionStyles.funnelStage} flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                    hoveredFunnelTier === idx + 1
                      ? "bg-[#292E36] scale-[1.02] shadow-[0_0_12px_rgba(240,242,245,0.18)] border border-[#AEB5BF]/60"
                      : "bg-[#1c222b]/85 hover:bg-[#252b36] border border-[#717985]/30 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${ps.dotColor} transition-transform duration-200 ${
                        hoveredFunnelTier === idx + 1 ? "scale-125 shadow-[0_0_8px_currentColor]" : ""
                      }`}
                    />
                    <span className="text-slate-300 font-medium text-[11px]">{ps.label}</span>
                  </div>
                  <span className="text-white font-extrabold text-xs">{ps.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 2: Lead Conversion (Circular Doughnut Chart) */}
        <div className="lg:col-span-4 p-4 rounded-2xl glass-panel relative overflow-hidden group/panel">
          <div className="glass-rim" />
          <div className="silver-corner-shine" />

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-white tracking-wide">
              Lead Conversion
            </h2>
            <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1 opacity-80">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
              Live Rate
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 relative z-10">
            {/* Circular Doughnut Chart with Ambient Glow Ring */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center group cursor-pointer">
              <svg viewBox="0 0 140 140" className={`w-full h-full -rotate-90 ${chartMotionStyles.donutGlowRing}`}>
                {/* Background Ring Track */}
                <circle
                  cx="70"
                  cy="70"
                  r="52"
                  fill="transparent"
                  stroke="#141c2c"
                  strokeWidth="14"
                />
                {/* Converted Arc (70%): cyan */}
                <circle
                  cx="70"
                  cy="70"
                  r="52"
                  fill="transparent"
                  stroke="#06b6d4"
                  strokeWidth={hoveredDonutSegment === "converted" ? 17 : 14}
                  strokeDasharray="228 327"
                  strokeDashoffset="0"
                  onMouseEnter={() => setHoveredDonutSegment("converted")}
                  onMouseLeave={() => setHoveredDonutSegment(null)}
                  className={`${chartMotionStyles.donutArc} ${chartMotionStyles.convertedArc} ${
                    hoveredDonutSegment === "converted"
                      ? "filter drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] opacity-100"
                      : "opacity-95"
                  }`}
                />
                {/* Qualified Arc (20%): purple */}
                <circle
                  cx="70"
                  cy="70"
                  r="52"
                  fill="transparent"
                  stroke="#a855f7"
                  strokeWidth={hoveredDonutSegment === "qualified" ? 17 : 14}
                  strokeDasharray="65 327"
                  strokeDashoffset="-230"
                  onMouseEnter={() => setHoveredDonutSegment("qualified")}
                  onMouseLeave={() => setHoveredDonutSegment(null)}
                  className={`${chartMotionStyles.donutArc} ${chartMotionStyles.qualifiedArc} ${
                    hoveredDonutSegment === "qualified"
                      ? "filter drop-shadow-[0_0_10px_rgba(168,85,247,0.9)] opacity-100"
                      : "opacity-95"
                  }`}
                />
                {/* Raw Arc (10%): orange */}
                <circle
                  cx="70"
                  cy="70"
                  r="52"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth={hoveredDonutSegment === "raw" ? 17 : 14}
                  strokeDasharray="33 327"
                  strokeDashoffset="-297"
                  onMouseEnter={() => setHoveredDonutSegment("raw")}
                  onMouseLeave={() => setHoveredDonutSegment(null)}
                  className={`${chartMotionStyles.donutArc} ${chartMotionStyles.rawArc} ${
                    hoveredDonutSegment === "raw"
                      ? "filter drop-shadow-[0_0_10px_rgba(245,158,11,0.9)] opacity-100"
                      : "opacity-95"
                  }`}
                />
              </svg>

              {/* Inside Donut Dynamic Text with Pulse */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-300 ${chartMotionStyles.centerCounterPulse}`}>
                <span className={`text-lg sm:text-xl font-black leading-tight transition-colors duration-200 ${
                  hoveredDonutSegment === "qualified"
                    ? "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                    : hoveredDonutSegment === "raw"
                    ? "text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    : "text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                }`}>
                  {hoveredDonutSegment === "qualified" ? "20%" : hoveredDonutSegment === "raw" ? "10%" : "70%"}
                </span>
                <span className="text-[9px] text-slate-300 font-medium tracking-tight">
                  {hoveredDonutSegment === "qualified" ? "Qualified" : hoveredDonutSegment === "raw" ? "Raw" : "Converted"}
                </span>
              </div>
            </div>

            {/* Legend: Converted, Qualified, Raw with Synchronous Hover Animation */}
            <div className="flex-1 space-y-2">
              <div
                onMouseEnter={() => setHoveredDonutSegment("converted")}
                onMouseLeave={() => setHoveredDonutSegment(null)}
                className={`${chartMotionStyles.donutLegendItem} flex items-center justify-between text-xs px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                  hoveredDonutSegment === "converted"
                    ? "bg-cyan-950/60 border border-cyan-500/50 scale-[1.02] shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "hover:bg-white/5 border border-transparent"
                }`}
                style={{ animationDelay: "100ms" }}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full bg-[#06b6d4] transition-transform duration-200 ${
                    hoveredDonutSegment === "converted" ? "scale-125 shadow-[0_0_8px_rgba(6,182,212,0.9)]" : ""
                  }`} />
                  <span className="text-slate-300 font-medium text-[11px]">Converted</span>
                </div>
                <span className="text-white font-extrabold text-xs">70%</span>
              </div>

              <div
                onMouseEnter={() => setHoveredDonutSegment("qualified")}
                onMouseLeave={() => setHoveredDonutSegment(null)}
                className={`${chartMotionStyles.donutLegendItem} flex items-center justify-between text-xs px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                  hoveredDonutSegment === "qualified"
                    ? "bg-purple-950/60 border border-purple-500/50 scale-[1.02] shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "hover:bg-white/5 border border-transparent"
                }`}
                style={{ animationDelay: "170ms" }}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full bg-[#a855f7] transition-transform duration-200 ${
                    hoveredDonutSegment === "qualified" ? "scale-125 shadow-[0_0_8px_rgba(168,85,247,0.9)]" : ""
                  }`} />
                  <span className="text-slate-300 font-medium text-[11px]">Qualified</span>
                </div>
                <span className="text-white font-extrabold text-xs">20%</span>
              </div>

              <div
                onMouseEnter={() => setHoveredDonutSegment("raw")}
                onMouseLeave={() => setHoveredDonutSegment(null)}
                className={`${chartMotionStyles.donutLegendItem} flex items-center justify-between text-xs px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                  hoveredDonutSegment === "raw"
                    ? "bg-amber-950/60 border border-amber-500/50 scale-[1.02] shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    : "hover:bg-white/5 border border-transparent"
                }`}
                style={{ animationDelay: "240ms" }}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full bg-[#f59e0b] transition-transform duration-200 ${
                    hoveredDonutSegment === "raw" ? "scale-125 shadow-[0_0_8px_rgba(245,158,11,0.9)]" : ""
                  }`} />
                  <span className="text-slate-300 font-medium text-[11px]">Raw</span>
                </div>
                <span className="text-white font-extrabold text-xs">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Top Callers (This Month) */}
        <div className="lg:col-span-3 p-4 rounded-2xl glass-panel relative overflow-hidden">
          <div className="glass-rim" />
          <div className="silver-corner-shine" />

          {/* Header with Navigation Arrow in Top-Right */}
          <div className="flex items-center justify-between mb-2 relative z-10">
            <h2 className="text-xs font-bold text-white tracking-wide">
              Top Callers (This Month)
            </h2>
            <Link
              href="/team"
              className="text-slate-400 hover:text-cyan-400 transition"
              aria-label="View all callers"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Ranked List of 3 Top Callers */}
          <div className="space-y-2.5 relative z-10">
            {topCallers.map((caller) => (
              <div
                key={caller.name}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1c222b]/80 border border-[#717985]/25 hover:border-[#AEB5BF]/50 hover:bg-[#252b36] transition-all cursor-pointer group shadow-sm"
              >
                {/* Gold, Silver, Bronze Ranking Indicator */}
                <div
                  className={`w-6 h-6 rounded-full bg-gradient-to-b ${caller.badgeGradient} ${caller.textColor} font-black text-[11px] flex items-center justify-center shrink-0 ${caller.badgeShadow}`}
                >
                  {caller.rank}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-[#F0F2F5] transition-colors">
                    {caller.name}
                  </p>
                  <p className="text-[10px] text-[#AEB5BF] truncate leading-tight mt-0.5">
                    {caller.calls} calls &nbsp;|&nbsp; {caller.conversions} conversions
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          4. BOTTOM SECTION: 2 PANELS (Follow-ups Due Today | Recent Calls)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left Panel: Follow-ups Due Today (12) */}
        <div className="p-4 rounded-2xl glass-panel relative overflow-hidden">
          <div className="glass-rim" />
          <div className="silver-corner-shine" />

          {/* Header */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#2d1b4e] border border-purple-500/50 text-purple-300 flex items-center justify-center text-xs">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                Follow-ups Due Today ({stats.followupsDueToday.length > 0 ? stats.followupsDueToday.length : 12})
              </h2>
            </div>
            <Link
              href="/followups"
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition"
            >
              View All →
            </Link>
          </div>

          {/* Follow-up rows: Elegant silver-grey rows with subtle metallic gradients */}
          <div className="space-y-2 relative z-10">
            {followupsList.map((item) => (
              <div
                key={item.company}
                className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-[#242b38]/90 via-[#1d222d]/90 to-[#181d26]/90 border border-[#717985]/30 hover:border-[#AEB5BF]/60 hover:from-[#2a3240] hover:to-[#212732] transition-all flex items-center justify-between gap-3 cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#353d4c] to-[#1c222c] border border-[#717985]/40 flex items-center justify-center shrink-0 text-[#E5E4E2]">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-white truncate">
                    {item.company}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 text-[11px] text-[#AEB5BF]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{item.time}</span>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${item.priorityColor}`}
                  >
                    {item.priority === "High" ? "🔥 High" : item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Recent Calls */}
        <div className="p-4 rounded-2xl glass-panel relative overflow-hidden">
          <div className="glass-rim" />
          <div className="silver-corner-shine" />

          {/* Header */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h2 className="text-xs font-bold text-white tracking-wide">
              Recent Calls
            </h2>
            <Link
              href="/calls"
              className="text-[11px] font-semibold text-[#AEB5BF] hover:text-white transition"
            >
              View All →
            </Link>
          </div>

          {/* Recent call rows: Elegant silver-grey rows with subtle metallic gradients */}
          <div className="space-y-2 relative z-10">
            {recentCallsList.map((item) => (
              <div
                key={item.company}
                className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-[#242b38]/90 via-[#1d222d]/90 to-[#181d26]/90 border border-[#717985]/30 hover:border-[#AEB5BF]/60 hover:from-[#2a3240] hover:to-[#212732] transition-all flex items-center justify-between gap-3 cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#353d4c] to-[#1c222c] border border-[#717985]/40 flex items-center justify-center shrink-0 text-[#E5E4E2]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-white truncate">
                    {item.company}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${item.statusStyle}`}
                  >
                    {item.statusPrefix} {item.status}
                  </span>

                  <span className="text-[11px] text-[#AEB5BF]">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}