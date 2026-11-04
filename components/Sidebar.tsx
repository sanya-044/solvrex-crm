"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "▦" },
    { name: "Leads", href: "/leads", icon: "♧" },
    { name: "Call Logs", href: "/calls", icon: "♧" },
    { name: "Follow-ups", href: "/followups", icon: "▣" },
    { name: "Analytics", href: "/analytics", icon: "▰" },
  ];

  return (
    <aside className="w-[210px] min-w-[210px] shrink-0 min-h-screen bg-[#002b2b] px-2 py-4 flex flex-col justify-between text-white">
      <div>
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-8 h-8 rounded-full bg-[#10b99a] flex items-center justify-center text-[#002b2b] font-bold text-lg">S</div>
          <span className="text-[17px] font-bold tracking-tight text-white whitespace-nowrap">SOLVREX CRM</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-[#103f3d] text-[#16c6a3]" : "text-[#d1e0dc] hover:bg-[#103936] hover:text-white"}`}
              >
                <span className="w-4 text-center text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="rounded-xl bg-[#103f3d] p-3">
        <p className="text-[11px] text-[#d1e0dc]">Solvrex Caller Hub v1.0</p>
        <button
          type="button"
          onClick={async () => { await logout(); router.replace("/"); }}
          className="mt-3 w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-[#d1e0dc] hover:bg-[#18514d] hover:text-white"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
