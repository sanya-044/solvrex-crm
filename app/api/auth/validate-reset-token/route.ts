import { NextResponse } from "next/server";

import { consumeRateLimit, getClientAddress } from "@/lib/auth-rate-limit";
import { getSafeErrorCode } from "@/lib/safe-error-code";
import { validatePasswordResetToken } from "@/services/password-reset.service";

const invalidResponse = {
  success: true,
  data: { valid: false },
};
const resetTokenPattern = /^[A-Za-z0-9_-]{43}$/;

export async function GET(request: Request) {
  const clientAddress = getClientAddress(request);
  if (!consumeRateLimit("validate-reset-token-ip", clientAddress, 30, 60_000)) {
    return NextResponse.json(invalidResponse, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const token = new URL(request.url).searchParams.get("token");
  if (!token || !resetTokenPattern.test(token)) {
    return NextResponse.json(invalidResponse, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const validatedToken = await validatePasswordResetToken(token);
    if (!validatedToken) {
      return NextResponse.json(invalidResponse, {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: { valid: true, email: validatedToken.email },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      "GET /api/auth/validate-reset-token failed:",
      getSafeErrorCode(error),
    );
    return NextResponse.json(
      { success: false, message: "Unable to validate this link right now." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
