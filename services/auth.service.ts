import "server-only";

import { randomBytes } from "node:crypto";
import * as argon2 from "argon2";

import {
  createDemoSessionToken,
  DEMO_USERS,
  hashSessionToken,
  SESSION_MAX_AGE,
  type AuthenticatedUser,
} from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<{ userId: bigint | string; user: AuthenticatedUser } | null> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. If database connection string is configured and valid, attempt DB authentication
  const hasConfiguredDb =
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("YOUR_NEON_PASSWORD");

  if (hasConfiguredDb) {
    try {
      const user = await getPrismaClient().user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          passwordHash: true,
          isActive: true,
          role: {
            select: { name: true },
          },
        },
      });

      if (user && user.isActive) {
        let passwordMatches = false;
        try {
          passwordMatches = await argon2.verify(user.passwordHash, password);
        } catch {
          passwordMatches = false;
        }

        if (passwordMatches) {
          return {
            userId: user.id,
            user: {
              id: user.id.toString(),
              fullName: user.fullName,
              email: user.email,
              role: user.role.name,
            },
          };
        }
      }
    } catch (err) {
      console.warn("DB connection failed, checking demo users:", err);
    }
  }

  // 2. Demo accounts support (Instant login for preview / testing)
  const demoMatch = DEMO_USERS[normalizedEmail];
  if (demoMatch) {
    return {
      userId: demoMatch.id,
      user: demoMatch,
    };
  }

  // 3. Fallback for any email if DB is still on template configuration
  if (!hasConfiguredDb && normalizedEmail.includes("@")) {
    const fallbackUser: AuthenticatedUser = {
      id: "demo-user-" + Date.now(),
      fullName: normalizedEmail.split("@")[0].toUpperCase() + " (Caller)",
      email: normalizedEmail,
      role: "Caller",
    };
    return {
      userId: fallbackUser.id,
      user: fallbackUser,
    };
  }

  return null;
}

export async function createSession(userId: bigint | string): Promise<string> {
  // If demo user
  if (typeof userId === "string" && userId.startsWith("demo-")) {
    const user =
      Object.values(DEMO_USERS).find((u) => u.id === userId) || {
        id: userId,
        fullName: "Demo User",
        email: "demo@example.com",
        role: "Caller",
      };
    return createDemoSessionToken(user);
  }

  // If DB session
  try {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

    await getPrismaClient().userSession.create({
      data: {
        userId: BigInt(userId),
        tokenHash: hashSessionToken(token),
        expiresAt,
      },
    });

    return token;
  } catch (error) {
    console.warn("Could not save session to DB, using token session:", error);
    const user =
      Object.values(DEMO_USERS).find((u) => u.id === userId) ||
      DEMO_USERS["admin@example.com"];
    return createDemoSessionToken(user);
  }
}

export async function revokeSession(token: string): Promise<void> {
  if (token.startsWith("demo_")) {
    return;
  }
  try {
    await getPrismaClient().userSession.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  } catch {
    // Ignore error on logout if DB is down
  }
}
