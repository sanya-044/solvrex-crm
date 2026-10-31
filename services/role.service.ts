import "server-only";

import { getPrismaClient } from "@/lib/prisma";

export async function getRoles() {
  const roles = await getPrismaClient().role.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return roles.map(({ id, name, description }) => ({
    id: id.toString(),
    name,
    description,
  }));
}
