import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { getPrismaClient } from "@/lib/prisma";
import { applyCallUpdate, mapExotelStatus } from "@/lib/exotel";

export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function pick(payload: Record<string, unknown>, ...keys: string[]): string | undefined {
  const lower = new Map(
    Object.entries(payload).map(([k, v]) => [k.toLowerCase(), v]),
  );
  for (const key of keys) {
    const v = lower.get(key.toLowerCase());
    if (v !== undefined && v !== null && String(v) !== "") return String(v);
  }
  return undefined;
}

async function readPayload(request: Request): Promise<Record<string, unknown>> {
  const url = new URL(request.url);
  const fromQuery = Object.fromEntries(url.searchParams.entries());

  if (request.method === "GET") return fromQuery;

  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      return { ...fromQuery, ...(await request.json()) };
    }
    const form = await request.formData();
    return { ...fromQuery, ...Object.fromEntries(form.entries()) };
  } catch {
    return fromQuery;
  }
}

async function handle(request: Request) {
  const secret = process.env.EXOTEL_WEBHOOK_SECRET;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!secret || !safeEqual(token, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await readPayload(request);
  if (process.env.NODE_ENV !== "production") {
    console.log("[exotel webhook]", JSON.stringify(payload));
  }

  const sid = pick(payload, "CallSid", "Sid");
  const customField = pick(payload, "CustomField");

  const prisma = getPrismaClient();
  let call = sid
    ? await prisma.call.findUnique({ where: { exotelCallSid: sid } })
    : null;
  if (!call && customField) {
    call = await prisma.call.findUnique({ where: { id: customField } });
  }
  if (!call) {
    // Always 200 so Exotel does not keep retrying unknown calls
    return NextResponse.json({ ok: true, matched: false });
  }

  const status = mapExotelStatus(pick(payload, "Status", "CallStatus", "Event"));
  const durationRaw = pick(payload, "ConversationDuration", "Duration");
  const duration = durationRaw ? parseInt(durationRaw, 10) : undefined;

  await applyCallUpdate(call.id, {
    status: status ?? undefined,
    durationSeconds: Number.isFinite(duration) ? duration : undefined,
    recordingUrl: pick(payload, "RecordingUrl"),
  });

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}