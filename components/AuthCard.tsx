import type { ReactNode } from "react";

export default function AuthCard({ children }: { children: ReactNode }) {
  return (
    <main className="crm-canvas relative overflow-hidden flex min-h-screen items-center justify-center px-4 py-10 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient Silver & Brushed Titanium Background Layers */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-[10%] left-[20%] right-[20%] h-[350px] bg-[#E5E4E2]/[0.08] rounded-full blur-[140px]" />
        <div className="absolute top-[20%] left-[8%] w-[500px] h-[350px] bg-[#AEB5BF]/[0.07] rounded-full blur-[130px]" />
        <div className="absolute top-[35%] right-[8%] w-[550px] h-[380px] bg-[#717985]/[0.08] rounded-full blur-[140px]" />
        <div className="crm-bottom-shimmer" />
      </div>

      <section className="glass-panel w-full max-w-md rounded-3xl p-8 sm:p-10 relative overflow-hidden z-10 border border-[#AEB5BF]/45 border-t-[#ffffff] border-l-[#E5E4E2]/70 border-r-[#AEB5BF]/35 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.9),inset_0_1.5px_2px_0_rgba(255,255,255,0.45),inset_0_-1px_1.5px_0_rgba(0,0,0,0.7),0_0_24px_0_rgba(192,192,192,0.12)]">
        <div className="glass-rim" />
        <div className="silver-corner-shine" />

        <div className="mb-6 flex items-center gap-3 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4d5768] via-[#374050] to-[#202633] border border-[#F0F2F5]/80 text-base font-black text-[#F0F2F5] shadow-[0_0_14px_rgba(255,255,255,0.25),inset_0_1px_1.5px_rgba(255,255,255,0.4)] shrink-0">
            SX
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-lg font-black tracking-wide text-white">SOLVREX</span>
              <span className="text-lg font-black tracking-wide text-[#C0C0C0]">CRM</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-[#AEB5BF] font-semibold">FollowUp Caller Hub</span>
              <span className="text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#292E36] border border-[#AEB5BF]/40 text-[#E5E4E2] ml-1 uppercase">
                ENTERPRISE
              </span>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </section>
    </main>
  );
}
