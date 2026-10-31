import { NextResponse } from "next/server";

import {
  getSessionCookieOptions,
  isSameOrigin,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { createSession, verifyCredentials } from "@/services/auth.service";

function isLoginBody(
  value: unknown,
): value is { email: string; password: string } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const body = value as Record<string, unknown>;
  return (
    typeof body.email === "string" &&
    typeof body.password === "string" &&
    body.email.length <= 255 &&
    body.password.length > 0 &&
    body.password.length <= 1024
  );
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

  if (!isLoginBody(body)) {
    return NextResponse.json(
      { success: false, message: "Email and password are required" },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { success: false, message: "Email and password are required" },
      { status: 400 },
    );
  }

  try {
    const credentials = await verifyCredentials(email, body.password);
    if (!credentials) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = await createSession(credentials.userId);
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: { user: credentials.user },
    });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      token,
      getSessionCookieOptions(),
    );

    return response;
  } catch {
    console.error("POST /api/auth/login failed.");
    return NextResponse.json(
      { success: false, message: "Unable to log in at this time" },
      { status: 500 },
    );
  }
}
