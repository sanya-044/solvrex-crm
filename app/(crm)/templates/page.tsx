"use client";

import { useState } from "react";
import {
  SAVED_TEMPLATES,
  PITCH_SCRIPTS,
  MessageTemplate,
} from "@/context/CRMContent";

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "scripts">("whatsapp");
  const [langFilter, setLangFilter] = useState<"All" | "English" | "Hindi">("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (tmpl: MessageTemplate) => {
    navigator.clipboard.writeText(tmpl.content);
    setCopiedId(tmpl.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTemplates = SAVED_TEMPLATES.filter((t) => {
    if (langFilter !== "All" && t.language !== langFilter) return false;
    return true;
  });

  const filteredScripts = PITCH_SCRIPTS.filter((s) => {
    if (langFilter !== "All" && s.language !== langFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Sales Templates &amp; Calling Scripts
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Proven cold calling hooks, objection handling frameworks, and 1-click WhatsApp/Email pitches in English and Hindi.
          </p>
        </div>

        {/* Language selector */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
          {(["All", "English", "Hindi"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLangFilter(l)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                langFilter === l
                  ? "bg-amber-400 text-black shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {l === "Hindi" ? "हिंदी / Hinglish" : l}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === "whatsapp"
              ? "border-amber-400 text-amber-300"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          💬 WhatsApp &amp; Email Message Templates ({filteredTemplates.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("scripts")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === "scripts"
              ? "border-amber-400 text-amber-300"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          📖 Phone Pitch Scripts &amp; Objection Handling ({filteredScripts.length})
        </button>
      </div>

      {/* WhatsApp & Email Templates Grid */}
      {activeTab === "whatsapp" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((t) => {
            const isCopied = copiedId === t.id;
            return (
              <div
                key={t.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{t.title}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
                        {t.channel}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {t.language}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-3.5 bg-zinc-950 rounded-xl border border-zinc-850 text-zinc-200 text-xs whitespace-pre-line leading-relaxed font-sans select-all">
                    {t.content}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(t)}
                    className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>{isCopied ? "✓" : "📋"}</span>
                    <span>{isCopied ? "Copied to Clipboard!" : "Copy Template"}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(t.content)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>💬</span>
                    <span>Test in WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Phone Pitch Scripts Grid */}
      {activeTab === "scripts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScripts.map((s) => (
            <div
              key={s.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-amber-300">{s.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold uppercase">
                  {s.category}
                </span>
              </div>

              <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-850 text-zinc-200 text-xs leading-relaxed font-sans">
                {s.script}
              </div>

              {s.bullets && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                    Caller Coaching Tips:
                  </span>
                  <ul className="list-disc list-inside text-xs text-zinc-400 space-y-0.5">
                    {s.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

