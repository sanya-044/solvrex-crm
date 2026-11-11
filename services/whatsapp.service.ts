import fs from "node:fs";
import path from "node:path";
import { getPrismaClient } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export interface WhatsAppMessageRecord {
  id: string;
  conversationId: string;
  senderType: "INBOUND" | "OUTBOUND";
  senderName: string;
  text: string;
  status: "SENT" | "DELIVERED" | "READ" | "FAILED";
  waMessageId?: string;
  createdAt: string;
}

export interface WhatsAppConversationRecord {
  id: string;
  leadId: string | null;
  leadName: string;
  phoneNumber: string;
  assignedCaller: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  lead?: {
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
    pipeline: string;
    priority: string;
    notes: string;
    followUpDate: string;
    followUpTime?: string;
  } | null;
  messages: WhatsAppMessageRecord[];
}

export const INITIAL_SEED_CONVERSATIONS: WhatsAppConversationRecord[] = [
  {
    id: "conv_1",
    leadId: "1",
    leadName: "Old Town Cafe & Roastery",
    phoneNumber: "+91 98765 43210",
    assignedCaller: "Priya Sharma",
    lastMessageText: "Tomorrow 11:30 AM works well for me. Please send the meeting invite.",
    lastMessageAt: "2026-11-11T10:45:00.000Z",
    unreadCount: 1,
    messages: [
      {
        id: "msg_1_1",
        conversationId: "conv_1",
        senderType: "OUTBOUND",
        senderName: "Priya Sharma",
        text: "Hello Rohan! 👋 This is Priya from Solvrex Solutions. Thank you for connecting with us regarding the automated WhatsApp booking system for Old Town Cafe.",
        status: "READ",
        waMessageId: "wamid_demo_101",
        createdAt: "2026-11-10T14:30:00.000Z",
      },
      {
        id: "msg_1_2",
        conversationId: "conv_1",
        senderType: "INBOUND",
        senderName: "Rohan Das",
        text: "Hi Priya, thanks for reaching out. Can you share the pricing structure for weekend promo campaigns and reservation reminders?",
        status: "READ",
        waMessageId: "wamid_demo_102",
        createdAt: "2026-11-10T15:10:00.000Z",
      },
      {
        id: "msg_1_3",
        conversationId: "conv_1",
        senderType: "OUTBOUND",
        senderName: "Priya Sharma",
        text: "Certainly! For cafes doing 40+ weekend covers, our automated reservation reminder reduces no-shows by 45%. We also have 1-click WhatsApp loyalty broadcast integrations.",
        status: "DELIVERED",
        waMessageId: "wamid_demo_103",
        createdAt: "2026-11-10T15:25:00.000Z",
      },
      {
        id: "msg_1_4",
        conversationId: "conv_1",
        senderType: "INBOUND",
        senderName: "Rohan Das",
        text: "Tomorrow 11:30 AM works well for me. Please send the meeting invite.",
        status: "DELIVERED",
        waMessageId: "wamid_demo_104",
        createdAt: "2026-11-11T10:45:00.000Z",
      },
    ],
  },
  {
    id: "conv_2",
    leadId: "2",
    leadName: "Dr. Smile Dental Studio",
    phoneNumber: "+91 98123 45678",
    assignedCaller: "Priya Sharma",
    lastMessageText: "Confirmed! We will review the implant follow-up system on Thursday.",
    lastMessageAt: "2026-11-11T09:15:00.000Z",
    unreadCount: 0,
    messages: [
      {
        id: "msg_2_1",
        conversationId: "conv_2",
        senderType: "OUTBOUND",
        senderName: "Priya Sharma",
        text: "Hello Dr. Priya Sen, following up on our call. Here is the case study on how clinics automate post-procedure check-ins on WhatsApp.",
        status: "READ",
        waMessageId: "wamid_demo_201",
        createdAt: "2026-11-09T11:00:00.000Z",
      },
      {
        id: "msg_2_2",
        conversationId: "conv_2",
        senderType: "INBOUND",
        senderName: "Dr. Priya Sen",
        text: "Confirmed! We will review the implant follow-up system on Thursday.",
        status: "READ",
        waMessageId: "wamid_demo_202",
        createdAt: "2026-11-11T09:15:00.000Z",
      },
    ],
  },
  {
    id: "conv_3",
    leadId: "3",
    leadName: "Skyline Luxury Estates",
    phoneNumber: "+91 99887 76655",
    assignedCaller: "Rahul Verma",
    lastMessageText: "Please send the enterprise proposal for 15 sales caller seats.",
    lastMessageAt: "2026-11-10T16:20:00.000Z",
    unreadCount: 1,
    messages: [
      {
        id: "msg_3_1",
        conversationId: "conv_3",
        senderType: "OUTBOUND",
        senderName: "Rahul Verma",
        text: "Hello Amitabh Ji, Rahul here from Solvrex. Discussed the caller licenses pilot for Skyline Luxury Estates.",
        status: "READ",
        waMessageId: "wamid_demo_301",
        createdAt: "2026-11-10T14:00:00.000Z",
      },
      {
        id: "msg_3_2",
        conversationId: "conv_3",
        senderType: "INBOUND",
        senderName: "Amitabh Mehra",
        text: "Please send the enterprise proposal for 15 sales caller seats.",
        status: "DELIVERED",
        waMessageId: "wamid_demo_302",
        createdAt: "2026-11-10T16:20:00.000Z",
      },
    ],
  },
  {
    id: "conv_4",
    leadId: "5",
    leadName: "Artisan Woodcraft & Interiors",
    phoneNumber: "+91 97654 32109",
    assignedCaller: "Priya Sharma",
    lastMessageText: "Hi Priya, could you share the modular kitchen inquiry catalog on WhatsApp?",
    lastMessageAt: "2026-11-11T08:30:00.000Z",
    unreadCount: 1,
    messages: [
      {
        id: "msg_4_1",
        conversationId: "conv_4",
        senderType: "INBOUND",
        senderName: "Kavita Rao",
        text: "Hi Priya, could you share the modular kitchen inquiry catalog on WhatsApp?",
        status: "DELIVERED",
        waMessageId: "wamid_demo_401",
        createdAt: "2026-11-11T08:30:00.000Z",
      },
    ],
  },
  {
    id: "conv_5",
    leadId: "4",
    leadName: "Grounded Wellness Spa & Gym",
    phoneNumber: "+91 98450 11223",
    assignedCaller: "Ankit Patel",
    lastMessageText: "Payment for the yearly plan is activated. Thank you!",
    lastMessageAt: "2026-11-09T17:00:00.000Z",
    unreadCount: 0,
    messages: [
      {
        id: "msg_5_1",
        conversationId: "conv_5",
        senderType: "OUTBOUND",
        senderName: "Ankit Patel",
        text: "Hello Aman Preet Ji! Contract confirmed for Grounded Wellness.",
        status: "READ",
        waMessageId: "wamid_demo_501",
        createdAt: "2026-11-09T16:30:00.000Z",
      },
      {
        id: "msg_5_2",
        conversationId: "conv_5",
        senderType: "INBOUND",
        senderName: "Aman Preet Singh",
        text: "Payment for the yearly plan is activated. Thank you!",
        status: "READ",
        waMessageId: "wamid_demo_502",
        createdAt: "2026-11-09T17:00:00.000Z",
      },
    ],
  },
];

const DATA_DIR = path.join(process.cwd(), ".data");
const WHATSAPP_FILE = path.join(DATA_DIR, "crm_whatsapp.json");

function ensureFileStorage(): WhatsAppConversationRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(WHATSAPP_FILE)) {
      fs.writeFileSync(WHATSAPP_FILE, JSON.stringify(INITIAL_SEED_CONVERSATIONS, null, 2), "utf-8");
      return INITIAL_SEED_CONVERSATIONS;
    }
    const content = fs.readFileSync(WHATSAPP_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    fs.writeFileSync(WHATSAPP_FILE, JSON.stringify(INITIAL_SEED_CONVERSATIONS, null, 2), "utf-8");
    return INITIAL_SEED_CONVERSATIONS;
  } catch (error) {
    console.error("WhatsApp File DB read error:", error);
    return INITIAL_SEED_CONVERSATIONS;
  }
}

function saveFileStorage(conversations: WhatsAppConversationRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(WHATSAPP_FILE, JSON.stringify(conversations, null, 2), "utf-8");
  } catch (error) {
    console.error("WhatsApp File DB write error:", error);
  }
}

function isDbAvailable(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && !url.includes("YOUR_NEON_PASSWORD"));
}

export async function getAllConversations(filter?: {
  caller?: string;
  query?: string;
  unreadOnly?: boolean;
}): Promise<WhatsAppConversationRecord[]> {
  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();

      const count = await prisma.whatsAppConversation.count();
      if (count === 0) {
        // Seed database with initial threads
        for (const seed of INITIAL_SEED_CONVERSATIONS) {
          // Verify if leadId actually exists in database before connecting
          let validLeadId: string | null = null;
          if (seed.leadId) {
            const exists = await prisma.lead.findUnique({ where: { id: seed.leadId } });
            if (exists) validLeadId = exists.id;
          }

          const conv = await prisma.whatsAppConversation.create({
            data: {
              id: seed.id,
              leadId: validLeadId,
              leadName: seed.leadName,
              phoneNumber: seed.phoneNumber,
              assignedCaller: seed.assignedCaller,
              lastMessageText: seed.lastMessageText,
              lastMessageAt: new Date(seed.lastMessageAt),
              unreadCount: seed.unreadCount,
            },
          });

          for (const m of seed.messages) {
            await prisma.whatsAppMessage.create({
              data: {
                id: m.id,
                conversationId: conv.id,
                senderType: m.senderType,
                senderName: m.senderName,
                text: m.text,
                status: m.status,
                waMessageId: m.waMessageId || null,
                createdAt: new Date(m.createdAt),
              },
            });
          }
        }
      }

      const where: Record<string, unknown> = {};
      if (filter?.caller && filter.caller !== "All") {
        where.assignedCaller = { equals: filter.caller, mode: "insensitive" };
      }
      if (filter?.unreadOnly) {
        where.unreadCount = { gt: 0 };
      }

      const rows = await prisma.whatsAppConversation.findMany({
        where,
        include: {
          lead: true,
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { lastMessageAt: "desc" },
      });

      let results: WhatsAppConversationRecord[] = rows.map((r) => ({
        id: r.id,
        leadId: r.leadId,
        leadName: r.leadName,
        phoneNumber: r.phoneNumber,
        assignedCaller: r.assignedCaller || "Unassigned",
        lastMessageText: r.lastMessageText || "",
        lastMessageAt: r.lastMessageAt.toISOString(),
        unreadCount: r.unreadCount,
        lead: r.lead
          ? {
              id: r.lead.id,
              name: r.lead.name,
              contactPerson: r.lead.contactPerson,
              phone: r.lead.phone,
              email: r.lead.email,
              city: r.lead.city,
              category: r.lead.category,
              googleRating: r.lead.googleRating,
              googleReviewsCount: r.lead.googleReviewsCount,
              websiteUrl: r.lead.websiteUrl,
              instagramUrl: r.lead.instagramUrl,
              pipeline: r.lead.pipeline,
              priority: r.lead.priority,
              notes: r.lead.notes || "",
              followUpDate: r.lead.followUpDate,
              followUpTime: r.lead.followUpTime || undefined,
            }
          : null,
        messages: r.messages.map((m) => ({
          id: m.id,
          conversationId: m.conversationId,
          senderType: m.senderType as "INBOUND" | "OUTBOUND",
          senderName: m.senderName || "",
          text: m.text,
          status: m.status as "SENT" | "DELIVERED" | "READ" | "FAILED",
          waMessageId: m.waMessageId || undefined,
          createdAt: m.createdAt.toISOString(),
        })),
      }));

      if (filter?.query) {
        const q = filter.query.toLowerCase();
        results = results.filter(
          (c) =>
            c.leadName.toLowerCase().includes(q) ||
            c.phoneNumber.includes(q) ||
            c.lastMessageText.toLowerCase().includes(q) ||
            c.lead?.contactPerson?.toLowerCase().includes(q)
        );
      }

      return results;
    } catch (err) {
      console.warn("Prisma WhatsApp fetch failed, falling back to persistent file DB:", err);
    }
  }

  // Fallback file storage
  let conversations = ensureFileStorage();
  if (filter?.caller && filter.caller !== "All") {
    conversations = conversations.filter(
      (c) => c.assignedCaller?.toLowerCase() === filter.caller?.toLowerCase()
    );
  }
  if (filter?.unreadOnly) {
    conversations = conversations.filter((c) => c.unreadCount > 0);
  }
  if (filter?.query) {
    const q = filter.query.toLowerCase();
    conversations = conversations.filter(
      (c) =>
        c.leadName.toLowerCase().includes(q) ||
        c.phoneNumber.includes(q) ||
        c.lastMessageText.toLowerCase().includes(q)
    );
  }

  return conversations;
}

export async function getConversationById(id: string): Promise<WhatsAppConversationRecord | null> {
  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();
      const r = await prisma.whatsAppConversation.findUnique({
        where: { id },
        include: {
          lead: true,
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (r) {
        return {
          id: r.id,
          leadId: r.leadId,
          leadName: r.leadName,
          phoneNumber: r.phoneNumber,
          assignedCaller: r.assignedCaller || "Unassigned",
          lastMessageText: r.lastMessageText || "",
          lastMessageAt: r.lastMessageAt.toISOString(),
          unreadCount: r.unreadCount,
          lead: r.lead
            ? {
                id: r.lead.id,
                name: r.lead.name,
                contactPerson: r.lead.contactPerson,
                phone: r.lead.phone,
                email: r.lead.email,
                city: r.lead.city,
                category: r.lead.category,
                googleRating: r.lead.googleRating,
                googleReviewsCount: r.lead.googleReviewsCount,
                websiteUrl: r.lead.websiteUrl,
                instagramUrl: r.lead.instagramUrl,
                pipeline: r.lead.pipeline,
                priority: r.lead.priority,
                notes: r.lead.notes || "",
                followUpDate: r.lead.followUpDate,
                followUpTime: r.lead.followUpTime || undefined,
              }
            : null,
          messages: r.messages.map((m) => ({
            id: m.id,
            conversationId: m.conversationId,
            senderType: m.senderType as "INBOUND" | "OUTBOUND",
            senderName: m.senderName || "",
            text: m.text,
            status: m.status as "SENT" | "DELIVERED" | "READ" | "FAILED",
            waMessageId: m.waMessageId || undefined,
            createdAt: m.createdAt.toISOString(),
          })),
        };
      }
    } catch (err) {
      console.warn("Prisma getConversationById error, using file storage fallback:", err);
    }
  }

  const list = ensureFileStorage();
  return list.find((c) => c.id === id) || null;
}

export async function createConversation(params: {
  leadId?: string;
  leadName: string;
  phoneNumber: string;
  assignedCaller?: string;
  initialMessage?: string;
}): Promise<WhatsAppConversationRecord> {
  const newId = `conv_${Date.now()}`;
  const now = new Date();

  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();
      let validLeadId: string | null = null;
      if (params.leadId) {
        const lead = await prisma.lead.findUnique({ where: { id: params.leadId } });
        if (lead) validLeadId = lead.id;
      }

      const row = await prisma.whatsAppConversation.create({
        data: {
          id: newId,
          leadId: validLeadId,
          leadName: params.leadName,
          phoneNumber: params.phoneNumber,
          assignedCaller: params.assignedCaller || "Priya Sharma",
          lastMessageText: params.initialMessage || "Conversation started",
          lastMessageAt: now,
          unreadCount: 0,
        },
        include: { lead: true, messages: true },
      });

      if (params.initialMessage) {
        await prisma.whatsAppMessage.create({
          data: {
            id: `msg_${Date.now()}`,
            conversationId: row.id,
            senderType: "OUTBOUND",
            senderName: params.assignedCaller || "Agent",
            text: params.initialMessage,
            status: "DELIVERED",
          },
        });
      }

      return (await getConversationById(row.id))!;
    } catch (err) {
      console.warn("Prisma createConversation error, using file DB:", err);
    }
  }

  const list = ensureFileStorage();
  const newConv: WhatsAppConversationRecord = {
    id: newId,
    leadId: params.leadId || null,
    leadName: params.leadName,
    phoneNumber: params.phoneNumber,
    assignedCaller: params.assignedCaller || "Priya Sharma",
    lastMessageText: params.initialMessage || "Conversation started",
    lastMessageAt: now.toISOString(),
    unreadCount: 0,
    messages: params.initialMessage
      ? [
          {
            id: `msg_${Date.now()}`,
            conversationId: newId,
            senderType: "OUTBOUND",
            senderName: params.assignedCaller || "Agent",
            text: params.initialMessage,
            status: "DELIVERED",
            createdAt: now.toISOString(),
          },
        ]
      : [],
  };

  saveFileStorage([newConv, ...list]);
  return newConv;
}

export async function sendChatMessage(params: {
  conversationId: string;
  text: string;
  senderName: string;
}): Promise<WhatsAppMessageRecord> {
  const conversation = await getConversationById(params.conversationId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Attempt Meta Cloud API dispatch (or mock if not configured)
  const dispatchResult = await sendWhatsAppMessage({
    to: conversation.phoneNumber,
    text: params.text,
  });

  const messageId = `msg_${Date.now()}`;
  const now = new Date();
  const status = dispatchResult.success ? "DELIVERED" : "FAILED";

  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();

      const msg = await prisma.whatsAppMessage.create({
        data: {
          id: messageId,
          conversationId: params.conversationId,
          senderType: "OUTBOUND",
          senderName: params.senderName,
          text: params.text,
          status,
          waMessageId: dispatchResult.messageId || null,
          createdAt: now,
        },
      });

      await prisma.whatsAppConversation.update({
        where: { id: params.conversationId },
        data: {
          lastMessageText: params.text,
          lastMessageAt: now,
        },
      });

      return {
        id: msg.id,
        conversationId: msg.conversationId,
        senderType: "OUTBOUND",
        senderName: msg.senderName || params.senderName,
        text: msg.text,
        status: msg.status as "SENT" | "DELIVERED" | "READ" | "FAILED",
        waMessageId: msg.waMessageId || undefined,
        createdAt: msg.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma sendChatMessage error, updating file storage:", err);
    }
  }

  const list = ensureFileStorage();
  const idx = list.findIndex((c) => c.id === params.conversationId);
  const newMsg: WhatsAppMessageRecord = {
    id: messageId,
    conversationId: params.conversationId,
    senderType: "OUTBOUND",
    senderName: params.senderName,
    text: params.text,
    status,
    waMessageId: dispatchResult.messageId,
    createdAt: now.toISOString(),
  };

  if (idx !== -1) {
    list[idx].messages.push(newMsg);
    list[idx].lastMessageText = params.text;
    list[idx].lastMessageAt = now.toISOString();
    saveFileStorage(list);
  }

  return newMsg;
}

export async function markConversationRead(conversationId: string): Promise<boolean> {
  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();
      await prisma.whatsAppConversation.update({
        where: { id: conversationId },
        data: { unreadCount: 0 },
      });
      return true;
    } catch (err) {
      console.warn("Prisma markConversationRead error:", err);
    }
  }

  const list = ensureFileStorage();
  const idx = list.findIndex((c) => c.id === conversationId);
  if (idx !== -1) {
    list[idx].unreadCount = 0;
    saveFileStorage(list);
  }
  return true;
}

export async function receiveInboundWhatsAppMessage(params: {
  fromPhone: string;
  text: string;
  waMessageId?: string;
}): Promise<WhatsAppMessageRecord> {
  const cleanPhone = params.fromPhone.replace(/\D/g, "");
  const now = new Date();

  if (isDbAvailable()) {
    try {
      const prisma = getPrismaClient();
      // Look for conversation by phone number digits
      let conv = await prisma.whatsAppConversation.findFirst({
        where: {
          phoneNumber: {
            contains: cleanPhone.slice(-10),
          },
        },
      });

      if (!conv) {
        // Try matching with Lead
        const lead = await prisma.lead.findFirst({
          where: {
            phone: { contains: cleanPhone.slice(-10) },
          },
        });

        conv = await prisma.whatsAppConversation.create({
          data: {
            id: `conv_${Date.now()}`,
            leadId: lead?.id || null,
            leadName: lead?.name || `Customer (+${cleanPhone})`,
            phoneNumber: `+${cleanPhone}`,
            assignedCaller: lead?.assignedCaller || "Priya Sharma",
            lastMessageText: params.text,
            lastMessageAt: now,
            unreadCount: 1,
          },
        });
      } else {
        await prisma.whatsAppConversation.update({
          where: { id: conv.id },
          data: {
            lastMessageText: params.text,
            lastMessageAt: now,
            unreadCount: { increment: 1 },
          },
        });
      }

      const msg = await prisma.whatsAppMessage.create({
        data: {
          id: `msg_${Date.now()}`,
          conversationId: conv.id,
          senderType: "INBOUND",
          senderName: conv.leadName,
          text: params.text,
          status: "DELIVERED",
          waMessageId: params.waMessageId || null,
          createdAt: now,
        },
      });

      return {
        id: msg.id,
        conversationId: msg.conversationId,
        senderType: "INBOUND",
        senderName: msg.senderName || conv.leadName,
        text: msg.text,
        status: "DELIVERED",
        waMessageId: msg.waMessageId || undefined,
        createdAt: msg.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn("Prisma receiveInbound error:", err);
    }
  }

  const list = ensureFileStorage();
  let conv = list.find((c) => c.phoneNumber.replace(/\D/g, "").includes(cleanPhone.slice(-10)));
  const msgId = `msg_${Date.now()}`;
  const newMsg: WhatsAppMessageRecord = {
    id: msgId,
    conversationId: conv?.id || `conv_${Date.now()}`,
    senderType: "INBOUND",
    senderName: conv?.leadName || "Customer",
    text: params.text,
    status: "DELIVERED",
    waMessageId: params.waMessageId,
    createdAt: now.toISOString(),
  };

  if (!conv) {
    const createdConv: WhatsAppConversationRecord = {
      id: newMsg.conversationId,
      leadId: null,
      leadName: `Customer (+${cleanPhone})`,
      phoneNumber: `+${cleanPhone}`,
      assignedCaller: "Priya Sharma",
      lastMessageText: params.text,
      lastMessageAt: now.toISOString(),
      unreadCount: 1,
      messages: [newMsg],
    };
    saveFileStorage([createdConv, ...list]);
  } else {
    conv.messages.push(newMsg);
    conv.lastMessageText = params.text;
    conv.lastMessageAt = now.toISOString();
    conv.unreadCount += 1;
    saveFileStorage(list);
  }

  return newMsg;
}

