import "server-only";

import { getPrismaClient } from "@/lib/prisma";

export type CallStatusValue =
  | "INITIATING"
  | "RINGING"
  | "CONNECTED"
  | "COMPLETED"
  | "FAILED"
  | "BUSY"
  | "NO_ANSWER";

export const ACTIVE_STATUSES: string[] = ["INITIATING", "RINGING", "CONNECTED"];
const TERMINAL_STATUSES: string[] = ["COMPLETED", "FAILED", "BUSY", "NO_ANSWER"];

export function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.includes(status);
}

const REQUIRED_ENV = [
  "EXOTEL_ACCOUNT_SID",
  "EXOTEL_API_KEY",
  "EXOTEL_API_TOKEN",
  "EXOTEL_EXOPHONE",
  "EXOTEL_WEBHOOK_SECRET",
  "APP_PUBLIC_URL",
];

export function getMissingExotelConfig(): string[] {
  return REQUIRED_ENV.filter((key) => !process.env[key]);
}

function getConfig() {
  const sid = process.env.EXOTEL_ACCOUNT_SID as string;
  const key = process.env.EXOTEL_API_KEY as string;
  const token = process.env.EXOTEL_API_TOKEN as string;
  const subdomain = process.env.EXOTEL_SUBDOMAIN || "api.exotel.com";
  return {
    exophone: process.env.EXOTEL_EXOPHONE as string,
    baseUrl: `https://${subdomain}/v1/Accounts/${sid}`,
    authHeader:
      "Basic " + Buffer.from(`${key}:${token}`).toString("base64"),
  };
}

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (raw.trim().startsWith("+") && digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

export function mapExotelStatus(raw?: string | null): CallStatusValue | null {
  switch ((raw ?? "").toLowerCase().replace(/_/g, "-").trim()) {
    case "queued":
    case "initiated":
      return "INITIATING";
    case "ringing":
      return "RINGING";
    case "in-progress":
    case "answered":
      return "CONNECTED";
    case "completed":
      return "COMPLETED";
    case "busy":
      return "BUSY";
    case "no-answer":
    case "noanswer":
      return "NO_ANSWER";
    case "failed":
    case "canceled":
    case "cancelled":
      return "FAILED";
    default:
      return null;
  }
}

function toInt(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Exotel first rings the agent, then connects the lead. Returns Exotel CallSid. */
export async function startExotelCall(params: {
  agentPhone: string;
  leadPhone: string;
  callId: string;
  statusCallbackUrl: string;
}): Promise<string> {
  const { exophone, baseUrl, authHeader } = getConfig();

  const body = new URLSearchParams();
  body.set("From", params.agentPhone);
  body.set("To", params.leadPhone);
  body.set("CallerId", exophone);
  body.set("Record", "true");
  body.set("RecordingChannels", "dual");
  body.set("CustomField", params.callId);
  body.set("StatusCallback", params.statusCallbackUrl);
  body.set("StatusCallbackEvents[0]", "terminal");
  body.set("StatusCallbackEvents[1]", "answered");
  body.set("StatusCallbackContentType", "application/json");

  const res = await fetch(`${baseUrl}/Calls/connect.json`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Exotel error ${res.status}: ${text.slice(0, 300)}`);
  }

  let sid: string | undefined;
  try {
    sid = JSON.parse(text)?.Call?.Sid;
  } catch {
    // ignore
  }
  if (!sid) throw new Error("Exotel did not return a CallSid.");
  return sid;
}

/** Fallback sync: asks Exotel for the current state of one call. */
export async function fetchExotelCall(callSid: string) {
  const { baseUrl, authHeader } = getConfig();
  const res = await fetch(`${baseUrl}/Calls/${callSid}.json`, {
    headers: { Authorization: authHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const data = await res.json();
  const c = data?.Call;
  if (!c) return null;

  return {
    status: mapExotelStatus(c.Status) ?? undefined,
    durationSeconds: toInt(c.ConversationDuration ?? c.Duration),
    recordingUrl:
      typeof c.RecordingUrl === "string" && c.RecordingUrl ? c.RecordingUrl : undefined,
  };
}

/** Single place that writes call state. Never moves a finished call back to active. */
export async function applyCallUpdate(
  callId: string,
  update: { status?: CallStatusValue; durationSeconds?: number; recordingUrl?: string },
) {
  const prisma = getPrismaClient();
  const call = await prisma.call.findUnique({ where: { id: callId } });
  if (!call) return null;

  const data: Record<string, unknown> = {};
  const alreadyDone = isTerminal(call.status);
  let finalStatus: string = call.status;

  if (update.status && !(alreadyDone && !isTerminal(update.status))) {
    if (!alreadyDone || update.status !== call.status) {
      data.status = update.status;
      finalStatus = update.status;
    }
    if (update.status === "CONNECTED" && !call.answeredAt) {
      data.answeredAt = new Date();
    }
    if (isTerminal(update.status) && !call.endedAt) {
      data.endedAt = new Date();
    }
  }

  if (update.durationSeconds !== undefined && isTerminal(finalStatus)) {
    data.durationSeconds = update.durationSeconds;
  }
  if (update.recordingUrl) {
    data.recordingUrl = update.recordingUrl;
  }

  if (Object.keys(data).length === 0) return call;
  return prisma.call.update({ where: { id: callId }, data });
}