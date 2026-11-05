import { NextResponse } from "next/server";

import { getAuthenticatedUser, isSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function istDayBounds() {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const day = ist.toISOString().slice(0, 10);
  const start = new Date(`${day}T00:00:00+05:30`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const manager = /admin|manager/i.test(user.role);
  const prisma = getPrismaClient();
  const { start, end } = istDayBounds();

  const items = await prisma.followUp.findMany({
    where: { status: "PENDING", ...(manager ? {} : { assignedToId: user.id }) },
    orderBy: { dueAt: "asc" },
    take: 500,
  });

  return NextResponse.json({
    overdue: items.filter((f) => f.dueAt < start),
    today: items.filter((f) => f.dueAt >= start && f.dueAt < end),
    upcoming: items.filter((f) => f.dueAt >= end),
  });
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const prisma = getPrismaClient();
  const item = await prisma.followUp.findUnique({ where: { id: body.id } });
  if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!/admin|manager/i.test(user.role) && item.assignedToId !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const updated = await prisma.followUp.update({
    where: { id: body.id },
    data: { status: "DONE", completedAt: new Date() },
  });
  return NextResponse.json({ followUp: updated });
}