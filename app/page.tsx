"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
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
    <main className="crm-canvas relative overflow-hidden flex min-h-screen items-center justify-center px-4 py-10 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient Silver & Brushed Titanium Background Layers */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Top central platinum-chrome specular sheen */}
        <div className="absolute -top-[10%] left-[20%] right-[20%] h-[350px] bg-[#E5E4E2]/[0.08] rounded-full blur-[140px]" />
        {/* Mid-left brushed aluminium ambient sheen */}
        <div className="absolute top-[20%] left-[8%] w-[500px] h-[350px] bg-[#AEB5BF]/[0.07] rounded-full blur-[130px]" />
        {/* Mid-right titanium metallic luster */}
        <div className="absolute top-[35%] right-[8%] w-[550px] h-[380px] bg-[#717985]/[0.08] rounded-full blur-[140px]" />

        {/* Subtle Chrome Horizon Line */}
        <div className="absolute top-0 left-0 right-0 h-40 overflow-hidden pointer-events-none opacity-25">
          <svg viewBox="0 0 1440 220" fill="none" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M 200 0 C 450 80, 720 120, 960 45 C 1160 -15, 1320 35, 1440 10"
              stroke="url(#silver-login-grad)"
              strokeWidth="1.2"
              className="filter drop-shadow-[0_0_8px_rgba(240,242,245,0.4)]"
            />
            <defs>
              <linearGradient id="silver-login-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#717985" stopOpacity="0.1" />
                <stop offset="35%" stopColor="#C0C0C0" stopOpacity="0.6" />
                <stop offset="55%" stopColor="#F0F2F5" stopOpacity="0.8" />
                <stop offset="80%" stopColor="#AEB5BF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#717985" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Bottom metallic shimmer */}
        <div className="crm-bottom-shimmer" />
      </div>

      <section className="glass-panel w-full max-w-md rounded-3xl p-8 sm:p-10 relative overflow-hidden z-10 border border-[#AEB5BF]/45 border-t-[#ffffff] border-l-[#E5E4E2]/70 border-r-[#AEB5BF]/35 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.9),inset_0_1.5px_2px_0_rgba(255,255,255,0.45),inset_0_-1px_1.5px_0_rgba(0,0,0,0.7),0_0_24px_0_rgba(192,192,192,0.12)]">
        {/* Polished Chrome Top Rim & Specular Corner Shine */}
        <div className="glass-rim" />
        <div className="silver-corner-shine" />

        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-3 relative z-10">
          {/* SX Badge in Polished Titanium & Chrome Trim */}
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

        <div className="mb-6 relative z-10">
          <h1 className="text-2xl sm:text-[26px] font-black bg-gradient-to-r from-white via-[#E5E4E2] to-[#AEB5BF] bg-clip-text text-transparent tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#AEB5BF]">
            Sign in to access your leads, calls, and performance pipeline.
          </p>
        </div>

        {/* Quick Demo Access Box (Brushed Titanium Finish) */}
        <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-b from-[#242b37]/95 to-[#191e27]/95 border border-[#717985]/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] space-y-2.5 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#E5E4E2] flex items-center gap-1">
              <span className="text-amber-400">⚡</span> Quick Demo Login:
            </span>
            <span className="text-[10px] text-[#AEB5BF] font-medium bg-[#141820] px-2 py-0.5 rounded-full border border-[#717985]/30">1-click test</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleLoginWithCredentials("admin@example.com", "admin123")}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#2c3442] to-[#222834] hover:from-[#374152] hover:to-[#2b3342] text-amber-300 border border-amber-400/40 hover:border-amber-300 transition-all flex flex-col items-center justify-center text-center shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>👑 Admin / Manager</span>
              <span className="text-[9px] text-[#AEB5BF] font-normal">Full CRM Access</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleLoginWithCredentials("caller@example.com", "caller123")}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#2c3442] to-[#222834] hover:from-[#374152] hover:to-[#2b3342] text-cyan-300 border border-cyan-400/40 hover:border-cyan-300 transition-all flex flex-col items-center justify-center text-center shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>🎧 Sales Caller</span>
              <span className="text-[9px] text-[#AEB5BF] font-normal">Assigned Leads only</span>
            </button>
          </div>
        </div>

        {(error || authError) && (
          <p
            className="mb-5 rounded-xl border border-red-800/80 bg-red-950/60 px-4 py-3 text-sm text-red-300 relative z-10 shadow-sm"
            role="alert"
          >
            {error ?? authError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold text-[#E5E4E2]"
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
              className="w-full rounded-xl border border-[#717985]/40 bg-[#161b24]/95 px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition-all focus:border-[#C0C0C0] focus:ring-1 focus:ring-[#C0C0C0]/40 shadow-inner"
              placeholder="admin@example.com or caller@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold text-[#E5E4E2]"
            >
              Password
            </label>
            <div className="flex rounded-xl border border-[#717985]/40 bg-[#161b24]/95 focus-within:border-[#C0C0C0] focus-within:ring-1 focus-within:ring-[#C0C0C0]/40 shadow-inner">
              <input
                id="password"
                name="password"
                type={isPasswordVisible ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-w-0 flex-1 rounded-xl bg-transparent px-3.5 py-2.5 text-sm text-white outline-none"
                placeholder="Enter password (e.g. admin123)"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                className="px-3 text-xs font-semibold text-[#AEB5BF] transition hover:text-white"
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              >
                {isPasswordVisible ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                onClick={() => setError(null)}
                className="text-xs font-medium text-[#AEB5BF] transition hover:text-white"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-[#ffffff] via-[#E5E4E2] to-[#AEB5BF] hover:from-[#ffffff] hover:to-[#d4d4d8] px-4 py-3 text-sm font-black text-slate-950 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.25),inset_0_1px_1.5px_rgba(255,255,255,0.8)] hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? "Signing in..." : "Sign in with Email"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-[#AEB5BF] relative z-10">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-white transition hover:text-cyan-300 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </section>
    </main>
  );
}
