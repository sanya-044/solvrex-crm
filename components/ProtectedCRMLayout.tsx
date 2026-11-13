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
      <div className="flex h-screen crm-canvas text-slate-100 overflow-hidden font-sans antialiased relative selection:bg-cyan-500/30 selection:text-cyan-200 p-2 sm:p-3 md:gap-3">
        {/* Ambient Silver & Brushed Titanium Background Layers */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          {/* Top right: brushed aluminium ambient sheen */}
          <div className="absolute -top-[8%] right-[12%] w-[700px] h-[450px] bg-[#AEB5BF]/[0.05] rounded-full blur-[150px]" />
          {/* Top left: titanium metallic glow */}
          <div className="absolute top-[15%] left-[8%] w-[550px] h-[380px] bg-[#717985]/[0.06] rounded-full blur-[140px]" />
          {/* Bottom center: graphite ambient depth */}
          <div className="absolute bottom-[0%] right-[25%] w-[600px] h-[320px] bg-[#292E36]/[0.30] rounded-full blur-[130px]" />

          {/* Subtle Platinum/Chrome Ambient Horizon Line */}
          <div className="absolute top-0 left-0 right-0 h-36 overflow-hidden pointer-events-none opacity-20">
            <svg viewBox="0 0 1440 220" fill="none" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M 200 0 C 450 80, 720 120, 960 45 C 1160 -15, 1320 35, 1440 10"
                stroke="url(#silver-top-grad)"
                strokeWidth="1.2"
                className="filter drop-shadow-[0_0_6px_rgba(240,242,245,0.4)]"
              />
              <defs>
                <linearGradient id="silver-top-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#717985" stopOpacity="0.1" />
                  <stop offset="35%" stopColor="#C0C0C0" stopOpacity="0.6" />
                  <stop offset="55%" stopColor="#F0F2F5" stopOpacity="0.8" />
                  <stop offset="80%" stopColor="#AEB5BF" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#717985" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Bottom horizontal metallic shimmer */}
          <div className="crm-bottom-shimmer" />
          {/* Center subtle titanium ambient */}
          <div className="absolute top-[45%] left-[35%] w-[400px] h-[250px] bg-[#717985]/[0.03] rounded-full blur-[100px]" />
        </div>

        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Sidebar (Desktop floating island, Mobile slide-over drawer) */}
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
          {/* Mobile Top Header with Hamburger */}
          <header className="md:hidden flex items-center justify-between px-4 py-2.5 bg-[#0a0f1d]/90 backdrop-blur-xl border border-white/10 rounded-2xl mb-2 shrink-0 z-30">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition focus:outline-none"
                aria-label="Open sidebar navigation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-950 via-[#0a1626] to-[#040912] border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-extrabold text-xs shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  SX
                </div>
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-extrabold text-white text-xs tracking-wide">SOLVREX</span>
                  <span className="font-extrabold text-cyan-400 text-xs tracking-wide">CRM</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-teal-950/60 border border-teal-500/40 text-teal-300 tracking-wider">
                ENTERPRISE
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-1.5 sm:px-3 pt-2.5 sm:pt-3.5 pb-6 relative scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </CRMProvider>
  );
}
