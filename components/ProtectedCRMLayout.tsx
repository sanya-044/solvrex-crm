"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { CRMProvider } from "@/context/CRMContent";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedCRMLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <CRMProvider>
      <div className="flex h-screen bg-zinc-950 text-slate-100 overflow-hidden font-sans antialiased relative">
        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Sidebar (Desktop static, Mobile slide-over drawer) */}
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Top Header with Hamburger */}
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0 z-30">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-1 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition focus:outline-none"
                aria-label="Open sidebar navigation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-black font-black text-xs shadow-sm">
                  S
                </div>
                <span className="font-extrabold text-white text-sm tracking-wide">SOLVREX CRM</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Hub
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-zinc-950/60 relative">
            {children}
          </main>
        </div>
      </div>
    </CRMProvider>
  );
}
