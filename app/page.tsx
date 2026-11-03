"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { authError, isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleLoginWithCredentials(loginEmail: string, loginPass: string) {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPass);
      router.replace("/dashboard");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    await handleLoginWithCredentials(normalizedEmail, password);
  }

  if (isLoading || isAuthenticated) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-4 text-sm text-zinc-400"
        aria-busy="true"
      >
        Checking your session...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 bg-zinc-950 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl shadow-black/50 sm:p-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-lg font-black text-black shadow-lg shadow-amber-500/20">
            S
          </div>
          <div>
            <p className="text-lg font-bold tracking-wider text-white">
              SOLVREX CRM
            </p>
            <p className="text-xs text-amber-400 font-medium">FollowUp Caller Hub</p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Sign in to access your leads, calls, and performance pipeline.
          </p>
        </div>

        {/* Quick Demo Access Box */}
        <div className="mb-6 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">⚡ Quick Demo Login:</span>
            <span className="text-[11px] text-zinc-500">1-click test</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleLoginWithCredentials("admin@example.com", "admin123")}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 transition flex flex-col items-center justify-center text-center hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>👑 Admin / Manager</span>
              <span className="text-[10px] text-zinc-400 font-normal">Full CRM Access</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleLoginWithCredentials("caller@example.com", "caller123")}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-300 border border-emerald-500/30 transition flex flex-col items-center justify-center text-center hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>🎧 Sales Caller</span>
              <span className="text-[10px] text-zinc-400 font-normal">Assigned Leads only</span>
            </button>
          </div>
        </div>

        {(error || authError) && (
          <p
            className="mb-5 rounded-lg border border-red-900/80 bg-red-950/50 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {error ?? authError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium text-zinc-300"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
              placeholder="admin@example.com or caller@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium text-zinc-300"
            >
              Password
            </label>
            <div className="flex rounded-lg border border-zinc-700 bg-zinc-950 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/40">
              <input
                id="password"
                name="password"
                type={isPasswordVisible ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 flex-1 rounded-lg bg-transparent px-3.5 py-2.5 text-sm text-white outline-none"
                placeholder="Enter password (e.g. admin123)"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                className="px-3 text-xs font-medium text-zinc-400 transition hover:text-white"
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              >
                {isPasswordVisible ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-lg bg-amber-400 hover:bg-amber-300 px-4 py-2.5 text-sm font-bold text-black transition shadow-lg shadow-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in with Email"}
          </button>
        </form>
      </section>
    </main>
  );
}
