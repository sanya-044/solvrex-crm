"use client";

import { useState } from "react";
import { useCRM } from "@/context/CRMContent";

export default function TeamManagementPage() {
  const { teamMembers, refreshTeam, userRole, activeCallerName } = useCRM();

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [roleName, setRoleName] = useState("CALLER");

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phone,
          roleName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create team member");
      }

      setSuccessMsg(`Team member ${fullName} created successfully!`);
      // Reset form
      setFullName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setRoleName("CALLER");

      await refreshTeam();
      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error creating user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const callersCount = teamMembers.filter((m) => m.role?.toUpperCase() === "CALLER").length;
  const managersCount = teamMembers.filter((m) => m.role?.toUpperCase() !== "CALLER").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>👥</span>
            <span>Team &amp; Caller Management</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage calling agents, assign phone numbers for telephony routing, and configure access permissions.
          </p>
        </div>

        {userRole === "Admin" && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition transform hover:scale-[1.02]"
          >
            <span>➕</span>
            <span>Add New Caller / Team Member</span>
          </button>
        )}
      </div>

      {/* Role notice for Callers */}
      {userRole !== "Admin" && (
        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-cyan-300 text-xs flex items-center gap-2">
          <span>ℹ️</span>
          <span>You are viewing in Caller View. Creating or modifying team members requires Admin role permissions.</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-xs text-zinc-400 block font-medium">Total Team Members</span>
          <span className="text-2xl font-black text-white mt-1 block">{teamMembers.length}</span>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">In PostgreSQL DB</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-xs text-zinc-400 block font-medium">Active Callers</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{callersCount}</span>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Handling dial queues</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-xs text-zinc-400 block font-medium">Admins / Managers</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">{managersCount}</span>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">Full supervisory rights</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-xs text-zinc-400 block font-medium">Current Caller</span>
          <span className="text-sm font-bold text-cyan-300 mt-2 block truncate">{activeCallerName}</span>
          <span className="text-[11px] text-zinc-500 block truncate">({userRole} role active)</span>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            All Registered Team Members ({teamMembers.length})
          </h2>
          <button
            type="button"
            onClick={() => refreshTeam()}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/70 border-b border-zinc-800 text-[11px] text-zinc-400 uppercase font-bold">
              <tr>
                <th className="p-3.5">Name &amp; Email</th>
                <th className="p-3.5">System Role</th>
                <th className="p-3.5">Routing Phone</th>
                <th className="p-3.5">Assigned Leads</th>
                <th className="p-3.5">Calls Logged</th>
                <th className="p-3.5">Daily Quota</th>
                <th className="p-3.5">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-800/40 transition">
                  {/* Name & Email */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center font-bold text-cyan-300 shadow-sm">
                        {member.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{member.fullName}</div>
                        <div className="text-zinc-400 text-[11px]">{member.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* System Role */}
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        member.role?.toUpperCase() === "ADMIN"
                          ? "bg-cyan-950/70 text-cyan-300 border-cyan-700/70 shadow-[0_0_8px_rgba(8,199,233,0.2)]"
                          : member.role?.toUpperCase() === "MANAGER"
                          ? "bg-purple-950/70 text-purple-300 border-purple-700/70"
                          : "bg-emerald-950/70 text-emerald-300 border-emerald-700/70"
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>

                  {/* Phone */}
                  <td className="p-3.5">
                    {member.phone ? (
                      <span className="font-mono text-zinc-200">{member.phone}</span>
                    ) : (
                      <span className="text-zinc-500 italic text-[11px]">No phone configured</span>
                    )}
                  </td>

                  {/* Assigned Leads */}
                  <td className="p-3.5">
                    <span className="font-bold text-zinc-100">{member.assignedLeadsCount ?? 0}</span>
                    <span className="text-zinc-500 text-[10px] ml-1">leads</span>
                  </td>

                  {/* Calls Logged */}
                  <td className="p-3.5">
                    <span className="font-bold text-cyan-400">{member.callsMadeCount ?? 0}</span>
                    <span className="text-zinc-500 text-[10px] ml-1">calls</span>
                  </td>

                  {/* Daily Quota */}
                  <td className="p-3.5 font-mono text-zinc-300">
                    🎯 {member.targetCallsPerDay || 50} / day
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active
                    </span>
                  </td>
                </tr>
              ))}

              {teamMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500">
                    No team members found. Click &quot;Add New Caller&quot; above to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>➕</span>
                <span>Create New Team Member</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-lg p-1 transition"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleCreateMember} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanya Gupta"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Login Email *</label>
                <input
                  type="email"
                  required
                  placeholder="sanya@solvrex.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">
                  Registered Routing Phone (for Exotel Click-to-Call)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Telephony calls will ring this phone first before bridging with the lead.
                </span>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">System Role *</label>
                <select
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-cyan-400"
                >
                  <option value="CALLER">CALLER (Sees only assigned leads &amp; followups)</option>
                  <option value="MANAGER">MANAGER (Can view all calls, leads, and analytics)</option>
                  <option value="ADMIN">ADMIN (Full access: exports, team management)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold transition shadow-[0_0_12px_rgba(16,185,129,0.3)] disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Team Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

