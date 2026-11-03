"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Phone,
  Calendar,
  BarChart3,
  Users,
  Target,
  ChevronRight,
  ChevronDown,
  Clock,
  Building2,
  Crown,
  Flame,
  CheckCircle2,
  User,
  Sliders,
  LogOut,
  X,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Plus,
  ArrowUpDown,
  ArrowDown,
} from "lucide-react";
import { useCRM } from "@/context/CRMContent";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const router = useRouter();
  const { stats, userRole, activeCallerName } = useCRM();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState<"This Month" | "This Week" | "Today" | "All Time">("This Month");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [contactSearch, setContactSearch] = useState("");
  const [contactStatusFilter, setContactStatusFilter] = useState("All Statuses");
  const [showContactStatusDropdown, setShowContactStatusDropdown] = useState(false);

  // Floating cursor tooltip state
  const [cursorTooltip, setCursorTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    value: string;
    subtitle?: string;
    color?: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    title: "",
    value: "",
  });

  const showTooltip = (
    e: React.MouseEvent,
    title: string,
    value: string,
    subtitle?: string,
    color?: string
  ) => {
    setCursorTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      title,
      value,
      subtitle,
      color,
    });
  };

  const moveTooltip = (e: React.MouseEvent) => {
    setCursorTooltip((prev) => (prev.visible ? { ...prev, x: e.clientX, y: e.clientY } : prev));
  };

  const hideTooltip = () => {
    setCursorTooltip((prev) => ({ ...prev, visible: false }));
  };

  const allContacts = [
    { id: 1, name: "Marcus Vance", email: "mvance@apexcloud.com", initials: "M", color: "#6366f1", company: "Apex Cloud Solutions", status: "Won", dealValue: "$72,000", lastContact: "Yesterday, 3:15 PM" },
    { id: 2, name: "Sarah Jenkins", email: "sarah.j@techflow.io", initials: "S", color: "#06b6d4", company: "TechFlow Systems", status: "Won", dealValue: "$48,500", lastContact: "Today, 10:30 AM" },
    { id: 3, name: "Elena Rostova", email: "e.rostova@vanguard.co", initials: "E", color: "#10b981", company: "Vanguard Logistics", status: "Won", dealValue: "$35,400", lastContact: "Oct 30, 2026" },
    { id: 4, name: "David Kim", email: "dkim@acrobaretail.com", initials: "D", color: "#f59e0b", company: "Acroba Retail Group", status: "Won", dealValue: "$18,200", lastContact: "Oct 28, 2026" },
    { id: 5, name: "Priya Mehta", email: "p.mehta@nexishealth.io", initials: "P", color: "#a855f7", company: "Nexis Health Innovations", status: "Qualified", dealValue: "$29,000", lastContact: "Oct 27, 2026" },
    { id: 6, name: "James Okafor", email: "j.okafor@zenithfin.com", initials: "J", color: "#ef4444", company: "Zenith Financials", status: "Prospect", dealValue: "$11,500", lastContact: "Oct 25, 2026" },
    { id: 7, name: "Aisha Torres", email: "a.torres@vanguardlog.co", initials: "A", color: "#f97316", company: "Vanguard Logistics", status: "Contacted", dealValue: "$8,700", lastContact: "Oct 24, 2026" },
    { id: 8, name: "Rohan Desai", email: "r.desai@apexcloud.com", initials: "R", color: "#14b8a6", company: "Apex Cloud Solutions", status: "Won", dealValue: "$55,000", lastContact: "Oct 22, 2026" },
    { id: 9, name: "Lily Chen", email: "l.chen@techflow.io", initials: "L", color: "#8b5cf6", company: "TechFlow Systems", status: "Prospect", dealValue: "$6,400", lastContact: "Oct 20, 2026" },
  ];

  const statusOptions = ["All Statuses", "Won", "Qualified", "Prospect", "Contacted"];

  const filteredContacts = allContacts.filter((c) => {
    const matchesSearch =
      contactSearch === "" ||
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.company.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(contactSearch.toLowerCase());
    const matchesStatus =
      contactStatusFilter === "All Statuses" || c.status === contactStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Dynamic values with the reference screenshot defaults
  const callsTodayCount = stats.callsToday > 0 ? stats.callsToday : 48;
  const callsThisWeekCount = stats.callsThisWeek > 0 ? stats.callsThisWeek : 312;
  const callsThisMonthCount = stats.callsThisMonth > 0 ? stats.callsThisMonth : 1246;
  const connectRateDisplay = stats.connectRate > 0 ? `${stats.connectRate}%` : "64.2%";
  const conversionsDisplay = stats.conversionRate > 0 ? `${Math.round((stats.conversionRate * stats.callsThisMonth) / 100) || 78}` : "78";

  const notifications = [
    { id: 1, title: "High Priority Follow-up", desc: "Apex Cloud Solutions scheduled at 11:00 AM", time: "10m ago" },
    { id: 2, title: "New Deal Won", desc: "Rahul closed an enterprise deal ($45,000)", time: "1h ago" },
    { id: 3, title: "Daily Target Met", desc: "Team reached 300+ connected calls today", time: "3h ago" },
  ];

  const pipelineStages = [
    { name: "New Leads", count: "1,120", color: "#a855f7", desc: "1,120 leads • 47.8% of pipeline", rate: "Initial stage" },
    { name: "Prospecting", count: "642", color: "#f97316", desc: "642 leads • 27.4% of pipeline", rate: "Qualification" },
    { name: "Proposal Sent", count: "321", color: "#06b6d4", desc: "321 leads • 13.7% of pipeline", rate: "Price negotiation" },
    { name: "Won / Closed", count: "189", color: "#10b981", desc: "189 leads • 8.1% of pipeline", rate: "$1.4M ARR closed" },
    { name: "Lost", count: "76", color: "#94a3b8", desc: "76 leads • 3.2% of pipeline", rate: "Disqualified" },
  ];

  const conversionSegments = [
    { label: "Converted", pct: "70%", count: "1,645 leads", color: "#06b6d4", desc: "70% converted • 1,645 paying clients" },
    { label: "Qualified", pct: "20%", count: "470 leads", color: "#a855f7", desc: "20% qualified • 470 SQL demo-ready" },
    { label: "Raw", pct: "10%", count: "235 leads", color: "#f97316", desc: "10% raw • 235 initial registrations" },
  ];

  const topCallersList = [
    { name: "Sarah J.", calls: 499, conv: 62, rate: "12.4%", badge: 1, color: "#eab308", desc: "Rank #1 • 499 calls | 62 conversions (12.4% conv rate)" },
    { name: "Rahul S.", calls: 296, conv: 41, rate: "13.9%", badge: 2, color: "#cbd5e1", desc: "Rank #2 • 296 calls | 41 conversions (13.9% conv rate)" },
    { name: "Priya K.", calls: 276, conv: 37, rate: "13.4%", badge: 3, color: "#f97316", desc: "Rank #3 • 276 calls | 37 conversions (13.4% conv rate)" },
  ];

  const handleSignOut = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-8 select-none">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        {/* Title & Live Status */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Dashboard
            </h1>
            <span className="live-ring inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0e7490]/25 text-[#22d3ee] border border-[#0891b2]/40 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse"></span>
              Live
            </span>
          </div>
          <p className="text-xs text-[#94a3b8] font-medium mt-1">
            Calling & Sales Performance Overview
          </p>
        </div>

        {/* Search, Notifications & User Info */}
        <div className="flex items-center gap-3 relative">
          {/* Global Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads, deals, contacts, reports..."
              className="w-64 sm:w-80 bg-[#0d1527] border border-[#1e293b] rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder:text-[#64748b] focus:outline-none focus:border-[#06b6d4] focus:ring-1 focus:ring-[#06b6d4] transition shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Notifications Button with Red Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileDropdown(false);
              }}
              className="relative p-2 rounded-xl bg-[#0d1527] border border-[#1e293b] text-slate-300 hover:text-white hover:border-[#334155] transition cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ef4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md">
                3
              </span>
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0d1527] border border-[#1e293b] rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-[#1e293b] px-1">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  <span className="text-[10px] text-[#06b6d4] font-semibold cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="divide-y divide-[#1e293b]/50 mt-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2 px-1 hover:bg-[#111c33] rounded-lg transition">
                      <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">{n.desc}</p>
                      <span className="text-[9px] text-[#64748b] mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Capsule with Interactive Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-xl bg-[#0d1527] border border-[#1e293b] hover:border-[#334155] transition cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-full bg-[#06b6d4] text-[#080c14] font-black text-xs flex items-center justify-center shadow-md">
                A
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight">
                  Alex Morgan
                </div>
                <div className="text-[10px] text-[#64748b] leading-tight">
                  VP of Enterprise Sales
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748b] hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-[#0d1527] border border-[#1e293b] rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1.5 border-b border-[#1e293b] mb-1">
                  <p className="text-xs font-bold text-white">Alex Morgan</p>
                  <p className="text-[10px] text-[#64748b]">alex.morgan@solvrex.com</p>
                  <span className="inline-block mt-1 text-[9px] font-semibold text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/30 px-1.5 py-0.2 rounded">
                    VP of Enterprise Sales
                  </span>
                </div>
                <div className="space-y-0.5 text-xs">
                  <Link
                    href="/settings"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#111c33] transition"
                  >
                    <User className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>Profile Settings</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#111c33] transition"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#64748b]" />
                    <span>Workspace Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/30 transition text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Filter Row */}
      <div className="flex justify-end relative z-20">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="flex items-center gap-2 bg-[#0d1527] border border-[#1e293b] hover:border-[#334155] text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
          </button>

          {showTimeDropdown && (
            <div className="absolute right-0 mt-1.5 w-36 bg-[#0d1527] border border-[#1e293b] rounded-xl py-1 shadow-xl z-30">
              {(["Today", "This Week", "This Month", "All Time"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTimeRange(t);
                    setShowTimeDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition cursor-pointer ${
                    timeRange === t
                      ? "text-[#06b6d4] bg-[#111c33] font-semibold"
                      : "text-slate-300 hover:bg-[#111c33] hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Calls Today */}
        <div className="card-enter card-enter-1 bg-[#0b1224] border border-[#3b1d5a]/60 hover:border-[#a855f7]/60 rounded-2xl p-4 shadow-lg hover:shadow-purple-950/20 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#c084fc] tracking-tight">
              Calls Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#581c87]/30 border border-[#a855f7]/30 text-[#c084fc] flex items-center justify-center group-hover:scale-105 transition">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="kpi-number text-3xl font-extrabold text-white tracking-tight">
              {callsTodayCount}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#10b981] mt-1.5">
              <span>↑</span>
              <span>+12%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Calls This Week */}
        <div className="card-enter card-enter-2 bg-[#0b1224] border border-[#1e3a5f]/60 hover:border-[#38bdf8]/60 rounded-2xl p-4 shadow-lg hover:shadow-blue-950/20 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#60a5fa] tracking-tight">
              Calls This Week
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1e3a8a]/30 border border-[#3b82f6]/30 text-[#60a5fa] flex items-center justify-center group-hover:scale-105 transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="kpi-number text-3xl font-extrabold text-white tracking-tight">
              {callsThisWeekCount}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#10b981] mt-1.5">
              <span>↑</span>
              <span>+18%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Calls This Month */}
        <div className="card-enter card-enter-3 bg-[#0b1224] border border-[#0e4e68]/60 hover:border-[#06b6d4]/60 rounded-2xl p-4 shadow-lg hover:shadow-cyan-950/20 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#38bdf8] tracking-tight">
              Calls This Month
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#0c4a6e]/30 border border-[#0ea5e9]/30 text-[#38bdf8] flex items-center justify-center group-hover:scale-105 transition">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="kpi-number text-3xl font-extrabold text-white tracking-tight">
              {callsThisMonthCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#10b981] mt-1.5">
              <span>↑</span>
              <span>+21%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Connect Rate */}
        <div className="card-enter card-enter-4 bg-[#0b1224] border border-[#064e3b]/60 hover:border-[#10b981]/60 rounded-2xl p-4 shadow-lg hover:shadow-emerald-950/20 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#34d399] tracking-tight">
              Connect Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#064e3b]/40 border border-[#10b981]/30 text-[#34d399] flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="kpi-number text-3xl font-extrabold text-white tracking-tight">
              {connectRateDisplay}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#10b981] mt-1.5">
              <span>↑</span>
              <span>+5.8%</span>
            </div>
          </div>
        </div>

        {/* Card 5: Conversions */}
        <div className="card-enter card-enter-5 bg-[#0b1224] border border-[#4a044e]/60 hover:border-[#d946ef]/60 rounded-2xl p-4 shadow-lg hover:shadow-fuchsia-950/20 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#f472b6] tracking-tight">
              Conversions
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#701a75]/30 border border-[#d946ef]/30 text-[#f472b6] flex items-center justify-center group-hover:scale-105 transition">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="kpi-number text-3xl font-extrabold text-white tracking-tight">
              {conversionsDisplay}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#10b981] mt-1.5">
              <span>↑</span>
              <span>+14%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: 3 Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 1. Pipeline by Stage (5 cols) */}
        <div className="lg:col-span-5 bg-[#0b1224] border border-[#1e293b] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight mb-4">
            Pipeline by Stage
          </h2>

          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Funnel SVG Illustration */}
            <div className="col-span-5 flex flex-col items-center justify-center py-1">
              <svg
                viewBox="0 0 160 145"
                className="w-full max-w-[130px] filter drop-shadow-md"
              >
                {/* Stage 1: New Leads (Purple) */}
                <polygon
                  points="10,5 150,5 133,29 27,29"
                  fill="#a855f7"
                  className={`funnel-layer transition-all duration-150 cursor-pointer ${
                    hoveredStage === "New Leads" ? "brightness-125 scale-[1.02]" : "hover:brightness-110"
                  }`}
                  onMouseEnter={(e) => {
                    setHoveredStage("New Leads");
                    showTooltip(e, "New Leads", "1,120 leads", "47.8% of total pipeline volume", "#a855f7");
                  }}
                  onMouseMove={moveTooltip}
                  onMouseLeave={() => {
                    setHoveredStage(null);
                    hideTooltip();
                  }}
                />
                {/* Stage 2: Prospecting (Blue) */}
                <polygon
                  points="28,32 132,32 116,56 44,56"
                  fill="#3b82f6"
                  className={`funnel-layer transition-all duration-150 cursor-pointer ${
                    hoveredStage === "Prospecting" ? "brightness-125 scale-[1.02]" : "hover:brightness-110"
                  }`}
                  onMouseEnter={(e) => {
                    setHoveredStage("Prospecting");
                    showTooltip(e, "Prospecting", "642 contacts", "27.4% in discovery & qualification", "#3b82f6");
                  }}
                  onMouseMove={moveTooltip}
                  onMouseLeave={() => {
                    setHoveredStage(null);
                    hideTooltip();
                  }}
                />
                {/* Stage 3: Proposal Sent (Cyan) */}
                <polygon
                  points="45,59 115,59 101,83 59,83"
                  fill="#06b6d4"
                  className={`funnel-layer transition-all duration-150 cursor-pointer ${
                    hoveredStage === "Proposal Sent" ? "brightness-125 scale-[1.02]" : "hover:brightness-110"
                  }`}
                  onMouseEnter={(e) => {
                    setHoveredStage("Proposal Sent");
                    showTooltip(e, "Proposal Sent", "321 proposals", "13.7% price quotes & review", "#06b6d4");
                  }}
                  onMouseMove={moveTooltip}
                  onMouseLeave={() => {
                    setHoveredStage(null);
                    hideTooltip();
                  }}
                />
                {/* Stage 4: Won / Closed (Green) */}
                <polygon
                  points="60,86 100,86 89,110 71,110"
                  fill="#10b981"
                  className={`funnel-layer transition-all duration-150 cursor-pointer ${
                    hoveredStage === "Won / Closed" ? "brightness-125 scale-[1.02]" : "hover:brightness-110"
                  }`}
                  onMouseEnter={(e) => {
                    setHoveredStage("Won / Closed");
                    showTooltip(e, "Won / Closed", "189 deals", "8.1% closed won ($1.4M ARR)", "#10b981");
                  }}
                  onMouseMove={moveTooltip}
                  onMouseLeave={() => {
                    setHoveredStage(null);
                    hideTooltip();
                  }}
                />
                {/* Stage 5: Lost (Mint/Soft Teal) */}
                <path
                  d="M72,113 L88,113 Q80,140 72,113 Z"
                  fill="#6ee7b7"
                  className={`funnel-layer transition-all duration-150 cursor-pointer ${
                    hoveredStage === "Lost" ? "brightness-125 scale-[1.02]" : "hover:brightness-110"
                  }`}
                  onMouseEnter={(e) => {
                    setHoveredStage("Lost");
                    showTooltip(e, "Lost", "76 lost", "3.2% postponed or disqualified", "#6ee7b7");
                  }}
                  onMouseMove={moveTooltip}
                  onMouseLeave={() => {
                    setHoveredStage(null);
                    hideTooltip();
                  }}
                />
              </svg>
            </div>

            {/* Stages & Metrics List */}
            <div className="col-span-7 space-y-2.5 pl-1">
              {pipelineStages.map((stage) => (
                <div
                  key={stage.name}
                  onMouseEnter={(e) => {
                    setHoveredStage(stage.name);
                    showTooltip(e, stage.name, `${stage.count} leads`, stage.desc, stage.color);
                  }}
                  onMouseMove={moveTooltip}
                  onMouseLeave={() => {
                    setHoveredStage(null);
                    hideTooltip();
                  }}
                  className={`stage-row flex items-center justify-between text-xs font-medium p-1 rounded-lg transition-colors cursor-pointer ${
                    hoveredStage === stage.name ? "bg-[#111c33]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: stage.color }}
                    ></span>
                    <span className="text-slate-300">{stage.name}</span>
                  </div>
                  <span className="font-bold text-white">{stage.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Lead Conversion (4 cols) */}
        <div className="lg:col-span-4 bg-[#0b1224] border border-[#1e293b] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight mb-2">
            Lead Conversion
          </h2>

          <div className="grid grid-cols-12 gap-2 items-center my-auto">
            {/* Donut Chart SVG */}
            <div className="col-span-7 flex items-center justify-center relative">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  fill="transparent"
                  stroke="#151e33"
                  strokeWidth="16"
                />

                {/* 10% Raw (Orange) */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  fill="transparent"
                  stroke="#f97316"
                  strokeWidth="16"
                  strokeDasharray="364.4"
                  strokeDashoffset="0"
                  className="donut-arc donut-arc-orange cursor-pointer hover:opacity-85 transition-opacity"
                  onMouseEnter={(e) => showTooltip(e, "Raw Leads", "10%", "235 raw contacts • Unverified inquiries", "#f97316")}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip}
                />

                {/* 20% Qualified (Purple) */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  fill="transparent"
                  stroke="#a855f7"
                  strokeWidth="16"
                  strokeDasharray="364.4"
                  strokeDashoffset="36.4"
                  className="donut-arc donut-arc-purple cursor-pointer hover:opacity-85 transition-opacity"
                  onMouseEnter={(e) => showTooltip(e, "Qualified Leads", "20%", "470 sales qualified • Ready for demo", "#a855f7")}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip}
                />

                {/* 70% Converted (Cyan) */}
                <circle
                  cx="80"
                  cy="80"
                  r="58"
                  fill="transparent"
                  stroke="#06b6d4"
                  strokeWidth="16"
                  strokeDasharray="364.4"
                  strokeDashoffset="109.3"
                  className="donut-arc donut-arc-cyan cursor-pointer hover:opacity-85 transition-opacity"
                  onMouseEnter={(e) => showTooltip(e, "Converted Leads", "70%", "1,645 leads won • Successfully closed", "#06b6d4")}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip}
                />
              </svg>

              {/* Centered Donut Label */}
              <div
                className="donut-center absolute inset-0 flex flex-col items-center justify-center text-center cursor-pointer"
                onMouseEnter={(e) => showTooltip(e, "Overall Conversion", "70%", "1,645 of 2,350 total leads won", "#06b6d4")}
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
              >
                <span className="text-2xl font-black text-white leading-tight">
                  70%
                </span>
                <span className="text-[11px] text-[#94a3b8] font-medium leading-none">
                  Converted
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="col-span-5 space-y-3 pl-1">
              {conversionSegments.map((item) => (
                <div
                  key={item.label}
                  className="legend-row flex items-center justify-between text-xs p-1 rounded-lg hover:bg-[#111c33] transition cursor-pointer"
                  onMouseEnter={(e) => showTooltip(e, item.label, item.pct, item.desc, item.color)}
                  onMouseMove={moveTooltip}
                  onMouseLeave={hideTooltip}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-slate-300 font-medium">{item.label}</span>
                  </div>
                  <span className="font-bold text-white">{item.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Top Callers (This Month) (3 cols) */}
        <div className="lg:col-span-3 bg-[#0b1224] border border-[#1e293b] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Top Callers <span className="text-xs font-normal text-[#64748b]">(This Month)</span>
            </h2>
            <Link href="/analytics">
              <ChevronRight className="w-4 h-4 text-[#64748b] hover:text-white transition" />
            </Link>
          </div>

          <div className="space-y-3.5 my-auto">
            {topCallersList.map((caller) => (
              <div
                key={caller.name}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#111c33] transition cursor-pointer"
                onMouseEnter={(e) => showTooltip(e, caller.name, `${caller.calls} calls`, caller.desc, caller.color)}
                onMouseMove={moveTooltip}
                onMouseLeave={hideTooltip}
              >
                <div
                  className={`rank-badge rank-badge-${caller.badge} w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm font-bold text-xs`}
                  style={{
                    backgroundColor: `${caller.color}20`,
                    borderColor: `${caller.color}50`,
                    borderWidth: 1,
                    color: caller.color,
                  }}
                >
                  {caller.badge === 1 || caller.badge === 3 ? (
                    <Crown className="w-4 h-4 fill-current" />
                  ) : (
                    caller.badge
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white">{caller.name}</div>
                  <div className="text-[10px] text-[#94a3b8]">
                    {caller.calls} calls <span className="text-[#64748b]">|</span> {caller.conv} conversions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: 2 Wide Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Follow-ups Due Today (12) */}
        <div className="bg-[#0b1224] border border-[#1e293b] rounded-2xl p-5 shadow-lg space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#c084fc]" />
              <h2 className="text-sm font-bold text-white tracking-tight">
                Follow-ups Due Today (12)
              </h2>
            </div>
            <Link
              href="/followups"
              className="text-xs font-semibold text-[#06b6d4] hover:text-[#22d3ee] transition flex items-center gap-1"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          <div className="space-y-2.5">
            {/* Follow-up 1: Apex Cloud Solutions */}
            <div className="p-3 rounded-xl bg-[#090f1d] border border-[#17233d] flex items-center justify-between gap-3 hover:border-[#1e293b] transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#111a2e] border border-[#1e293b] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-[#94a3b8]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    Apex Cloud Solutions
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#94a3b8] mt-0.5">
                    <Clock className="w-3 h-3 text-[#64748b]" />
                    <span>11:00 AM</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#450a0a]/60 text-[#f87171] border border-[#ef4444]/40 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" />
                  High
                </span>
              </div>
            </div>

            {/* Follow-up 2: Vanguard Logistics */}
            <div className="p-3 rounded-xl bg-[#090f1d] border border-[#17233d] flex items-center justify-between gap-3 hover:border-[#1e293b] transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#111a2e] border border-[#1e293b] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-[#94a3b8]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    Vanguard Logistics
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#94a3b8] mt-0.5">
                    <Clock className="w-3 h-3 text-[#64748b]" />
                    <span>2:30 PM</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#451a03]/60 text-[#fbbf24] border border-[#f59e0b]/40">
                  Medium
                </span>
              </div>
            </div>

            {/* Follow-up 3: Nexis Health Innovations */}
            <div className="p-3 rounded-xl bg-[#090f1d] border border-[#17233d] flex items-center justify-between gap-3 hover:border-[#1e293b] transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#111a2e] border border-[#1e293b] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-[#94a3b8]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    Nexis Health Innovations
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#94a3b8] mt-0.5">
                    <Clock className="w-3 h-3 text-[#64748b]" />
                    <span>4:00 PM</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#450a0a]/60 text-[#f87171] border border-[#ef4444]/40 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" />
                  High
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Calls */}
        <div className="bg-[#0b1224] border border-[#1e293b] rounded-2xl p-5 shadow-lg space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Recent Calls
            </h2>
            <Link
              href="/calls"
              className="text-xs font-semibold text-[#06b6d4] hover:text-[#22d3ee] transition flex items-center gap-1"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          <div className="space-y-2.5">
            {/* Call 1: TechFlow Systems */}
            <div className="p-3 rounded-xl bg-[#090f1d] border border-[#17233d] flex items-center justify-between gap-3 hover:border-[#1e293b] transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#111a2e] border border-[#1e293b] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#94a3b8]" />
                </div>
                <span className="text-xs font-bold text-white truncate">
                  TechFlow Systems
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#064e3b]/50 text-[#34d399] border border-[#10b981]/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 fill-current" />
                  Interested
                </span>
                <span className="text-xs text-[#94a3b8]">10:30 AM</span>
              </div>
            </div>

            {/* Call 2: Acroba Retail Group */}
            <div className="p-3 rounded-xl bg-[#090f1d] border border-[#17233d] flex items-center justify-between gap-3 hover:border-[#1e293b] transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#111a2e] border border-[#1e293b] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#94a3b8]" />
                </div>
                <span className="text-xs font-bold text-white truncate">
                  Acroba Retail Group
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#451a03]/50 text-[#fbbf24] border border-[#f59e0b]/40">
                  Call Back
                </span>
                <span className="text-xs text-[#94a3b8]">09:45 AM</span>
              </div>
            </div>

            {/* Call 3: Zenith Financials */}
            <div className="p-3 rounded-xl bg-[#090f1d] border border-[#17233d] flex items-center justify-between gap-3 hover:border-[#1e293b] transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#111a2e] border border-[#1e293b] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#94a3b8]" />
                </div>
                <span className="text-xs font-bold text-white truncate">
                  Zenith Financials
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#1e293b]/60 text-[#94a3b8] border border-[#334155]">
                  Not Interested
                </span>
                <span className="text-xs text-[#94a3b8]">09:10 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Contacts & Opportunities Table */}
      <div className="bg-[#0b1224] border border-[#1e293b] rounded-2xl shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="p-5 border-b border-[#1e293b]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Recent Contacts & Opportunities
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0d1527] border border-[#1e293b] text-[#06b6d4]">
                  {filteredContacts.length} total
                </span>
              </div>
              <p className="text-[11px] text-[#64748b] mt-0.5">
                Manage live enterprise prospect accounts, valuations, and status transitions
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="w-3 h-3 text-[#64748b] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-44 bg-[#0d1527] border border-[#1e293b] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-[#64748b] focus:outline-none focus:border-[#06b6d4] transition"
                />
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowContactStatusDropdown(!showContactStatusDropdown)}
                  className="flex items-center gap-1.5 bg-[#0d1527] border border-[#1e293b] hover:border-[#334155] text-slate-300 text-xs px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Filter className="w-3 h-3 text-[#64748b]" />
                  <span>{contactStatusFilter}</span>
                  <ChevronDown className="w-3 h-3 text-[#64748b]" />
                </button>
                {showContactStatusDropdown && (
                  <div className="absolute right-0 mt-1 w-36 bg-[#0d1527] border border-[#1e293b] rounded-xl py-1 shadow-xl z-30">
                    {statusOptions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setContactStatusFilter(s);
                          setShowContactStatusDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition cursor-pointer ${
                          contactStatusFilter === s
                            ? "text-[#06b6d4] bg-[#111c33] font-semibold"
                            : "text-slate-300 hover:bg-[#111c33] hover:text-white"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Contact Button */}
              <Link
                href="/contacts"
                className="flex items-center gap-1.5 bg-[#06b6d4] hover:bg-[#22d3ee] text-[#080c14] font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-md shadow-cyan-900/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#090f1d]">
                <th className="text-left px-5 py-3 text-[#64748b] font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition">
                    <span>Contact Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-[#64748b] font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition">
                    <span>Company</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-[#64748b] font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-[#64748b] font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition">
                    <span>Deal Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-[#64748b] font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition">
                    <span>Last Contact</span>
                    <ArrowDown className="w-3 h-3 text-[#06b6d4]" />
                  </div>
                </th>
                <th className="text-right px-5 py-3 text-[#64748b] font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60">
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-[#0d1527] transition-colors group"
                >
                  {/* Contact Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
                        style={{ backgroundColor: contact.color }}
                      >
                        {contact.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-[#22d3ee] transition-colors">
                          {contact.name}
                        </div>
                        <div className="text-[10px] text-[#64748b] mt-0.5">{contact.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                      <span>{contact.company}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        contact.status === "Won"
                          ? "bg-[#064e3b]/40 text-[#34d399] border-[#10b981]/30"
                          : contact.status === "Qualified"
                          ? "bg-[#1e3a8a]/40 text-[#60a5fa] border-[#3b82f6]/30"
                          : contact.status === "Contacted"
                          ? "bg-[#451a03]/40 text-[#fbbf24] border-[#f59e0b]/30"
                          : "bg-[#1e293b]/60 text-[#94a3b8] border-[#334155]"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {contact.status}
                    </span>
                  </td>

                  {/* Deal Value */}
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-[#06b6d4]">{contact.dealValue}</span>
                  </td>

                  {/* Last Contact */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                      <span>{contact.lastContact}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        title="View"
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#06b6d4] hover:bg-[#0d1527] transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Edit"
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#a855f7] hover:bg-[#0d1527] transition cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#f87171] hover:bg-[#0d1527] transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#64748b] text-xs">
                    No contacts match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Cursor Floating Tooltip */}
      {cursorTooltip.visible && (
        <div
          className="fixed pointer-events-none z-[9999] px-3 py-2 rounded-xl bg-[#080d1a]/95 backdrop-blur-md border border-[#1e293b] shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-xs -translate-x-1/2 -translate-y-full transition-all duration-75 ease-out"
          style={{
            left: `${cursorTooltip.x}px`,
            top: `${cursorTooltip.y - 12}px`,
          }}
        >
          <div className="flex items-center gap-2">
            {cursorTooltip.color && (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: cursorTooltip.color, color: cursorTooltip.color }}
              />
            )}
            <span className="font-bold text-white whitespace-nowrap">
              {cursorTooltip.title}
            </span>
            <span className="font-extrabold text-[#22d3ee] whitespace-nowrap">
              {cursorTooltip.value}
            </span>
          </div>
          {cursorTooltip.subtitle && (
            <div className="text-[10px] text-[#94a3b8] mt-0.5 whitespace-nowrap">
              {cursorTooltip.subtitle}
            </div>
          )}
          {/* Tooltip arrow pointer */}
          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-[#080d1a] border-r border-b border-[#1e293b] rotate-45" />
        </div>
      )}
    </div>
  );
}
