import { NextResponse } from "next/server";

import { getAuthenticatedUser, isSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import {
  ACTIVE_STATUSES,
  getMissingExotelConfig,
  normalizePhone,
  startExotelCall,
} from "@/lib/exotel";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const missing = getMissingExotelConfig();
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Exotel is not configured.", missing },
      { status: 503 },
    );
  }

  let body: { leadId?: string; leadName?: string; leadPhone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.leadId || !body.leadName || !body.leadPhone) {
    return NextResponse.json({ error: "Lead details are missing." }, { status: 400 });
  }

  const leadPhone = normalizePhone(body.leadPhone);
  if (!leadPhone) {
    return NextResponse.json(
      { error: "The lead's phone number is not valid." },
      { status: 400 },
    );
  }

  const prisma = getPrismaClient();

  let agentRaw: string | null = null;
  if (/^\d+$/.test(user.id)) {
    const dbUser = await prisma.user.findUnique({
      where: { id: BigInt(user.id) },
      select: { phone: true },
    });
    agentRaw = dbUser?.phone ?? null;
  }
  agentRaw = agentRaw ?? process.env.EXOTEL_DEFAULT_AGENT_PHONE ?? null;

  const agentPhone = agentRaw ? normalizePhone(agentRaw) : null;
  if (!agentPhone) {
    return NextResponse.json(
      { error: "Your phone number is not set on your profile. Ask an admin to add it." },
      { status: 400 },
    );
  }

  // One active call per caller
  const existing = await prisma.call.findFirst({
    where: {
      callerId: user.id,
      status: { in: ACTIVE_STATUSES as never },
      createdAt: { gt: new Date(Date.now() - 30 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "You already have a call in progress.", callId: existing.id },
      { status: 409 },
    );
  }

  const call = await prisma.call.create({
    data: {
      leadId: body.leadId,
      leadName: body.leadName,
      leadPhone,
      callerId: user.id,
      callerName: user.fullName,
      callerPhone: agentPhone,
      status: "INITIATING",
    },
  });

  try {
    const callbackUrl = `${process.env.APP_PUBLIC_URL}/api/exotel/webhook?token=${encodeURIComponent(
      process.env.EXOTEL_WEBHOOK_SECRET as string,
    )}`;

    const sid = await startExotelCall({
      agentPhone,
      leadPhone,
      callId: call.id,
      statusCallbackUrl: callbackUrl,
    });

    await prisma.call.update({
      where: { id: call.id },
      data: { exotelCallSid: sid },
    });

    return NextResponse.json({ callId: call.id, status: "INITIATING" });
  } catch (error) {
    console.error("Exotel call start failed:", error);
    await prisma.call.update({
      where: { id: call.id },
      data: { status: "FAILED", endedAt: new Date() },
    });
    return NextResponse.json(
      { error: "Could not start the call. Check Exotel settings." },
      { status: 502 },
    );
  }
}