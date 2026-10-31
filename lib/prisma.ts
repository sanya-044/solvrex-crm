import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

let prisma: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = globalForPrisma.prisma;

    if (!prisma) {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error("DATABASE_URL is not configured");
      }

      const adapter = new PrismaPg({ connectionString });
      prisma = new PrismaClient({ adapter });

      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prisma;
      }
    }
  }

  return prisma;
}
