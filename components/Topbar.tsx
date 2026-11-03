"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import UserSwitcher from "@/components/UserSwitcher";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/calls": "Call Logs",
  "/followups": "Follow-ups",
  "/analytics": "Analytics",
};

export default function Topbar() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Solvrex CRM";

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 px-4 md:px-8 py-3 bg-zinc-900 border-b border-zinc-800">
      <h1 className="text-xl font-bold text-slate-100">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        {/* Pages put their own buttons here with <TopbarActions> */}
        <div id="topbar-actions" className="flex flex-wrap items-center gap-2" />
        <button type="button" title="Notifications" className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-800">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <ThemeToggle />
        <UserSwitcher />
      </div>
    </header>
  );
}
