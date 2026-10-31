import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";

import { getPrismaClient } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "solvrex_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }

  const session = await getPrismaClient().userSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          isActive: true,
          role: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (
    !session ||
    session.expiresAt <= new Date() ||
    !session.user.isActive
  ) {
    return null;
  }

  return {
    id: session.user.id.toString(),
    fullName: session.user.fullName,
    email: session.user.email,
    role: session.user.role.name,
  };
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
