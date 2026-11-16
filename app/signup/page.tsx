"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthCard from "@/components/AuthCard";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpPage() {
  const { authError, isAuthenticated, isLoading, register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"Caller" | "Admin">("Caller");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(trimmedName, trimmedEmail, password, role);
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
    <AuthCard>
      <div className="mb-5">
        <h1 className="text-2xl sm:text-[26px] font-black bg-gradient-to-r from-white via-[#E5E4E2] to-[#AEB5BF] bg-clip-text text-transparent tracking-tight">
          Create Account
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#AEB5BF]">
          Get started with your SOLVREX CRM intelligence suite.
        </p>
      </div>

      {/* Role Selection Toggle */}
      <div className="mb-5 p-3 rounded-2xl bg-gradient-to-b from-[#242b37]/95 to-[#191e27]/95 border border-[#717985]/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] space-y-2">
        <label className="block text-xs font-semibold text-[#E5E4E2]">
          Select Workspace Role:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("Caller")}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              role === "Caller"
                ? "bg-gradient-to-r from-[#2c3442] to-[#222834] text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                : "bg-[#181d26]/80 text-[#AEB5BF] border border-[#717985]/30 hover:border-[#717985]/60 hover:text-white"
            }`}
          >
            <span>🎧 Sales Caller</span>
            <span className="text-[9px] font-normal opacity-80">Assigned Leads</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("Admin")}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              role === "Admin"
                ? "bg-gradient-to-r from-[#2c3442] to-[#222834] text-amber-300 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                : "bg-[#181d26]/80 text-[#AEB5BF] border border-[#717985]/30 hover:border-[#717985]/60 hover:text-white"
            }`}
          >
            <span>👑 Admin / Manager</span>
            <span className="text-[9px] font-normal opacity-80">Full Platform</span>
          </button>
        </div>
      </div>

      {(error || authError) && (
        <p
          className="mb-4 rounded-xl border border-red-800/80 bg-red-950/60 px-4 py-3 text-xs sm:text-sm text-red-300 shadow-sm"
          role="alert"
        >
          {error ?? authError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label
            htmlFor="fullName"
            className="mb-1 block text-xs font-semibold text-[#E5E4E2]"
          >
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-[#717985]/40 bg-[#161b24]/95 px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition-all focus:border-[#C0C0C0] focus:ring-1 focus:ring-[#C0C0C0]/40 shadow-inner"
            placeholder="e.g. Alex Morgan"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-xs font-semibold text-[#E5E4E2]"
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
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#717985]/40 bg-[#161b24]/95 px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition-all focus:border-[#C0C0C0] focus:ring-1 focus:ring-[#C0C0C0]/40 shadow-inner"
            placeholder="alex@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-xs font-semibold text-[#E5E4E2]"
          >
            Password
          </label>
          <div className="flex rounded-xl border border-[#717985]/40 bg-[#161b24]/95 focus-within:border-[#C0C0C0] focus-within:ring-1 focus-within:ring-[#C0C0C0]/40 shadow-inner">
            <input
              id="password"
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-w-0 flex-1 rounded-xl bg-transparent px-3.5 py-2.5 text-sm text-white outline-none"
              placeholder="At least 6 characters"
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible((v) => !v)}
              className="px-3 text-xs font-semibold text-[#AEB5BF] transition hover:text-white"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-xs font-semibold text-[#E5E4E2]"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-[#717985]/40 bg-[#161b24]/95 px-3.5 py-2.5 text-sm text-white placeholder-slate-400 outline-none transition-all focus:border-[#C0C0C0] focus:ring-1 focus:ring-[#C0C0C0]/40 shadow-inner"
            placeholder="Re-enter password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-3 rounded-xl bg-gradient-to-r from-[#ffffff] via-[#E5E4E2] to-[#AEB5BF] hover:from-[#ffffff] hover:to-[#d4d4d8] px-4 py-3 text-sm font-black text-slate-950 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.25),inset_0_1px_1.5px_rgba(255,255,255,0.8)] hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-[#AEB5BF]">
        Already have an account?{" "}
        <Link
          href="/"
          className="font-bold text-white transition hover:text-cyan-300 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}
