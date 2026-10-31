"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Leads", href: "/leads", icon: "👥" },
    { name: "Call Logs", href: "/calls", icon: "📞" },
    { name: "Follow-ups", href: "/followups", icon: "📅" },
    { name: "Analytics", href: "/analytics", icon: "📈" },
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-400 to-zinc-200 flex items-center justify-center text-black font-bold">
            S
          </div>
          <span className="text-xl font-bold tracking-wider text-slate-100">SOLVREX CRM</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-zinc-800 text-white border-l-4 border-slate-300 shadow-md"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="text-xs text-zinc-500 p-2 border-t border-zinc-800">
        <p>Solvrex Caller Hub v1.0</p>
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace("/");
          }}
          className="mt-3 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}