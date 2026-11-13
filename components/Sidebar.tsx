"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCRM, CALLER_TEAM } from "@/context/CRMContent";

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { userRole, setUserRole, activeCallerName, setActiveCallerName, teamMembers } = useCRM();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const callerList = useMemo(() => {
    const list: { name: string; role: string }[] = [];
    if (teamMembers && teamMembers.length > 0) {
      teamMembers.forEach((t) => list.push({ name: t.fullName, role: t.role }));
    }
    CALLER_TEAM.forEach((c) => {
      if (!list.some((l) => l.name === c.name)) {
        list.push({ name: c.name, role: c.role });
      }
    });
    return list;
  }, [teamMembers]);

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
        </svg>
      ),
      exact: true,
    },
    {
      name: "Leads / Contacts",
      href: "/leads",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: "Active Call Logs",
      href: "/calls/1",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Tasks & Follow-ups",
      href: "/followups",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      name: "Call Logs & Audio",
      href: "/calls",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      name: "Templates",
      href: "/templates",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp Console",
      href: "/whatsapp",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      name: "Team & Callers",
      href: "/team",
      icon: (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-50 ${
        isCollapsed ? "w-16" : "w-[208px]"
      } md:rounded-[24px] bg-gradient-to-b from-[#343e4f]/98 via-[#252d3a]/98 to-[#181d26]/98 backdrop-blur-2xl border border-[#AEB5BF]/50 border-t-[#ffffff]/80 flex flex-col justify-between shrink-0 select-none transition-all duration-300 ease-in-out shadow-[0_0_35px_rgba(0,0,0,0.85),inset_0_1.5px_2px_rgba(255,255,255,0.35)] relative overflow-hidden ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
      }`}
    >
      {/* Specular Chrome & Silver Top Rim */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent filter drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]" />

      {/* Diagonal Brushed Silver & Platinum Specular Light Reflection */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10)_0%,transparent_30%,rgba(192,192,192,0.06)_50%,rgba(255,255,255,0.14)_60%,transparent_75%)]" />

      {/* Subtle Titanium Ambient Sheen */}
      <div className="pointer-events-none absolute -bottom-10 -right-10 w-36 h-36 bg-[#AEB5BF]/15 rounded-full blur-2xl" />

      {/* Top Header / Logo */}
      <div className="p-3.5 relative z-10">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* SX Badge in Polished Titanium & Chrome Trim */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3b4352] via-[#2a303c] to-[#181c24] border border-[#AEB5BF]/50 flex items-center justify-center text-[#F0F2F5] font-extrabold text-sm tracking-tighter shadow-[0_0_12px_rgba(192,192,192,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)] shrink-0">
              SX
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-black text-white text-xs tracking-wide">SOLVREX</span>
                  <span className="font-black text-[#C0C0C0] text-xs tracking-wide">CRM</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] text-[#AEB5BF] font-bold tracking-tight block">
                    FollowUp Caller Hub
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <span className="text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#292E36] border border-[#AEB5BF]/40 text-[#E5E4E2] shadow-[0_0_8px_rgba(174,181,191,0.2)] shrink-0 uppercase">
              ENTERPRISE
            </span>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Active Workspace Role & Caller Simulation Card (Brushed Titanium & Chrome Finish) */}
        {!isCollapsed && (
          <div className="mt-3 p-2.5 rounded-2xl bg-[#1c222b]/95 border border-[#717985]/40 shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_1.5px_rgba(240,242,245,0.20)] backdrop-blur-xl relative overflow-hidden">
            <div className="glass-rim" />
            <div className="silver-corner-shine" />

            {/* Header: Label + Active Role Badge */}
            <div className="flex items-center justify-between gap-1 mb-2 relative z-10">
              <span className="text-[10px] text-slate-300 font-semibold tracking-tight">
                Active Workspace Role:
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border shadow-sm ${
                  userRole === "Admin"
                    ? "bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                    : "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                }`}
              >
                {userRole}
              </span>
            </div>

            {/* Admin View / Caller View Toggle Buttons */}
            <div className="grid grid-cols-2 gap-1.5 relative z-10">
              <button
                type="button"
                onClick={() => setUserRole("Admin")}
                className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 text-center ${
                  userRole === "Admin"
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-300/60"
                    : "bg-[#292E36] text-slate-300 hover:text-white hover:bg-[#343b46] border border-[#717985]/30"
                }`}
              >
                Admin View
              </button>
              <button
                type="button"
                onClick={() => setUserRole("Caller")}
                className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 text-center ${
                  userRole === "Caller"
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)] border border-cyan-300/60"
                    : "bg-[#292E36] text-slate-300 hover:text-white hover:bg-[#343b46] border border-[#717985]/30"
                }`}
              >
                Caller View
              </button>
            </div>

            {/* Simulate Caller Dropdown */}
            <div className="mt-2.5 pt-2 border-t border-[#717985]/30 relative z-10">
              <label className="text-[9px] text-[#AEB5BF] font-semibold block mb-1">
                {userRole === "Admin" ? "Simulate Caller:" : "Current Caller:"}
              </label>
              <div className="relative">
                <select
                  value={activeCallerName}
                  onChange={(e) => setActiveCallerName(e.target.value)}
                  className="w-full text-[10px] bg-[#12151b] border border-[#717985]/40 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-[#C0C0C0] focus:ring-1 focus:ring-[#C0C0C0]/30 shadow-inner cursor-pointer font-medium appearance-none pr-5"
                >
                  {callerList.map((c) => (
                    <option key={c.name} value={c.name} className="bg-[#1c222b] text-slate-200">
                      {c.name} ({c.role})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Heading */}
        {!isCollapsed ? (
          <div className="pt-3.5 pb-1 px-1 text-[9px] font-bold tracking-wider text-[#AEB5BF] uppercase">
            CORE PLATFORM
          </div>
        ) : (
          <div className="h-4" />
        )}

        {/* Navigation Items */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.name === "Dashboard"
                ? pathname === "/dashboard"
                : item.name === "Active Call Logs"
                ? pathname.startsWith("/calls/") && pathname !== "/calls"
                : item.name === "Call Logs & Audio"
                ? pathname === "/calls"
                : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center ${
                  isCollapsed ? "justify-center px-0" : "px-2.5"
                } py-2 rounded-xl text-xs font-semibold transition-all duration-150 relative ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-bold shadow-[0_0_16px_rgba(6,182,212,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.35)] border border-cyan-300/40"
                    : "text-slate-300 hover:text-white hover:bg-[#292E36]/60 hover:border-[#717985]/30 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200 transition-colors"}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate text-[11px]">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 relative z-10 border-t border-[#717985]/30">
        {/* Collapse Sidebar Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center px-0" : "justify-center gap-2 px-2.5"
          } py-1.5 rounded-lg text-[11px] font-medium text-slate-300 bg-[#1c222b]/90 border border-[#717985]/35 hover:border-[#AEB5BF]/60 hover:text-white transition shadow-sm mb-2`}
        >
          <svg
            className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          {!isCollapsed && <span>Collapse Sidebar</span>}
        </button>

        {/* User Profile Card */}
        <div className="p-2 rounded-xl bg-[#1c222b]/95 border border-[#717985]/35 flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3b4352] to-[#1e232b] border border-[#AEB5BF]/60 flex items-center justify-center text-[#F0F2F5] font-black text-xs shadow-[0_0_8px_rgba(174,181,191,0.3)] shrink-0">
              A
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.fullName || "Alex Morgan"}
                </p>
                <p className="text-[9px] text-[#AEB5BF] truncate leading-tight mt-0.5">
                  VP of Enterprise Sales
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition shrink-0"
              aria-label="Sign out"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}