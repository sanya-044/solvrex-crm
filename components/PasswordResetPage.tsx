"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthCard from "@/components/AuthCard";
import { getPasswordPolicyError } from "@/lib/password-policy";

type LinkStatus = "checking" | "valid" | "invalid" | "error" | "success";
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
const invalidLinkMessage =
  "This password reset link is invalid or has expired.";

export default function PasswordResetPage({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<LinkStatus>(() =>
    token && tokenPattern.test(token) ? "checking" : "invalid",
  );
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !tokenPattern.test(token)) {
      return;
    }

    const controller = new AbortController();
    async function validateToken() {
      try {
        const response = await fetch(
          `/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`,
          {
            credentials: "same-origin",
            cache: "no-store",
            signal: controller.signal,
          },
        );
        const body: unknown = await response.json();
        if (
          !response.ok ||
          typeof body !== "object" ||
          body === null ||
          !("data" in body) ||
          typeof body.data !== "object" ||
          body.data === null ||
          !("valid" in body.data) ||
          body.data.valid !== true ||
          !("email" in body.data) ||
          typeof body.data.email !== "string"
        ) {
          setStatus(response.ok ? "invalid" : "error");
          return;
        }

        setEmail(body.data.email);
        setStatus("valid");
      } catch {
        if (!controller.signal.aborted) {
          setStatus("error");
        }
      }
    }

    void validateToken();
    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    if (status !== "success") {
      return;
    }

    const timeout = window.setTimeout(() => router.replace("/"), 3000);
    return () => window.clearTimeout(timeout);
  }, [router, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || status !== "valid") {
      return;
    }

    setError(null);
    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    const policyError = getPasswordPolicyError(newPassword);
    if (policyError) {
      setError(policyError);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      let body: unknown = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }

      if (response.ok) {
        setNewPassword("");
        setConfirmPassword("");
        setStatus("success");
        return;
      }

      const responseMessage =
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof body.message === "string"
          ? body.message
          : "Unable to reset your password. Please try again.";
      if (response.status === 400 && responseMessage === invalidLinkMessage) {
        setStatus("invalid");
        return;
      }
      setError(responseMessage);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard>
      {status === "checking" && (
        <p className="py-4 text-sm text-zinc-400" role="status" aria-busy="true">
          Validating your reset link...
        </p>
      )}

      {status === "invalid" && (
        <div>
          <h1 className="text-2xl font-bold text-white">Reset link unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-300" role="alert">
            {invalidLinkMessage}
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-flex w-full justify-center rounded-lg bg-slate-200 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white"
          >
            Request a new reset link
          </Link>
        </div>
      )}

      {status === "error" && (
        <div>
          <h1 className="text-2xl font-bold text-white">Unable to verify link</h1>
          <p className="mt-3 text-sm text-red-300" role="alert">
            We couldn&apos;t verify this link right now. Please try again.
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-flex w-full justify-center rounded-lg bg-slate-200 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white"
          >
            Request a new reset link
          </Link>
        </div>
      )}

      {status === "success" && (
        <div>
          <h1 className="text-2xl font-bold text-white">Password updated</h1>
          <p className="mt-3 text-sm leading-6 text-emerald-200" role="status">
            Your password has been reset successfully.
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Redirecting you to login...
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex w-full justify-center rounded-lg bg-slate-200 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white"
          >
            Back to Login
          </Link>
        </div>
      )}

      {status === "valid" && (
        <>
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Choose a new password for your account.
            </p>
          </div>

          {error && (
            <p
              className="mb-5 rounded-lg border border-red-900/80 bg-red-950/50 px-4 py-3 text-sm text-red-300"
              role="alert"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                aria-readonly="true"
                className="w-full cursor-not-allowed rounded-lg border border-zinc-800 bg-zinc-950/70 px-3.5 py-3 text-sm text-zinc-500 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-3 text-sm text-white outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-3 text-sm text-white outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
              />
              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Use at least 8 characters (up to 128) with uppercase and
                lowercase letters, a number, and a symbol.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-slate-200 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </>
      )}

      {(status === "valid" || status === "success") && (
        <p className="mt-6 text-center text-sm">
          <Link
            href="/"
            className="font-medium text-slate-300 transition hover:text-white"
          >
            Back to Login
          </Link>
        </p>
      )}
    </AuthCard>
  );
}
