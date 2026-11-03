import { NextResponse } from "next/server";

import { isSameOrigin } from "@/lib/auth";
import { consumeRateLimit, getClientAddress } from "@/lib/auth-rate-limit";
import { getPasswordPolicyError } from "@/lib/password-policy";
import { getSafeErrorCode } from "@/lib/safe-error-code";
import { completePasswordReset } from "@/services/password-reset.service";

const resetTokenPattern = /^[A-Za-z0-9_-]{43}$/;

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

  const clientAddress = getClientAddress(request);
  if (!consumeRateLimit("reset-password-ip", clientAddress, 10, 15 * 60_000)) {
    return NextResponse.json(
      { success: false, message: "Too many attempts. Please try again later." },
      { status: 429 },
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
    !("token" in body) ||
    typeof body.token !== "string" ||
    !("newPassword" in body) ||
    typeof body.newPassword !== "string" ||
    !("confirmPassword" in body) ||
    typeof body.confirmPassword !== "string"
  ) {
    return NextResponse.json(
      { success: false, message: "Complete all required fields." },
      { status: 400 },
    );
  }

  if (!resetTokenPattern.test(body.token)) {
    return NextResponse.json(
      { success: false, message: "This password reset link is invalid or has expired." },
      { status: 400 },
    );
  }
  if (body.newPassword !== body.confirmPassword) {
    return NextResponse.json(
      { success: false, message: "The passwords do not match." },
      { status: 400 },
    );
  }

  const policyError = getPasswordPolicyError(body.newPassword);
  if (policyError) {
    return NextResponse.json(
      { success: false, message: policyError },
      { status: 400 },
    );
  }

  try {
    const reset = await completePasswordReset(body.token, body.newPassword);
    if (!reset) {
      return NextResponse.json(
        {
          success: false,
          message: "This password reset link is invalid or has expired.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully.",
    });
  } catch (error) {
    console.error(
      "POST /api/auth/reset-password failed:",
      getSafeErrorCode(error),
    );
    return NextResponse.json(
      { success: false, message: "Unable to reset your password right now." },
      { status: 500 },
    );
  }
}
