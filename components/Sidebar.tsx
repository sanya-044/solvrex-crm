"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  ShieldCheck,
  CheckSquare,
  PhoneCall,
  Phone,
  FileText,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCRM, CALLER_TEAM } from "@/context/CRMContent";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    userRole,
    setUserRole,
    activeCallerName,
    setActiveCallerName,
    stats,
  } = useCRM();

  const [isCollapsed, setIsCollapsed] = useState(false);
  // Use stable static values during SSR; update after mount to avoid hydration mismatch
  const [followupCount, setFollowupCount] = useState<string>("12");
  const [callsTodayBadge, setCallsTodayBadge] = useState<string | null>(null);

  useEffect(() => {
    // Update dynamic badges only on the client after mount
    if (stats.followupsDueToday.length > 0) {
      setFollowupCount(`${stats.followupsDueToday.length}`);
    }
    if (stats.callsToday > 0) {
      setCallsTodayBadge(`${stats.callsToday}`);
    }
  }, [stats.followupsDueToday.length, stats.callsToday]);

  // Combined options from BOTH screenshots (common + individual)
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutGrid,
      badge: null,
    },
    {
      name: "Leads / Contacts",
      href: "/leads",
      icon: Users,
      badge: null,
    },
    {
      name: "Active Call Hub",
      href: "/calls/1",
      icon: Phone,
      badge: "Live Call",
      badgeColor: "bg-[#10B981]/20 text-[#34D399] border-[#10B981]/30",
    },
    {
      name: "Deals",
      href: "/deals",
      icon: ShieldCheck,
      badge: "$145K",
      badgeColor: "bg-[#2563EB]/20 text-[#60A5FA] border-[#2563EB]/30",
    },
    {
      name: "Tasks & Follow-ups",
      href: "/followups",
      icon: CheckSquare,
      badge: followupCount,
      badgeColor: "bg-[#EF4444]/20 text-[#F87171] border-[#EF4444]/30",
    },
    {
      name: "Call Logs & Audio",
      href: "/calls",
      icon: PhoneCall,
      badge: callsTodayBadge,
      badgeColor: "bg-[#06B6D4]/20 text-[#22D3EE] border-[#06B6D4]/30",
    },
    {
      name: "Templates & Scripts",
      href: "/templates",
      icon: FileText,
      badge: "Hindi/Eng",
      badgeColor: "bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/30",
    },
    {
      name: "Reports",
      href: "/analytics",
      icon: BarChart2,
      badge: null,
    },
    {
      name: "Users & Roles",
      href: "/users",
      icon: UserCheck,
      badge: null,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const displayName =
    userRole === "Caller"
      ? activeCallerName
      : user?.fullName || "Alex Morgan";

  const displayRole =
    userRole === "Caller"
      ? "Calling Agent"
      : user?.role || "VP of Enterprise Sales";

  return (
    <aside
      className={`h-screen bg-[#080C14] border-r border-[#151D2E] flex flex-col justify-between shrink-0 select-none transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-xl bg-[#0D1524] border border-[#1E293B] flex items-center justify-center font-black text-sm text-white shrink-0 shadow-sm">
            SX
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-wide">
                  SOLVREX
                </span>
                <span className="text-[9px] font-bold text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/30 rounded px-1.5 py-0.2">
                  ENTERPRISE
                </span>
              </div>
              <div className="flex items-center gap-1 leading-none mt-0.5">
                <span className="text-xs font-black text-[#06B6D4]">CRM</span>
              </div>
              <p className="text-[10px] text-[#64748B] tracking-tight mt-0.5">
                Intelligence Suite
              </p>
            </div>
          )}
        </div>

        {/* Role Switcher & Caller Selector from Screenshot 2 */}
        {!isCollapsed && (
          <div className="rounded-xl bg-[#0D1524] border border-[#1E293B] p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#64748B] font-medium">Active Workspace Role:</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  userRole === "Admin"
                    ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                    : "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                }`}
              >
                {userRole}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setUserRole("Admin")}
                className={`py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  userRole === "Admin"
                    ? "bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black font-bold shadow-sm"
                    : "bg-[#111A2E] text-[#94A3B8] hover:text-white"
                }`}
              >
                Admin View
              </button>
              <button
                type="button"
                onClick={() => setUserRole("Caller")}
                className={`py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  userRole === "Caller"
                    ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-black font-bold shadow-sm"
                    : "bg-[#111A2E] text-[#94A3B8] hover:text-white"
                }`}
              >
                Caller View
              </button>
            </div>

            {/* Caller Profile Selection */}
            <div className="pt-1.5 border-t border-[#1E293B]/70">
              <label className="text-[10px] text-[#64748B] block mb-1">
                {userRole === "Admin" ? "Simulate Caller:" : "Current Caller:"}
              </label>
              <select
                value={activeCallerName}
                onChange={(e) => setActiveCallerName(e.target.value)}
                className="w-full text-xs bg-[#111A2E] border border-[#1E293B] rounded-lg px-2 py-1 text-white outline-none focus:border-[#06B6D4] cursor-pointer"
              >
                {CALLER_TEAM.map((c) => (
                  <option key={c.id} value={c.name} className="bg-[#0D1524]">
                    {c.name} ({c.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Section Title */}
        {!isCollapsed && (
          <p className="text-[10px] font-bold tracking-wider text-[#475569] uppercase px-2 pt-1">
            CORE PLATFORM
          </p>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isDashboard = item.name === "Dashboard";
            const isActive =
              (isDashboard && pathname === "/dashboard") ||
              (!isDashboard &&
                (pathname === item.href ||
                  (item.name === "Leads / Contacts" && (pathname === "/leads" || pathname === "/contacts")) ||
                  (item.name === "Tasks & Follow-ups" && (pathname === "/followups" || pathname === "/tasks")) ||
                  (item.name === "Reports" && (pathname === "/analytics" || pathname === "/reports")) ||
                  (item.name === "Deals" && pathname === "/deals") ||
                  (item.name === "Call Logs & Audio" && pathname === "/calls") ||
                  (item.name === "Users & Roles" && pathname === "/users") ||
                  (item.name === "Settings" && pathname === "/settings")));

            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`relative flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-[#1D4ED8] via-[#2563EB]/85 to-[#1E40AF]/40 text-white font-semibold shadow-md shadow-blue-900/30"
                    : "text-[#94A3B8] hover:bg-[#0E1524] hover:text-white"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Cyan active bar on the very left */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#22D3EE] rounded-r shadow-[0_0_8px_#22D3EE]" />
                  )}

                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? "text-[#22D3EE]" : "text-[#94A3B8] group-hover:text-white"
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                      item.badgeColor || "bg-[#1E293B] text-[#94A3B8] border-[#334155]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls & User Card */}
      <div className="p-3 border-t border-[#151D2E] space-y-2.5">
        {/* Collapse Sidebar Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#0E1524] p-2 text-xs font-medium text-[#94A3B8] hover:text-white hover:border-[#3B82F6]/50 transition cursor-pointer ${
            isCollapsed ? "justify-center" : "px-3"
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>

        {/* User Card */}
        <div
          className={`flex items-center gap-2.5 rounded-xl border border-[#1E293B] bg-[#0E1524] p-2 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#06B6D4] text-black font-extrabold text-xs shadow-sm">
              {displayName.charAt(0)}
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#10B981] ring-1 ring-[#0E1524]" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white leading-tight">
                  {displayName}
                </p>
                <p className="truncate text-[10px] text-[#64748B] leading-tight mt-0.5">
                  {displayRole}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="p-1 rounded text-[#64748B] hover:text-white hover:bg-[#1E293B] transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
