import { NextResponse } from "next/server";
import {
  getSessionCookieOptions,
  isSameOrigin,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import {
  createSession,
  registerUser,
} from "@/services/auth.service";

function isRegisterBody(
  value: unknown,
): value is { fullName: string; email: string; password: string; role?: string } {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.fullName === "string" &&
    typeof body.email === "string" &&
    typeof body.password === "string" &&
    body.fullName.trim().length > 0 &&
    body.fullName.length <= 100 &&
    body.email.length <= 255 &&
    body.password.length >= 6 &&
    body.password.length <= 1024
  );
}

export async function POST(request: Request) {
  // Check request origin
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request origin",
      },
      { status: 403 },
    );
  }

  // Check content type
  if (
    request.headers
      .get("content-type")
      ?.split(";", 1)[0]
      .trim()
      .toLowerCase() !== "application/json"
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Content-Type must be application/json",
      },
      { status: 415 },
    );
  }

  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request body",
      },
      { status: 400 },
    );
  }

  // Validate fields
  if (!isRegisterBody(body)) {
    return NextResponse.json(
      {
        success: false,
        message: "Full name, valid email, and password (at least 6 characters) are required",
      },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();
  const fullName = body.fullName.trim();
  const role = typeof body.role === "string" && (body.role === "Admin" || body.role === "Caller") ? body.role : "Caller";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      {
        success: false,
        message: "Please enter a valid email address",
      },
      { status: 400 },
    );
  }

  try {
    const registration = await registerUser(
      fullName,
      email,
      body.password,
      role,
    );

    // Create session and log user in immediately
    const token = await createSession(registration.userId);

    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
      data: {
        user: registration.user,
      },
    });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      token,
      getSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to register at this time";

    const isDuplicate = errorMessage.includes("already exists");

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: isDuplicate ? 409 : 500 },
    );
  }
}
