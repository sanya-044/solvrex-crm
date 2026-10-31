import "server-only";

import { randomBytes } from "node:crypto";
import * as argon2 from "argon2";

import {
  hashSessionToken,
  SESSION_MAX_AGE,
  type AuthenticatedUser,
} from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<{ userId: bigint; user: AuthenticatedUser } | null> {
  const user = await getPrismaClient().user.findFirst({
    where: {
      email: {
        equals: email,
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

  if (!user || !user.isActive) {
    return null;
  }

  let passwordMatches = false;
  try {
    passwordMatches = await argon2.verify(user.passwordHash, password);
  } catch {
    return null;
  }

  if (!passwordMatches) {
    return null;
  }

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

export async function createSession(userId: bigint): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await getPrismaClient().userSession.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
    },
  });

  return token;
}

export async function revokeSession(token: string): Promise<void> {
  await getPrismaClient().userSession.deleteMany({
    where: { tokenHash: hashSessionToken(token) },
  });
}
