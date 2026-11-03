"use client";

import React, { useState } from "react";
import {
  Settings,
  Shield,
  Sliders,
  Volume2,
  Bell,
  Database,
  Radio,
  Check,
} from "lucide-react";
import { CALLER_TEAM, useCRM } from "@/context/CRMContent";

export default function SettingsPage() {
  const { userRole, setUserRole, activeCallerName, setActiveCallerName } = useCRM();
  const [micVolume, setMicVolume] = useState(85);
  const [autoRecord, setAutoRecord] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [followupAlerts, setFollowupAlerts] = useState(true);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="pt-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Settings
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#111c33] text-[#94a3b8] border border-[#1e293b]">
            Workspace Preferences
          </span>
        </div>
        <p className="text-xs text-[#94a3b8] mt-1">
          Configure calling parameters, simulation roles, audio settings, and alerts.
        </p>
      </div>

      {/* Role Simulation Switcher */}
      <section className="bg-[#0b1224] border border-[#1e293b] rounded-2xl p-5 shadow-lg space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#f59e0b]" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Active Workspace Role (Demo Mode)
            </h2>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Toggle between Administrator privileges and Calling Specialist queue views.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(["Admin", "Caller"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setUserRole(role)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                userRole === role
                  ? "bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-black shadow-md shadow-amber-950/30"
                  : "bg-[#090f1d] border border-[#1e293b] text-slate-400 hover:text-white"
              }`}
            >
              {role === "Admin" ? "👑 Admin View" : "🎧 Caller View"}
            </button>
          ))}
        </div>

        {userRole === "Caller" && (
          <div className="pt-3 border-t border-[#1e293b] max-w-sm">
            <label className="text-xs text-[#94a3b8] block mb-1.5 font-medium">
              Simulated Caller Account:
            </label>
            <select
              value={activeCallerName}
              onChange={(e) => setActiveCallerName(e.target.value)}
              className="w-full text-xs bg-[#090f1d] border border-[#1e293b] rounded-xl px-3 py-2 text-white outline-none focus:border-[#06b6d4] cursor-pointer"
            >
              {CALLER_TEAM.filter((c) => c.role !== "Admin").map((c) => (
                <option key={c.id} value={c.name} className="bg-[#0b1224]">
                  {c.name} ({c.role})
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Audio & Dialer Settings */}
      <section className="bg-[#0b1224] border border-[#1e293b] rounded-2xl p-5 shadow-lg space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#06b6d4]" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Calling &amp; Audio Preferences
            </h2>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Audio codecs, recording rules, and microphone input levels.
          </p>
        </div>

        <div className="space-y-3.5 pt-1">
          {/* Microphone Gain */}
          <div className="p-3.5 rounded-xl bg-[#090f1d] border border-[#17233d] flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-white">Microphone Input Level</span>
              <p className="text-[11px] text-[#94a3b8] mt-0.5">Optimized for noise suppression and clarity</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={micVolume}
                onChange={(e) => setMicVolume(Number(e.target.value))}
                className="w-28 accent-[#06b6d4] cursor-pointer"
              />
              <span className="text-xs font-bold text-[#06b6d4] w-8 text-right">{micVolume}%</span>
            </div>
          </div>

          {/* Auto Recording */}
          <div className="p-3.5 rounded-xl bg-[#090f1d] border border-[#17233d] flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-white">Automatic Call Recording</span>
              <p className="text-[11px] text-[#94a3b8] mt-0.5">Record connected calls for AI transcript generation</p>
            </div>
            <button
              type="button"
              onClick={() => setAutoRecord(!autoRecord)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                autoRecord ? "bg-[#06b6d4]" : "bg-slate-700"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  autoRecord ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Dialing Sounds */}
          <div className="p-3.5 rounded-xl bg-[#090f1d] border border-[#17233d] flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-white">Sound Effects &amp; Ringtone</span>
              <p className="text-[11px] text-[#94a3b8] mt-0.5">Play audio feedback on call connect and hang-up</p>
            </div>
            <button
              type="button"
              onClick={() => setSoundEffects(!soundEffects)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                soundEffects ? "bg-[#06b6d4]" : "bg-slate-700"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  soundEffects ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-[#0b1224] border border-[#1e293b] rounded-2xl p-5 shadow-lg space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#a855f7]" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Notification Preferences
            </h2>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Choose what alerts appear on your dashboard.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#090f1d] border border-[#17233d] flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-white">Follow-up Due Reminders</span>
            <p className="text-[11px] text-[#94a3b8] mt-0.5">Trigger 15-minute sound alerts for upcoming scheduled calls</p>
          </div>
          <button
            type="button"
            onClick={() => setFollowupAlerts(!followupAlerts)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              followupAlerts ? "bg-[#06b6d4]" : "bg-slate-700"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                followupAlerts ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  );
}
