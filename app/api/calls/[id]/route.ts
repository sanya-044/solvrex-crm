import { NextResponse } from "next/server";

import { getAuthenticatedUser, isSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import {
  ACTIVE_STATUSES,
  applyCallUpdate,
  fetchExotelCall,
  isTerminal,
} from "@/lib/exotel";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

type CallRow = {
  id: string;
  leadId: string;
  leadName: string;
  callerName: string;
  status: string;
  outcome: string | null;
  notes: string | null;
  durationSeconds: number;
  recordingUrl: string | null;
  answeredAt: Date | null;
  createdAt: Date;
};

function serialize(call: CallRow) {
  const live =
    call.status === "CONNECTED" && call.answeredAt
      ? Math.max(0, Math.floor((Date.now() - call.answeredAt.getTime()) / 1000))
      : call.durationSeconds;

  return {
    id: call.id,
    leadId: call.leadId,
    leadName: call.leadName,
    callerName: call.callerName,
    status: call.status,
    outcome: call.outcome,
    notes: call.notes,
    durationSeconds: live,
    recordingUrl: call.recordingUrl,
    createdAt: call.createdAt,
  };
}

const isManager = (role: string) => /admin|manager/i.test(role);

export async function GET(_request: Request, { params }: Ctx) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const prisma = getPrismaClient();
  let call = await prisma.call.findUnique({ where: { id } });
  if (!call) return NextResponse.json({ error: "Call not found." }, { status: 404 });
  if (!isManager(user.role) && call.callerId !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const needsSync =
    !!call.exotelCallSid &&
    (ACTIVE_STATUSES.includes(call.status) ||
      (call.status === "COMPLETED" &&
        !call.recordingUrl &&
        Date.now() - call.createdAt.getTime() < 15 * 60 * 1000));

  if (needsSync) {
    try {
      const remote = await fetchExotelCall(call.exotelCallSid as string);
      if (remote) {
        const updated = await applyCallUpdate(call.id, remote);
        if (updated) call = updated;
      }
    } catch (error) {
      console.warn("Exotel sync failed:", error);
    }
  }

  return NextResponse.json({ call: serialize(call) });
}

function parseDue(date?: string, time?: string): Date | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const t = time && /^\d{2}:\d{2}$/.test(time) ? time : "10:00";
  const d = new Date(`${date}T${t}:00+05:30`); // IST
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function PATCH(request: Request, { params }: Ctx) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const prisma = getPrismaClient();
  const call = await prisma.call.findUnique({ where: { id } });
  if (!call) return NextResponse.json({ error: "Call not found." }, { status: 404 });
  if (!isManager(user.role) && call.callerId !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (!isTerminal(call.status)) {
    return NextResponse.json(
      { error: "The call is still in progress. Save after it ends." },
      { status: 409 },
    );
  }

  let body: {
    outcome?: string;
    notes?: string;
    followUpDate?: string;
    followUpTime?: string;
    priority?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.outcome || body.outcome.length > 40) {
    return NextResponse.json({ error: "Call outcome is required." }, { status: 400 });
  }

  const priority = ["High", "Medium", "Low"].includes(body.priority ?? "")
    ? (body.priority as string)
    : "Medium";

  const updated = await prisma.call.update({
    where: { id },
    data: {
      outcome: body.outcome,
      notes: (body.notes ?? "").slice(0, 5000) || null,
    },
  });

  const dueAt = parseDue(body.followUpDate, body.followUpTime);
  if (dueAt) {
    const existing = await prisma.followUp.findFirst({ where: { callId: id } });
    if (existing) {
      await prisma.followUp.update({
        where: { id: existing.id },
        data: { dueAt, priority, notes: updated.notes },
      });
    } else {
      await prisma.followUp.create({
        data: {
          callId: id,
          leadId: call.leadId,
          leadName: call.leadName,
          assignedToId: call.callerId,
          assignedToName: call.callerName,
          dueAt,
          priority,
          notes: updated.notes,
        },
      });
    }
  }

  return NextResponse.json({ call: serialize(updated) });
}