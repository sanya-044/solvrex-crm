import { connection, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  await connection();

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch {
    console.error("GET /api/auth/me failed.");
    return NextResponse.json(
      { success: false, message: "Unable to verify session" },
      { status: 500 },
    );
  }
}
