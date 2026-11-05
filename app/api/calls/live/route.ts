import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { ACTIVE_STATUSES } from "@/lib/exotel";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const manager = /admin|manager/i.test(user.role);
  const prisma = getPrismaClient();

  const calls = await prisma.call.findMany({
    where: {
      status: { in: ACTIVE_STATUSES as never },
      createdAt: { gt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      ...(manager ? {} : { callerId: user.id }),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    calls: calls.map((c) => ({
      id: c.id,
      callerName: c.callerName,
      leadId: c.leadId,
      leadName: c.leadName,
      status: c.status,
      durationSeconds:
        c.status === "CONNECTED" && c.answeredAt
          ? Math.max(0, Math.floor((Date.now() - c.answeredAt.getTime()) / 1000))
          : 0,
      startedAt: c.createdAt,
    })),
  });
}