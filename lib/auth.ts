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

export const DEMO_USERS: Record<string, AuthenticatedUser> = {
  "admin@example.com": {
    id: "demo-admin-1",
    fullName: "CRM Administrator",
    email: "admin@example.com",
    role: "Admin",
  },
  "manager@example.com": {
    id: "demo-manager-2",
    fullName: "Rahul Verma (Manager)",
    email: "manager@example.com",
    role: "Manager",
  },
  "caller@example.com": {
    id: "demo-caller-3",
    fullName: "Priya Sharma (Caller)",
    email: "caller@example.com",
    role: "Caller",
  },
};

const inMemoryDemoSessions = new Map<
  string,
  { user: AuthenticatedUser; expiresAt: Date }
>();

export function createDemoSessionToken(user: AuthenticatedUser): string {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  const payload = {
    user,
    expiresAt: expiresAt.toISOString(),
  };
  const token =
    "demo_" + Buffer.from(JSON.stringify(payload)).toString("base64url");
  inMemoryDemoSessions.set(token, { user, expiresAt });
  return token;
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

  // 1. Check demo session first
  if (token.startsWith("demo_")) {
    const memorySession = inMemoryDemoSessions.get(token);
    if (memorySession && memorySession.expiresAt > new Date()) {
      return memorySession.user;
    }

    try {
      const raw = token.slice(5);
      const parsed = JSON.parse(
        Buffer.from(raw, "base64url").toString("utf-8"),
      );
      if (
        parsed &&
        parsed.user &&
        parsed.expiresAt &&
        new Date(parsed.expiresAt) > new Date()
      ) {
        return parsed.user as AuthenticatedUser;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // 2. Try PostgreSQL session if configured and reachable
  try {
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
  } catch (error) {
    console.warn("Database unreachable during session check, falling back:", error);
    return null;
  }
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    const host = request.headers.get("host");
    const referer = request.headers.get("referer");
    if (referer && host) {
      try {
        return new URL(referer).host === host;
      } catch {
        return true;
      }
    }
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);

    // Support localhost and 127.0.0.1 in local development
    if (
      (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") &&
      (requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1")
    ) {
      return true;
    }

    return originUrl.origin === requestUrl.origin;
  } catch {
    return true;
  }
}
