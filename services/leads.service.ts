import fs from "node:fs";
import path from "node:path";
import { getPrismaClient } from "@/lib/prisma";

export type PipelineStage =
  | "Lead"
  | "Contacted"
  | "Proposal"
  | "Negotiation"
  | "Meeting Booked"
  | "Won"
  | "Lost";

export type Priority = "High" | "Medium" | "Low";

export interface LeadRecord {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  category: string;
  googleRating: number;
  googleReviewsCount: number;
  websiteUrl: string;
  instagramUrl: string;
  source: string;
  assignedCaller: string;
  status: string;
  pipeline: PipelineStage;
  priority: Priority;
  notes: string;
  followUpDate: string;
  followUpTime?: string;
  lastCallOutcome?: string;
  totalCalls: number;
  createdAt: string;
}

export const INITIAL_SEED_LEADS: LeadRecord[] = [
  {
    id: "1",
    name: "Old Town Cafe & Roastery",
    contactPerson: "Rohan Das",
    phone: "+91 98765 43210",
    email: "rohan@oldtowncafe.in",
    city: "Mumbai",
    category: "Cafe & Restaurant",
    googleRating: 4.7,
    googleReviewsCount: 384,
    websiteUrl: "https://oldtowncafe.example.com",
    instagramUrl: "https://instagram.com/oldtowncafe",
    source: "Google Maps",
    assignedCaller: "Priya Sharma",
    status: "Interested",
    pipeline: "Proposal",
    priority: "High",
    notes: "Owner wants automated WhatsApp reservation reminders and weekend promo campaigns.",
    followUpDate: "2026-11-03",
    followUpTime: "11:30",
    lastCallOutcome: "Interested",
    totalCalls: 3,
    createdAt: "2026-10-25",
  },
  {
    id: "2",
    name: "Dr. Smile Dental Studio",
    contactPerson: "Dr. Priya Sen",
    phone: "+91 98123 45678",
    email: "contact@drsmiledental.in",
    city: "Delhi",
    category: "Dental Clinic",
    googleRating: 4.9,
    googleReviewsCount: 520,
    websiteUrl: "https://drsmiledental.example.com",
    instagramUrl: "https://instagram.com/drsmiledental",
    source: "Instagram",
    assignedCaller: "Priya Sharma",
    status: "Contacted",
    pipeline: "Meeting Booked",
    priority: "High",
    notes: "Meeting confirmed for implant patient follow-up system walkthrough.",
    followUpDate: "2026-11-03",
    followUpTime: "14:00",
    lastCallOutcome: "Meeting booked",
    totalCalls: 2,
    createdAt: "2026-10-28",
  },
  {
    id: "3",
    name: "Skyline Luxury Estates",
    contactPerson: "Amitabh Mehra",
    phone: "+91 99887 76655",
    email: "amitabh@skylineluxury.com",
    city: "Bengaluru",
    category: "Real Estate",
    googleRating: 4.5,
    googleReviewsCount: 195,
    websiteUrl: "https://skylineluxury.example.com",
    instagramUrl: "https://instagram.com/skylineluxury",
    source: "Google Maps",
    assignedCaller: "Rahul Verma",
    status: "Negotiation",
    pipeline: "Negotiation",
    priority: "High",
    notes: "Reviewing commercial proposal for 15-agent caller team license.",
    followUpDate: "2026-11-04",
    followUpTime: "16:00",
    lastCallOutcome: "Interested",
    totalCalls: 5,
    createdAt: "2026-10-15",
  },
  {
    id: "4",
    name: "Grounded Wellness Spa & Gym",
    contactPerson: "Aman Preet Singh",
    phone: "+91 98450 11223",
    email: "aman@groundedwellness.in",
    city: "Pune",
    category: "Gym & Fitness",
    googleRating: 4.8,
    googleReviewsCount: 410,
    websiteUrl: "https://groundedwellness.example.com",
    instagramUrl: "https://instagram.com/groundedwellness",
    source: "Referral",
    assignedCaller: "Ankit Patel",
    status: "Won",
    pipeline: "Won",
    priority: "Medium",
    notes: "Contract signed! Yearly plan activated for membership lead tracking.",
    followUpDate: "",
    lastCallOutcome: "Won",
    totalCalls: 4,
    createdAt: "2026-10-10",
  },
  {
    id: "5",
    name: "Artisan Woodcraft & Interiors",
    contactPerson: "Kavita Rao",
    phone: "+91 97654 32109",
    email: "kavita@artisanwood.in",
    city: "Bengaluru",
    category: "Architecture & Decor",
    googleRating: 4.6,
    googleReviewsCount: 88,
    websiteUrl: "https://artisanwood.example.com",
    instagramUrl: "https://instagram.com/artisanwood",
    source: "Instagram",
    assignedCaller: "Priya Sharma",
    status: "New",
    pipeline: "Lead",
    priority: "Medium",
    notes: "High-ticket modular kitchen enquiries, needs call response within 5 mins.",
    followUpDate: "2026-11-03",
    followUpTime: "17:00",
    lastCallOutcome: "Call back",
    totalCalls: 1,
    createdAt: "2026-11-01",
  },
  {
    id: "6",
    name: "Urban Bites Cloud Kitchen",
    contactPerson: "Siddharth Verma",
    phone: "+91 98111 22334",
    email: "sid@urbanbites.in",
    city: "Delhi",
    category: "Food Delivery",
    googleRating: 4.3,
    googleReviewsCount: 145,
    websiteUrl: "",
    instagramUrl: "https://instagram.com/urbanbites",
    source: "Cold Call",
    assignedCaller: "Neha Gupta",
    status: "Contacted",
    pipeline: "Lead",
    priority: "Low",
    notes: "Requested quotation on WhatsApp for multi-brand kitchen order handling.",
    followUpDate: "2026-11-05",
    followUpTime: "12:00",
    lastCallOutcome: "Interested",
    totalCalls: 1,
    createdAt: "2026-10-30",
  },
  {
    id: "7",
    name: "Nova Skin & Laser Clinic",
    contactPerson: "Dr. Ananya Roy",
    phone: "+91 98333 44556",
    email: "dr.ananya@novaskin.in",
    city: "Mumbai",
    category: "Dermatology",
    googleRating: 4.9,
    googleReviewsCount: 630,
    websiteUrl: "https://novaskin.example.com",
    instagramUrl: "",
    source: "Google Maps",
    assignedCaller: "Priya Sharma",
    status: "New",
    pipeline: "Lead",
    priority: "High",
    notes: "Laser surgery patient enquiries need prompt scheduling.",
    followUpDate: "2026-11-03",
    followUpTime: "15:30",
    lastCallOutcome: undefined,
    totalCalls: 0,
    createdAt: "2026-11-02",
  },
  {
    id: "8",
    name: "Zenith Prep Academy",
    contactPerson: "Suman Joshi",
    phone: "+91 98700 99887",
    email: "admissions@zenithprep.in",
    city: "Mumbai",
    category: "Education",
    googleRating: 4.4,
    googleReviewsCount: 140,
    websiteUrl: "https://zenithprep.example.com",
    instagramUrl: "https://instagram.com/zenithprep",
    source: "Inbound",
    assignedCaller: "Rahul Verma",
    status: "Contacted",
    pipeline: "Proposal",
    priority: "Medium",
    notes: "Sent proposal for coaching admission hotline automation.",
    followUpDate: "2026-11-06",
    followUpTime: "11:00",
    lastCallOutcome: "Interested",
    totalCalls: 2,
    createdAt: "2026-10-29",
  },
];

const DATA_DIR = path.join(process.cwd(), ".data");
const LEADS_FILE = path.join(DATA_DIR, "crm_leads.json");

function ensureFileStorage(): LeadRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LEADS_FILE)) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify(INITIAL_SEED_LEADS, null, 2), "utf-8");
      return INITIAL_SEED_LEADS;
    }
    const content = fs.readFileSync(LEADS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    fs.writeFileSync(LEADS_FILE, JSON.stringify(INITIAL_SEED_LEADS, null, 2), "utf-8");
    return INITIAL_SEED_LEADS;
  } catch (error) {
    console.error("File DB read error:", error);
    return INITIAL_SEED_LEADS;
  }
}

function saveFileStorage(leads: LeadRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (error) {
    console.error("File DB write error:", error);
  }
}

function isDbAvailable(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && !url.includes("YOUR_NEON_PASSWORD");
}

export async function getAllLeads(filter?: {
  caller?: string;
  pipeline?: string;
  city?: string;
  query?: string;
}): Promise<LeadRecord[]> {
  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();
      const where: Record<string, unknown> = {};
      if (filter?.caller && filter.caller !== "All") {
        where.assignedCaller = filter.caller;
      }
      if (filter?.pipeline && filter.pipeline !== "All") {
        where.pipeline = filter.pipeline;
      }
      if (filter?.city && filter.city !== "All") {
        where.city = filter.city;
      }

      const rows = await prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          name: r.name,
          contactPerson: r.contactPerson,
          phone: r.phone,
          email: r.email,
          city: r.city,
          category: r.category,
          googleRating: r.googleRating,
          googleReviewsCount: r.googleReviewsCount,
          websiteUrl: r.websiteUrl,
          instagramUrl: r.instagramUrl,
          source: r.source,
          assignedCaller: r.assignedCaller,
          status: r.status,
          pipeline: r.pipeline as PipelineStage,
          priority: r.priority as Priority,
          notes: r.notes || "",
          followUpDate: r.followUpDate,
          followUpTime: r.followUpTime || undefined,
          lastCallOutcome: r.lastCallOutcome || undefined,
          totalCalls: r.totalCalls,
          createdAt: r.createdAt.toISOString().slice(0, 10),
        }));
      }

      // If DB table is empty, seed it
      for (const lead of INITIAL_SEED_LEADS) {
        await prisma.lead.create({
          data: {
            id: lead.id,
            name: lead.name,
            contactPerson: lead.contactPerson,
            phone: lead.phone,
            email: lead.email,
            city: lead.city,
            category: lead.category,
            googleRating: lead.googleRating,
            googleReviewsCount: lead.googleReviewsCount,
            websiteUrl: lead.websiteUrl,
            instagramUrl: lead.instagramUrl,
            source: lead.source,
            assignedCaller: lead.assignedCaller,
            status: lead.status,
            pipeline: lead.pipeline,
            priority: lead.priority,
            notes: lead.notes,
            followUpDate: lead.followUpDate,
            followUpTime: lead.followUpTime,
            lastCallOutcome: lead.lastCallOutcome,
            totalCalls: lead.totalCalls,
          },
        });
      }
      return INITIAL_SEED_LEADS;
    } catch (e) {
      console.warn("Prisma lead fetch failed, falling back to persistent server storage:", e);
    }
  }

  // Persistent server storage fallback
  let leads = ensureFileStorage();

  if (filter?.caller && filter.caller !== "All") {
    leads = leads.filter((l) => l.assignedCaller === filter.caller);
  }
  if (filter?.pipeline && filter.pipeline !== "All") {
    leads = leads.filter((l) => l.pipeline === filter.pipeline);
  }
  if (filter?.city && filter.city !== "All") {
    leads = leads.filter((l) => l.city === filter.city);
  }
  if (filter?.query) {
    const q = filter.query.toLowerCase();
    leads = leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.contactPerson.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
    );
  }

  return leads;
}

export async function getLeadById(id: string): Promise<LeadRecord | null> {
  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();
      const r = await prisma.lead.findUnique({ where: { id } });
      if (r) {
        return {
          id: r.id,
          name: r.name,
          contactPerson: r.contactPerson,
          phone: r.phone,
          email: r.email,
          city: r.city,
          category: r.category,
          googleRating: r.googleRating,
          googleReviewsCount: r.googleReviewsCount,
          websiteUrl: r.websiteUrl,
          instagramUrl: r.instagramUrl,
          source: r.source,
          assignedCaller: r.assignedCaller,
          status: r.status,
          pipeline: r.pipeline as PipelineStage,
          priority: r.priority as Priority,
          notes: r.notes || "",
          followUpDate: r.followUpDate,
          followUpTime: r.followUpTime || undefined,
          lastCallOutcome: r.lastCallOutcome || undefined,
          totalCalls: r.totalCalls,
          createdAt: r.createdAt.toISOString().slice(0, 10),
        };
      }
    } catch (e) {
      console.warn("Prisma getLeadById error, falling back to file DB:", e);
    }
  }

  const leads = ensureFileStorage();
  return leads.find((l) => l.id === id) || null;
}

export async function createLead(data: Omit<LeadRecord, "id" | "totalCalls" | "createdAt">): Promise<LeadRecord> {
  const newId = Date.now().toString();
  const createdDate = new Date().toISOString().slice(0, 10);
  const newLead: LeadRecord = {
    ...data,
    id: newId,
    totalCalls: 0,
    createdAt: createdDate,
  };

  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();
      const r = await prisma.lead.create({
        data: {
          id: newId,
          name: newLead.name,
          contactPerson: newLead.contactPerson,
          phone: newLead.phone,
          email: newLead.email || "",
          city: newLead.city || "",
          category: newLead.category || "",
          googleRating: newLead.googleRating || 0,
          googleReviewsCount: newLead.googleReviewsCount || 0,
          websiteUrl: newLead.websiteUrl || "",
          instagramUrl: newLead.instagramUrl || "",
          source: newLead.source || "Manual",
          assignedCaller: newLead.assignedCaller || "Priya Sharma",
          status: newLead.status || "New",
          pipeline: newLead.pipeline || "Lead",
          priority: newLead.priority || "Medium",
          notes: newLead.notes || "",
          followUpDate: newLead.followUpDate || "",
          followUpTime: newLead.followUpTime || null,
          totalCalls: 0,
        },
      });
      return {
        ...newLead,
        id: r.id,
      };
    } catch (e) {
      console.warn("Prisma createLead error, falling back to file DB:", e);
    }
  }

  const leads = ensureFileStorage();
  const updated = [newLead, ...leads];
  saveFileStorage(updated);
  return newLead;
}

export async function updateLead(id: string, updates: Partial<LeadRecord>): Promise<LeadRecord | null> {
  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();
      const prismaData: Record<string, unknown> = {};
      if (updates.name !== undefined) prismaData.name = updates.name;
      if (updates.contactPerson !== undefined) prismaData.contactPerson = updates.contactPerson;
      if (updates.phone !== undefined) prismaData.phone = updates.phone;
      if (updates.email !== undefined) prismaData.email = updates.email;
      if (updates.city !== undefined) prismaData.city = updates.city;
      if (updates.category !== undefined) prismaData.category = updates.category;
      if (updates.googleRating !== undefined) prismaData.googleRating = updates.googleRating;
      if (updates.googleReviewsCount !== undefined) prismaData.googleReviewsCount = updates.googleReviewsCount;
      if (updates.websiteUrl !== undefined) prismaData.websiteUrl = updates.websiteUrl;
      if (updates.instagramUrl !== undefined) prismaData.instagramUrl = updates.instagramUrl;
      if (updates.source !== undefined) prismaData.source = updates.source;
      if (updates.assignedCaller !== undefined) prismaData.assignedCaller = updates.assignedCaller;
      if (updates.status !== undefined) prismaData.status = updates.status;
      if (updates.pipeline !== undefined) prismaData.pipeline = updates.pipeline;
      if (updates.priority !== undefined) prismaData.priority = updates.priority;
      if (updates.notes !== undefined) prismaData.notes = updates.notes;
      if (updates.followUpDate !== undefined) prismaData.followUpDate = updates.followUpDate;
      if (updates.followUpTime !== undefined) prismaData.followUpTime = updates.followUpTime;
      if (updates.lastCallOutcome !== undefined) prismaData.lastCallOutcome = updates.lastCallOutcome;
      if (updates.totalCalls !== undefined) prismaData.totalCalls = updates.totalCalls;

      const r = await prisma.lead.update({
        where: { id },
        data: prismaData,
      });

      return {
        id: r.id,
        name: r.name,
        contactPerson: r.contactPerson,
        phone: r.phone,
        email: r.email,
        city: r.city,
        category: r.category,
        googleRating: r.googleRating,
        googleReviewsCount: r.googleReviewsCount,
        websiteUrl: r.websiteUrl,
        instagramUrl: r.instagramUrl,
        source: r.source,
        assignedCaller: r.assignedCaller,
        status: r.status,
        pipeline: r.pipeline as PipelineStage,
        priority: r.priority as Priority,
        notes: r.notes || "",
        followUpDate: r.followUpDate,
        followUpTime: r.followUpTime || undefined,
        lastCallOutcome: r.lastCallOutcome || undefined,
        totalCalls: r.totalCalls,
        createdAt: r.createdAt.toISOString().slice(0, 10),
      };
    } catch (e) {
      console.warn("Prisma updateLead error, falling back to file DB:", e);
    }
  }

  const leads = ensureFileStorage();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  leads[idx] = { ...leads[idx], ...updates };
  saveFileStorage(leads);
  return leads[idx];
}

export async function deleteLead(id: string): Promise<boolean> {
  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();
      await prisma.lead.delete({ where: { id } });
      return true;
    } catch (e) {
      console.warn("Prisma deleteLead error, falling back to file DB:", e);
    }
  }

  const leads = ensureFileStorage();
  const filtered = leads.filter((l) => l.id !== id);
  saveFileStorage(filtered);
  return true;
}

