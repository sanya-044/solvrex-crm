import "dotenv/config";

import * as argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

async function seedAdmin() {
  const connectionString = process.env.DATABASE_URL;
  const fullName = process.env.SEED_ADMIN_NAME?.trim();
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }
  if (!fullName || !email || !password) {
    throw new Error(
      "SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD are required.",
    );
  }
  if (fullName.length > 100 || email.length > 255) {
    throw new Error("Admin name or email exceeds the database column limit.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    });

    if (existingUser) {
      console.info("Admin email already exists; no changes made.");
      return;
    }

    const adminRole = await prisma.role.findUnique({
      where: { name: "ADMIN" },
      select: { id: true },
    });

    if (!adminRole) {
      throw new Error("The ADMIN role does not exist in the database.");
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        roleId: adminRole.id,
        isActive: true,
      },
    });

    console.info("Admin user created successfully.");
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin().catch(() => {
  console.error(
    "Admin seed failed. Check the required environment variables, database connection, and ADMIN role.",
  );
  process.exitCode = 1;
});
