import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const manager = /admin|manager/i.test(user.role);
  const prisma = getPrismaClient();

  const calls = await prisma.call.findMany({
    where: manager ? {} : { callerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    calls: calls.map((c) => ({
      id: c.id,
      leadId: c.leadId,
      leadName: c.leadName,
      callerName: c.callerName,
      status: c.status,
      outcome: c.outcome,
      notes: c.notes,
      durationSeconds: c.durationSeconds,
      recordingUrl: c.recordingUrl,
      createdAt: c.createdAt,
    })),
  });
}