import type { ReactNode } from "react";

export default function AuthCard({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl shadow-black/30 sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-400 to-zinc-200 text-lg font-bold text-black">
            S
          </div>
          <div>
            <p className="text-lg font-bold tracking-wider text-slate-100">
              SOLVREX CRM
            </p>
            <p className="text-xs text-zinc-500">Caller Hub</p>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
