import "server-only";

import { createHash, randomBytes } from "node:crypto";
import * as argon2 from "argon2";

import { getPrismaClient } from "@/lib/prisma";

export const PASSWORD_RESET_EXPIRY_MINUTES = 20;
const resetTokenPattern = /^[A-Za-z0-9_-]{43}$/;

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface IssuedPasswordReset {
  rawToken: string;
  user: {
    id: bigint;
    fullName: string;
    email: string;
  };
}

export async function issuePasswordReset(
  email: string,
): Promise<IssuedPasswordReset | null> {
  const user = await getPrismaClient().user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      isActive: true,
    },
    select: { id: true, fullName: true, email: true },
  });

  if (!user) {
    return null;
  }

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashResetToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000,
  );

  await getPrismaClient().$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`;
    await transaction.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: now },
    });
    await transaction.passwordResetToken.create({
      data: {
        userId: user.id,
        email: user.email,
        tokenHash,
        expiresAt,
      },
    });
  });

  return { rawToken, user };
}

export async function invalidatePasswordResetToken(
  rawToken: string,
): Promise<void> {
  await getPrismaClient().passwordResetToken.updateMany({
    where: { tokenHash: hashResetToken(rawToken), usedAt: null },
    data: { usedAt: new Date() },
  });
}

export async function validatePasswordResetToken(
  rawToken: string,
): Promise<{ email: string } | null> {
  if (!resetTokenPattern.test(rawToken)) {
    return null;
  }

  const token = await getPrismaClient().passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(rawToken) },
    select: { email: true, expiresAt: true, usedAt: true },
  });

  if (!token || token.usedAt || token.expiresAt <= new Date()) {
    return null;
  }

  return { email: token.email };
}

export async function completePasswordReset(
  rawToken: string,
  newPassword: string,
): Promise<boolean> {
  if (!resetTokenPattern.test(rawToken)) {
    return false;
  }

  const tokenHash = hashResetToken(rawToken);
  const token = await getPrismaClient().passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });
  const now = new Date();

  if (!token || token.usedAt || token.expiresAt <= now) {
    return false;
  }

  const passwordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
  });

  return getPrismaClient().$transaction(async (transaction) => {
    const claimed = await transaction.passwordResetToken.updateMany({
      where: {
        id: token.id,
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });

    if (claimed.count !== 1) {
      return false;
    }

    await transaction.user.update({
      where: { id: token.userId },
      data: { passwordHash, updatedAt: now },
    });
    await transaction.passwordResetToken.updateMany({
      where: {
        userId: token.userId,
        id: { not: token.id },
        usedAt: null,
      },
      data: { usedAt: now },
    });
    await transaction.userSession.deleteMany({
      where: { userId: token.userId },
    });

    return true;
  });
}
