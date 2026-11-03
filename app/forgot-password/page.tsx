"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const confirmationMessage =
  "If an account exists with this email address, a password reset link has been sent.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestController = useRef<AbortController | null>(null);

  const resetForm = useCallback(() => {
    requestController.current?.abort();
    requestController.current = null;
    setEmail("");
    setIsSubmitting(false);
    setMessage(null);
    setError(null);
  }, []);

  useEffect(() => {
    function handleHistoryNavigation() {
      resetForm();
    }

    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        resetForm();
      }
    }

    window.addEventListener("popstate", handleHistoryNavigation);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("popstate", handleHistoryNavigation);
      window.removeEventListener("pageshow", handlePageShow);
      requestController.current?.abort();
    };
  }, [resetForm]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || message) {
      return;
    }

    setError(null);
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    const controller = new AbortController();
    requestController.current = controller;
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (controller.signal.aborted) {
        return;
      }
      if (response.ok) {
        setMessage(confirmationMessage);
        return;
      }

      let responseBody: unknown = null;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = null;
      }

      const responseMessage =
        typeof responseBody === "object" &&
        responseBody !== null &&
        "message" in responseBody &&
        typeof responseBody.message === "string"
          ? responseBody.message
          : null;
      setError(
        responseMessage ??
          "We couldn't process your request. Please try again.",
      );
    } catch {
      if (!controller.signal.aborted) {
        setError("Unable to connect. Please try again.");
      }
    } finally {
      if (requestController.current === controller) {
        requestController.current = null;
        setIsSubmitting(false);
      }
    }
  }

  return (
    <AuthCard>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Enter your registered email address. We&apos;ll send you a link to
          reset your password.
        </p>
      </div>

      {message && (
        <p
          className="mb-5 rounded-lg border border-emerald-900/80 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200"
          role="status"
        >
          {message}
        </p>
      )}
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
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={Boolean(message)}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-3 text-sm text-white outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 disabled:opacity-60"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || Boolean(message)}
          className="w-full rounded-lg bg-slate-200 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link
          href="/"
          onClick={resetForm}
          className="font-medium text-slate-300 transition hover:text-white"
        >
          Back to Login
        </Link>
      </p>
    </AuthCard>
  );
}
