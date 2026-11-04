"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CRMProvider } from "@/context/CRMContent";
import { useAuth } from "@/context/AuthContext";
type Theme = "light" | "dark";

const STORAGE_KEY = "solvrex_theme";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

function readTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Wraps the CRM area. Only rendered after login, so reading localStorage here is safe. */
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div data-theme={theme} className="flex min-h-screen">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

function ThemeToggle() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return null;
  const dark = ctx.theme === "dark";

  return (
    <button
      type="button"
      onClick={ctx.toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-800"
    >
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}


const ICONS: Record<string, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </>
  ),
  leads: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  calls: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  followups: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  analytics: (
    <>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </>
  ),
};

function NavIcon({ name }: { name: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const NAV = [
  { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { name: "Leads", href: "/leads", icon: "leads" },
  { name: "Call Logs", href: "/calls", icon: "calls" },
  { name: "Follow-ups", href: "/followups", icon: "followups" },
  { name: "Analytics", href: "/analytics", icon: "analytics" },
];

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 min-h-screen flex-col justify-between p-4 bg-[var(--side)] text-[var(--side-ink)]">
        <div>
          <div className="flex items-center gap-2.5 px-2 mb-8 mt-1">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center text-[#ffffff] font-bold">S</div>
            <span className="text-lg font-bold tracking-wide text-[#ffffff]">Solvrex</span>
          </div>

          <nav className="space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--side-active)] text-[var(--side-accent)]"
                      : "hover:bg-[var(--side-hover)] hover:text-[#ffffff]"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-xl bg-[var(--side-hover)] px-3.5 py-3">
          <p className="text-sm font-semibold text-[#ffffff] truncate">{user?.fullName ?? ""}</p>
          <p className="text-xs capitalize text-[var(--side-ink)]">{user?.role ?? ""}</p>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace("/");
            }}
            className="mt-3 w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--side-active)] hover:text-[#ffffff]"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-around bg-[var(--side)] text-[var(--side-ink)] border-t border-white/10 px-1 py-1.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium ${
                active ? "text-[var(--side-accent)]" : ""
              }`}
            >
              <NavIcon name={item.icon} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}


const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/calls": "Call Logs",
  "/followups": "Follow-ups",
  "/analytics": "Analytics",
};

function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
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
        {user && <span className="hidden sm:block text-sm text-zinc-400">{user.fullName}</span>}
        {/* Mobile has no sidebar, so logout lives here */}
        <button
          type="button"
          title="Log out"
          onClick={async () => {
            await logout();
            router.replace("/");
          }}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-800"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default function ProtectedCRMLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-400"
        aria-busy="true"
      >
        Checking your session...
      </main>
    );
  }

  return (
    <ThemeProvider>
      <CRMProvider>
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar />
          <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>
        </div>
      </CRMProvider>
    </ThemeProvider>
  );
}
