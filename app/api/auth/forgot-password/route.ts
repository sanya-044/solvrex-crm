import { NextResponse } from "next/server";

import { consumeRateLimit, getClientAddress } from "@/lib/auth-rate-limit";
import { isSameOrigin } from "@/lib/auth";
import { getSafeErrorCode } from "@/lib/safe-error-code";
import { sendEmail } from "@/services/email.service";
import {
  invalidatePasswordResetToken,
  issuePasswordReset,
  PASSWORD_RESET_EXPIRY_MINUTES,
} from "@/services/password-reset.service";

const genericResponse = {
  success: true,
  message:
    "If an account exists with this email address, a password reset link has been sent.",
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getApplicationBaseUrl(): URL {
  const configuredUrl = process.env.APP_BASE_URL?.trim();
  if (!configuredUrl) {
    throw new Error("APP_BASE_URL is not configured");
  }

  const baseUrl = new URL(configuredUrl);
  if (
    (baseUrl.protocol !== "https:" &&
      !(process.env.NODE_ENV !== "production" &&
        baseUrl.protocol === "http:")) ||
    baseUrl.username ||
    baseUrl.password ||
    baseUrl.search ||
    baseUrl.hash
  ) {
    throw new Error("APP_BASE_URL is invalid");
  }

  return baseUrl;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Invalid request origin" },
      { status: 403 },
    );
  }

  if (
    request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !==
    "application/json"
  ) {
    return NextResponse.json(
      { success: false, message: "Content-Type must be application/json" },
      { status: 415 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("email" in body) ||
    typeof body.email !== "string"
  ) {
    return NextResponse.json(
      { success: false, message: "A valid email address is required." },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();
  if (email.length > 255 || !emailPattern.test(email)) {
    return NextResponse.json(
      { success: false, message: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const clientAddress = getClientAddress(request);
  if (
    !consumeRateLimit("forgot-password-ip", clientAddress, 20, 15 * 60_000) ||
    !consumeRateLimit("forgot-password-email", email, 3, 15 * 60_000)
  ) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let issuedReset: Awaited<ReturnType<typeof issuePasswordReset>> = null;
  try {
    const baseUrl = getApplicationBaseUrl();
    issuedReset = await issuePasswordReset(email);
    if (!issuedReset) {
      return NextResponse.json(genericResponse, { status: 200 });
    }

    const resetUrl = new URL("/pwdreset", baseUrl);
    resetUrl.searchParams.set("token", issuedReset.rawToken);

    const delivery = await sendEmail({
      to: issuedReset.user.email,
      subject: "Reset your Solvrex CRM password",
      template: "password-reset",
      variables: {
        fullName: issuedReset.user.fullName,
        resetUrl: resetUrl.toString(),
        expiryMinutes: PASSWORD_RESET_EXPIRY_MINUTES,
      },
    });

    if (!delivery.success) {
      await invalidatePasswordResetToken(issuedReset.rawToken);
      console.error(
        `POST /api/auth/forgot-password email delivery failed: ${delivery.error.code}`,
      );
    }

    return NextResponse.json(genericResponse, { status: 200 });
  } catch (error) {
    if (issuedReset) {
      try {
        await invalidatePasswordResetToken(issuedReset.rawToken);
      } catch (error) {
        console.error(
          "POST /api/auth/forgot-password could not invalidate an unsent token:",
          getSafeErrorCode(error),
        );
      }
    }

    console.error(
      "POST /api/auth/forgot-password failed:",
      getSafeErrorCode(error),
    );
    return NextResponse.json(
      { success: false, message: "Unable to process your request right now." },
      { status: 500 },
    );
  }
}
