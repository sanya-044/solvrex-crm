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

export const REGISTERED_USERS = new Map<
  string,
  {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    role: string;
  }
>();

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

  // 2. Check in-memory registered users (for sign up flow in preview / test mode)
  const registered = REGISTERED_USERS.get(normalizedEmail);
  if (registered) {
    let passwordMatches = false;
    try {
      passwordMatches = await argon2.verify(registered.passwordHash, password);
    } catch {
      passwordMatches = false;
    }
    if (passwordMatches) {
      return {
        userId: registered.id,
        user: {
          id: registered.id,
          fullName: registered.fullName,
          email: registered.email,
          role: registered.role,
        },
      };
    }
  }

  // 3. Demo accounts support (Instant login for preview / testing)
  const demoMatch = DEMO_USERS[normalizedEmail];
  if (demoMatch) {
    return {
      userId: demoMatch.id,
      user: demoMatch,
    };
  }

  // 4. Fallback for any email if DB is still on template configuration
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

export async function registerUser(
  fullName: string,
  email: string,
  password: string,
  role: string = "Caller",
): Promise<{ userId: bigint | string; user: AuthenticatedUser }> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = fullName.trim();

  if (!trimmedName) {
    throw new Error("Full name is required");
  }
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Please enter a valid email address");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const hasConfiguredDb =
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("YOUR_NEON_PASSWORD");

  if (hasConfiguredDb) {
    try {
      const prisma = getPrismaClient();
      const existing = await prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
      });

      if (existing) {
        throw new Error("An account with this email address already exists");
      }

      const passwordHash = await argon2.hash(password);

      let dbRole = await prisma.role.findFirst({
        where: { name: role },
      });
      if (!dbRole) {
        dbRole = await prisma.role.create({
          data: { name: role },
        });
      }

      const newUser = await prisma.user.create({
        data: {
          fullName: trimmedName,
          email: normalizedEmail,
          passwordHash,
          roleId: dbRole.id,
          isActive: true,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: { select: { name: true } },
        },
      });

      return {
        userId: newUser.id,
        user: {
          id: newUser.id.toString(),
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role.name,
        },
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("already exists")) {
        throw err;
      }
      console.warn("Database user registration failed, falling back to local storage:", err);
    }
  }

  // Local in-memory registration fallback
  if (DEMO_USERS[normalizedEmail] || REGISTERED_USERS.has(normalizedEmail)) {
    throw new Error("An account with this email address already exists");
  }

  const passwordHash = await argon2.hash(password);
  const newId = "demo-user-" + Date.now();
  const newUserRecord = {
    id: newId,
    fullName: trimmedName,
    email: normalizedEmail,
    passwordHash,
    role: role || "Caller",
  };

  REGISTERED_USERS.set(normalizedEmail, newUserRecord);

  return {
    userId: newId,
    user: {
      id: newId,
      fullName: trimmedName,
      email: normalizedEmail,
      role: newUserRecord.role,
    },
  };
}

export async function createSession(userId: bigint | string): Promise<string> {
  // If demo/in-memory user
  if (typeof userId === "string" && userId.startsWith("demo-")) {
    const user =
      Object.values(DEMO_USERS).find((u) => u.id === userId) ||
      Array.from(REGISTERED_USERS.values()).find((u) => u.id === userId) || {
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
