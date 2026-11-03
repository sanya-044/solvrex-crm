"use client";

import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Mail,
  MoreVertical,
  CheckCircle2,
  Lock,
  Headphones,
  Crown,
} from "lucide-react";
import { CALLER_TEAM, useCRM } from "@/context/CRMContent";

export default function UsersAndRolesPage() {
  const { userRole, setUserRole, activeCallerName, setActiveCallerName } = useCRM();
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"All" | "Admin" | "Caller" | "Manager">("All");

  const rolesList = [
    {
      name: "Admin",
      description: "Full workspace control, user management, call monitoring, billing, and system settings.",
      icon: Crown,
      color: "#f59e0b",
      count: CALLER_TEAM.filter((c) => c.role === "Admin").length || 1,
    },
    {
      name: "Manager",
      description: "Access to all team pipelines, analytics, leaderboards, and audio call reviews.",
      icon: ShieldCheck,
      color: "#3b82f6",
      count: CALLER_TEAM.filter((c) => c.role === "Manager").length,
    },
    {
      name: "Caller",
      description: "Dedicated calling queue, lead dialer, notes, follow-up scheduler, and script templates.",
      icon: Headphones,
      color: "#10b981",
      count: CALLER_TEAM.filter((c) => c.role === "Caller").length,
    },
  ];

  const filteredTeam = CALLER_TEAM.filter((member) => {
    if (selectedRoleFilter === "All") return true;
    return member.role === selectedRoleFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Users &amp; Roles
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0e7490]/20 text-[#22d3ee] border border-[#0891b2]/40">
              {CALLER_TEAM.length} Members
            </span>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Manage workspace teammates, dialer seats, and role-based permissions.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 bg-[#06b6d4] hover:bg-[#22d3ee] text-[#080c14] font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-lg shadow-cyan-950/30 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rolesList.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.name}
              className="bg-[#0b1224] border border-[#1e293b] rounded-2xl p-4 shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: `${r.color}20`,
                    borderColor: `${r.color}40`,
                    color: r.color,
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white bg-[#111c33] border border-[#1e293b] px-2 py-0.5 rounded-lg">
                  {r.count} Assigned
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-white">{r.name}</h3>
                <p className="text-[11px] text-[#94a3b8] mt-1 leading-relaxed">
                  {r.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Members Table */}
      <div className="bg-[#0b1224] border border-[#1e293b] rounded-2xl shadow-lg overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#06b6d4]" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Active Workspace Members
            </h2>
          </div>

          <div className="flex items-center gap-1.5 bg-[#090f1d] border border-[#1e293b] p-1 rounded-xl">
            {(["All", "Admin", "Manager", "Caller"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedRoleFilter(filter)}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition cursor-pointer ${
                  selectedRoleFilter === filter
                    ? "bg-[#06b6d4] text-[#080c14]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#090f1d] text-[#64748b]">
                <th className="text-left px-5 py-3 font-semibold uppercase tracking-wider">
                  Member
                </th>
                <th className="text-left px-4 py-3 font-semibold uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold uppercase tracking-wider">
                  Seat Access
                </th>
                <th className="text-right px-5 py-3 font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60">
              {filteredTeam.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-[#0d1527] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#111c33] border border-[#1e293b] text-[#22d3ee] font-bold text-xs flex items-center justify-center shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {member.name}
                        </div>
                        <div className="text-[10px] text-[#64748b] flex items-center gap-1 mt-0.5">
                          <Mail className="w-2.5 h-2.5" />
                          <span>{member.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        member.role === "Admin"
                          ? "bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/40"
                          : member.role === "Manager"
                          ? "bg-[#3b82f6]/20 text-[#60a5fa] border-[#3b82f6]/40"
                          : "bg-[#10b981]/20 text-[#34d399] border-[#10b981]/40"
                      }`}
                    >
                      {member.role === "Admin" && <Crown className="w-2.5 h-2.5" />}
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    <span className="text-[11px]">
                      {member.role === "Caller" ? "Direct Dialer + CRM" : "Full Enterprise Seat"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-[#111c33] transition cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
