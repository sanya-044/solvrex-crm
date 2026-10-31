import { NextResponse } from "next/server";

import {
  getSessionCookieOptions,
  getSessionToken,
  isSameOrigin,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { revokeSession } from "@/services/auth.service";

function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Invalid request origin" },
      { status: 403 },
    );
  }

  try {
    const token = await getSessionToken();
    if (token) {
      await revokeSession(token);
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
    clearSessionCookie(response);
    return response;
  } catch {
    console.error("POST /api/auth/logout failed.");
    const response = NextResponse.json(
      { success: false, message: "Unable to log out at this time" },
      { status: 500 },
    );
    clearSessionCookie(response);
    return response;
  }
}
