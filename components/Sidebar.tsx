"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
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
  const {
    userRole,
    setUserRole,
    activeCallerName,
    setActiveCallerName,
    teamMembers,
    stats,
  } = useCRM();

  const callerList = useMemo(() => {
    const list: { name: string; role: string }[] = [];
    teamMembers.forEach((t) => list.push({ name: t.fullName, role: t.role }));
    CALLER_TEAM.forEach((c) => {
      if (!list.some((item) => item.name.toLowerCase() === c.name.toLowerCase())) {
        list.push({ name: c.name, role: c.role });
      }
    });
    return list;
  }, [teamMembers]);

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "📊",
      badge: null,
    },
    {
      name: "Leads Directory",
      href: "/leads",
      icon: "👥",
      badge: null,
    },
    {
      name: "Active Call Hub",
      href: "/calls/1",
      icon: "📞",
      badge: "Live Call",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      name: "Call Logs & Audio",
      href: "/calls",
      icon: "🎧",
      badge: stats.callsToday > 0 ? `${stats.callsToday} today` : null,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      name: "WhatsApp Console",
      href: "/whatsapp",
      icon: "💬",
      badge: "Meta API",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      name: "Follow-ups Due",
      href: "/followups",
      icon: "📅",
      badge:
        stats.followupsDueToday.length > 0
          ? `${stats.followupsDueToday.length}`
          : stats.followupsOverdue?.length > 0
          ? `${stats.followupsOverdue.length} overdue`
          : null,
      badgeColor:
        stats.followupsOverdue?.length > 0
          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
          : "bg-red-500/20 text-red-300 border-red-500/30",
    },
    {
      name: "Templates & Scripts",
      href: "/templates",
      icon: "💬",
      badge: "Hindi/Eng",
      badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    },
    {
      name: "Team & Callers",
      href: "/team",
      icon: "👥",
      badge: teamMembers.length > 0 ? `${teamMembers.length}` : "Admin",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
  ];

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between shrink-0 select-none transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="overflow-y-auto">
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-black font-black text-lg shadow-md shadow-amber-500/20">
              S
            </div>
            <div>
              <span className="text-base font-extrabold tracking-wide text-white block">
                SOLVREX CRM
              </span>
              <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                FollowUp Caller Hub
              </span>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="md:hidden text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Interactive Role & Caller Switcher */}
        <div className="m-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 font-medium">Active Workspace Role:</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                userRole === "Admin"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {userRole}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setUserRole("Admin")}
              className={`py-1 text-xs font-semibold rounded transition ${
                userRole === "Admin"
                  ? "bg-amber-400 text-black shadow"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              Admin View
            </button>
            <button
              type="button"
              onClick={() => setUserRole("Caller")}
              className={`py-1 text-xs font-semibold rounded transition ${
                userRole === "Caller"
                  ? "bg-emerald-400 text-black shadow"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              Caller View
            </button>
          </div>

          {/* Caller Profile Selection */}
          <div className="pt-1.5 border-t border-zinc-800/80">
            <label className="text-[10px] text-zinc-400 block mb-1">
              {userRole === "Admin" ? "Simulate Caller:" : "Current Caller:"}
            </label>
            <select
              value={activeCallerName}
              onChange={(e) => setActiveCallerName(e.target.value)}
              className="w-full text-xs bg-zinc-900 border border-zinc-700/80 rounded px-2 py-1 text-zinc-200 outline-none focus:border-amber-400"
            >
              {callerList.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/calls/1" && pathname.startsWith("/calls/"));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-amber-400/10 text-amber-300 border border-amber-500/30 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-amber-300 border border-zinc-600">
              {activeCallerName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {activeCallerName}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">
                {user?.email || "admin@solvrex.com"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace("/");
          }}
          className="w-full mt-1 rounded-lg px-2.5 py-1.5 text-center text-xs font-medium text-red-400 bg-red-950/20 border border-red-900/30 hover:bg-red-900/40 hover:text-red-200 transition"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
