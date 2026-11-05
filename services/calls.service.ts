import fs from "node:fs";
import path from "node:path";
import { getPrismaClient } from "@/lib/prisma";

export interface CallRecord {
  id: string;
  leadId: string;
  leadName: string;
  callerName: string;
  date: string;
  outcome: string;
  duration: string;
  durationSeconds: number;
  notes: string;
  recordingUrl?: string;
  nextFollowUp?: string;
  priority?: string;
}

export const INITIAL_SEED_CALLS: CallRecord[] = [
  {
    id: "c1",
    leadId: "1",
    leadName: "Old Town Cafe & Roastery",
    callerName: "Priya Sharma",
    date: "2026-11-03 10:15",
    outcome: "Interested",
    duration: "03:42",
    durationSeconds: 222,
    notes: "Owner Rohan showed keen interest in automated WhatsApp booking system. Follow-up demo set.",
    recordingUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    nextFollowUp: "2026-11-03 11:30",
    priority: "High",
  },
  {
    id: "c2",
    leadId: "2",
    leadName: "Dr. Smile Dental Studio",
    callerName: "Priya Sharma",
    date: "2026-11-03 09:45",
    outcome: "Meeting booked",
    duration: "05:12",
    durationSeconds: 312,
    notes: "Meeting booked for Thursday Zoom demonstration with head dentist.",
    recordingUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    nextFollowUp: "2026-11-03 14:00",
    priority: "High",
  },
  {
    id: "c3",
    leadId: "5",
    leadName: "Artisan Woodcraft & Interiors",
    callerName: "Priya Sharma",
    date: "2026-11-02 16:20",
    outcome: "Call back",
    duration: "01:05",
    durationSeconds: 65,
    notes: "Was in a client site visit. Requested call back around 5 PM.",
    recordingUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    nextFollowUp: "2026-11-03 17:00",
    priority: "Medium",
  },
  {
    id: "c4",
    leadId: "3",
    leadName: "Skyline Luxury Estates",
    callerName: "Rahul Verma",
    date: "2026-11-02 14:10",
    outcome: "Interested",
    duration: "08:15",
    durationSeconds: 495,
    notes: "Negotiating pilot pricing for 10 sales agents.",
    recordingUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    nextFollowUp: "2026-11-04 16:00",
    priority: "High",
  },
  {
    id: "c5",
    leadId: "4",
    leadName: "Grounded Wellness Spa & Gym",
    callerName: "Ankit Patel",
    date: "2026-10-31 11:30",
    outcome: "Won",
    duration: "06:30",
    durationSeconds: 390,
    notes: "Closed deal! Paid advance for 12 months CRM subscription.",
    recordingUrl: "",
    priority: "Medium",
  },
  {
    id: "c6",
    leadId: "6",
    leadName: "Urban Bites Cloud Kitchen",
    callerName: "Neha Gupta",
    date: "2026-11-01 15:40",
    outcome: "Interested",
    duration: "02:18",
    durationSeconds: 138,
    notes: "Requested quotation on WhatsApp.",
    recordingUrl: "",
    nextFollowUp: "2026-11-05 12:00",
    priority: "Low",
  },
  {
    id: "c7",
    leadId: "8",
    leadName: "Zenith Prep Academy",
    callerName: "Rahul Verma",
    date: "2026-10-30 12:05",
    outcome: "Not answered",
    duration: "00:30",
    durationSeconds: 30,
    notes: "Rang 5 times, no answer. Left automated callback trigger.",
    recordingUrl: "",
    priority: "Low",
  },
];

const DATA_DIR = path.join(process.cwd(), ".data");
const CALLS_FILE = path.join(DATA_DIR, "crm_calls.json");

function ensureCallsFile(): CallRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CALLS_FILE)) {
      fs.writeFileSync(CALLS_FILE, JSON.stringify(INITIAL_SEED_CALLS, null, 2), "utf-8");
      return INITIAL_SEED_CALLS;
    }
    const content = fs.readFileSync(CALLS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    fs.writeFileSync(CALLS_FILE, JSON.stringify(INITIAL_SEED_CALLS, null, 2), "utf-8");
    return INITIAL_SEED_CALLS;
  } catch (error) {
    console.error("Calls file DB read error:", error);
    return INITIAL_SEED_CALLS;
  }
}

function saveCallsFile(calls: CallRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CALLS_FILE, JSON.stringify(calls, null, 2), "utf-8");
  } catch (error) {
    console.error("Calls file DB write error:", error);
  }
}

function isDbAvailable(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && !url.includes("YOUR_NEON_PASSWORD");
}

function formatSecToMMSS(sec: number): string {
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export async function getAllCalls(filter?: {
  leadId?: string;
  callerName?: string;
}): Promise<CallRecord[]> {
  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();
      const where: Record<string, unknown> = {};
      if (filter?.leadId) {
        where.leadId = filter.leadId;
      }
      if (filter?.callerName) {
        where.callerName = filter.callerName;
      }

      const rows = await prisma.call.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 300,
      });

      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          leadId: r.leadId,
          leadName: r.leadName,
          callerName: r.callerName,
          date: r.createdAt.toISOString().replace("T", " ").substring(0, 16),
          outcome: r.outcome || "Interested",
          duration: formatSecToMMSS(r.durationSeconds),
          durationSeconds: r.durationSeconds,
          notes: r.notes || "",
          recordingUrl: r.recordingUrl || undefined,
        }));
      }
    } catch (e) {
      console.warn("Prisma getAllCalls failed, falling back to file DB:", e);
    }
  }

  let calls = ensureCallsFile();
  if (filter?.leadId) {
    calls = calls.filter((c) => c.leadId === filter.leadId);
  }
  if (filter?.callerName && filter.callerName !== "All") {
    calls = calls.filter((c) => c.callerName === filter.callerName);
  }
  return calls;
}

export async function createCallRecord(data: Omit<CallRecord, "id">): Promise<CallRecord> {
  const newId = "call_" + Date.now();
  const newCall: CallRecord = {
    ...data,
    id: newId,
  };

  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();
      const r = await prisma.call.create({
        data: {
          id: newId,
          leadId: data.leadId,
          leadName: data.leadName,
          leadPhone: "+91 00000 00000",
          callerId: "caller_1",
          callerName: data.callerName,
          callerPhone: "+91 99999 99999",
          status: "COMPLETED",
          outcome: data.outcome,
          notes: data.notes,
          durationSeconds: data.durationSeconds || 0,
          recordingUrl: data.recordingUrl || null,
        },
      });

      return {
        ...newCall,
        id: r.id,
      };
    } catch (e) {
      console.warn("Prisma createCall error, falling back to file DB:", e);
    }
  }

  const calls = ensureCallsFile();
  const updated = [newCall, ...calls];
  saveCallsFile(updated);
  return newCall;
}

