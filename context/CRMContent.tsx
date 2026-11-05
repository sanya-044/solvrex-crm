"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

export type PipelineStage =
  | "Lead"
  | "Contacted"
  | "Proposal"
  | "Negotiation"
  | "Meeting Booked"
  | "Won"
  | "Lost";

export type CallOutcome =
  | "Not answered"
  | "Busy"
  | "Call back"
  | "Interested"
  | "Not interested"
  | "Wrong number"
  | "Meeting booked"
  | "Won";

export const OUTCOMES: CallOutcome[] = [
  "Not answered",
  "Busy",
  "Call back",
  "Interested",
  "Not interested",
  "Wrong number",
  "Meeting booked",
  "Won",
];

export type Priority = "High" | "Medium" | "Low";

export const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

export function stageAfterCall(outcome: string, currentStage?: string): PipelineStage {
  if (outcome === "Won") return "Won";
  if (outcome === "Meeting booked") return "Meeting Booked";
  if (outcome === "Interested" && (!currentStage || currentStage === "Lead")) return "Proposal";
  return (currentStage as PipelineStage) || "Lead";
}

export interface Lead {
  id: string;
  name: string; // Business name
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
  followUpDate: string; // YYYY-MM-DD
  followUpTime?: string; // HH:MM
  lastCallOutcome?: CallOutcome | string;
  totalCalls: number;
  createdAt: string;
}

export interface CallLog {
  id: string;
  leadId: string;
  leadName: string;
  callerName: string;
  date: string; // ISO string or formatted
  outcome: CallOutcome;
  duration: string; // e.g. "02:45"
  durationSeconds: number;
  notes: string;
  recordingUrl?: string;
  nextFollowUp?: string;
  priority?: Priority;
}

export interface MessageTemplate {
  id: string;
  title: string;
  language: "English" | "Hindi";
  channel: "WhatsApp" | "Email";
  content: string;
}

export interface ScriptSection {
  id: string;
  title: string;
  language: "English" | "Hindi";
  category: "Opening" | "Value Prop" | "Objection Handling" | "Closing";
  script: string;
  bullets?: string[];
}

export interface CallerMember {
  id: string;
  name: string;
  email: string;
  role: "Caller" | "Manager" | "Admin";
  targetCallsPerDay: number;
}

export const CALLER_TEAM: CallerMember[] = [
  { id: "c1", name: "Priya Sharma", email: "priya@solvrex.com", role: "Caller", targetCallsPerDay: 50 },
  { id: "c2", name: "Rahul Verma", email: "rahul@solvrex.com", role: "Manager", targetCallsPerDay: 40 },
  { id: "c3", name: "Ankit Patel", email: "ankit@solvrex.com", role: "Caller", targetCallsPerDay: 45 },
  { id: "c4", name: "Neha Gupta", email: "neha@solvrex.com", role: "Caller", targetCallsPerDay: 50 },
];

export const TEAM = CALLER_TEAM;

export const SAVED_TEMPLATES: MessageTemplate[] = [
  {
    id: "wa-en-intro",
    title: "Intro Pitch & Portfolio (English)",
    language: "English",
    channel: "WhatsApp",
    content:
      "Hello {contact_name}! 👋\n\nThis is {caller_name} from Solvrex Solutions. We recently checked out {business_name} on Google and noticed high customer interest. We help premium businesses acquire 25-40% more inbound clients through custom automated lead funnels and local SEO.\n\nWould you be open to a quick 10-minute demo this Thursday? Here is a link to our recent client case studies: https://solvrex.com/cases\n\nBest regards,\n{caller_name}",
  },
  {
    id: "wa-hi-intro",
    title: "Intro & WhatsApp Portfolio (Hinglish)",
    language: "Hindi",
    channel: "WhatsApp",
    content:
      "नमस्ते {contact_name} जी! 🙏\n\nमैं {caller_name}, Solvrex Solutions से बात कर रहा हूँ। हमने {business_name} की Google प्रोफाइल देखी। आपका काम बहुत बढ़िया है!\n\nहम आपके जैसे प्रीमियम बिज़नेस के लिए Google और Social Media से रोज़ नए कस्टमर्स लाने में मदद करते हैं। क्या हम 10 मिनट के क्विक कॉल पर समझ सकते हैं कि यह आपके लिए कैसे काम करेगा?\n\nहमारा छोटा पोर्टफोलियो यहाँ देखें: https://solvrex.com/portfolio\n\nधन्यवाद,\n{caller_name}",
  },
  {
    id: "wa-en-followup",
    title: "Follow-up After Call (English)",
    language: "English",
    channel: "WhatsApp",
    content:
      "Hi {contact_name}, great speaking with you earlier regarding {business_name}! As discussed, I am sharing our solution overview and pricing plans. Please let me know if 3:00 PM tomorrow works for our calendar meeting.\n\nMeeting link: https://meet.google.com/abc-xyz\n\nThanks, {caller_name}",
  },
  {
    id: "wa-hi-busy",
    title: "Busy Callback Followup (Hindi)",
    language: "Hindi",
    channel: "WhatsApp",
    content:
      "नमस्ते {contact_name} जी, मैंने अभी आपको कॉल किया था पर आप व्यस्त लग रहे थे। कोई बात नहीं, मैंने {business_name} के लिए कुछ महत्वपूर्ण डिटेल्स इस मैसेज में छोड़ी हैं। जब भी आप फ्री हों, कृपया मुझे बताएं। हम फिर बात करेंगे! धन्यवाद - {caller_name}",
  },
  {
    id: "email-proposal",
    title: "Official Pitch & Proposal Deck (Email)",
    language: "English",
    channel: "Email",
    content:
      "Subject: Growth Strategy & Digital Systems for {business_name}\n\nHi {contact_name},\n\nIt was a pleasure reaching out. Following our brief conversation, I have put together a bespoke 4-step action plan for {business_name} to double your high-ticket client inquiries.\n\nAttached is our executive summary. Let me know when suits you best for a 15-minute walkthrough.\n\nWarm regards,\n{caller_name}\nSolvrex CRM Solutions",
  },
];

export const PITCH_SCRIPTS: ScriptSection[] = [
  {
    id: "s1",
    title: "1. Confident Opening (Hook)",
    language: "English",
    category: "Opening",
    script:
      '"Hi {contact_name}, this is {caller_name} from Solvrex. I know you weren\'t expecting my call, so I\'ll be brief. I\'m calling specifically because I saw {business_name} in {city} has great Google ratings ({rating}★), and we\'ve been helping similar businesses generate 30+ qualified high-ticket leads each month. Did I catch you with 45 seconds to explain why?"',
    bullets: [
      "Keep tone relaxed, cheerful, and unhurried.",
      "Acknowledge the interruption immediately to drop their guard.",
      "Mention their actual Google rating and city.",
    ],
  },
  {
    id: "s2",
    title: "1. ओपनिंग हुक (Hinglish / Hindi)",
    language: "Hindi",
    category: "Opening",
    script:
      '"नमस्ते {contact_name} जी, मैं {caller_name} बात कर रहा हूँ Solvrex Solutions से। मुझे पता है आप व्यस्त होंगे, इसलिए सिर्फ 1 मिनट लूँगा। मैंने देखा कि {city} में {business_name} की बहुत अच्छी रेटिंग ({rating}★) है। हम आपके जैसे प्रीमियम बिज़नेसेस को हर महीने 30-40 नए डायरेक्ट ग्राहक लाने में मदद करते हैं। क्या मैं 30 सेकंड में बता सकता हूँ कि कैसे?"',
    bullets: [
      "आदरपूर्वक बात करें ('जी' और 'आप' का प्रयोग करें)।",
      "उनकी रेटिंग और शहर का नाम ज़रूर लें।",
    ],
  },
  {
    id: "s3",
    title: "2. Value Proposition (Problem vs Solution)",
    language: "English",
    category: "Value Prop",
    script:
      '"Most businesses in your space lose up to 40% of incoming callers because there\'s no instant WhatsApp follow-up or smart callback system. We deploy a plug-and-play caller hub that ensures zero lost leads and books meetings directly into your calendar."',
    bullets: [
      "Focus on lost revenue from missed calls.",
      "Highlight automated speed-to-lead.",
    ],
  },
  {
    id: "s4",
    title: "3. Objection: 'Send details on WhatsApp'",
    language: "English",
    category: "Objection Handling",
    script:
      '"I\'d love to do that right away, {contact_name}! I have a customized 2-page PDF ready for {business_name}. So that I send only what\'s relevant—are you currently looking to expand your customer base this quarter, or are you at full capacity?"',
    bullets: [
      "Agree first (never argue).",
      "Ask a qualifying question before sending.",
    ],
  },
  {
    id: "s5",
    title: "3. आपत्ति: 'व्हाट्सएप पर डिटेल्स भेज दो'",
    language: "Hindi",
    category: "Objection Handling",
    script:
      '"बिल्कुल {contact_name} जी! मैं अभी इस नंबर पर ब्रोशर भेज देता हूँ। बस एक छोटा सवाल—अभी आप नए कस्टमर्स को टारगेट कर रहे हैं या आपकी कैपेसिटी फुल है? ताकि मैं बिल्कुल सटीक जानकारी भेज सकूँ।"',
    bullets: ["तुरंत सहमति दें, फिर एक सवाल पूछकर बातचीत जारी रखें।"],
  },
  {
    id: "s6",
    title: "4. Objection: 'Already have an agency / vendor'",
    language: "English",
    category: "Objection Handling",
    script:
      '"That\'s fantastic! Most of our best clients were already working with someone when we first met. We don\'t ask you to replace them—we just show you where our automated follow-up tool adds 20-30% extra conversions on top of what you\'re already getting. What day works for a quick screen share?"',
  },
  {
    id: "s7",
    title: "5. Closing for Meeting Booked",
    language: "English",
    category: "Closing",
    script:
      '"I don\'t expect you to take my word for it today. How about a 10-minute live preview on Zoom/Google Meet? I have Thursday at 3 PM or Friday at 11 AM—which one works better for you?"',
  },
];

const initialLeads: Lead[] = [
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
    category: "Cafe & Restaurant",
    googleRating: 4.2,
    googleReviewsCount: 65,
    websiteUrl: "",
    instagramUrl: "https://instagram.com/urbanbites",
    source: "Google Maps",
    assignedCaller: "Neha Gupta",
    status: "Contacted",
    pipeline: "Contacted",
    priority: "Low",
    notes: "Answered call, asked to send catalog on WhatsApp.",
    followUpDate: "2026-11-05",
    followUpTime: "12:00",
    lastCallOutcome: "Interested",
    totalCalls: 1,
    createdAt: "2026-11-02",
  },
  {
    id: "7",
    name: "Krystal Eye Care & Laser Clinic",
    contactPerson: "Dr. Rajesh Kulkarni",
    phone: "+91 99223 34455",
    email: "drrajesh@krystaleyecare.com",
    city: "Pune",
    category: "Dental Clinic",
    googleRating: 4.9,
    googleReviewsCount: 310,
    websiteUrl: "https://krystaleye.example.com",
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

const initialCalls: CallLog[] = [
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

interface CRMContextType {
  leads: Lead[];
  calls: CallLog[];
  selectedCallerFilter: string; // "All" or caller name
  setSelectedCallerFilter: (caller: string) => void;
  userRole: "Admin" | "Caller";
  setUserRole: (role: "Admin" | "Caller") => void;
  activeCallerName: string;
  setActiveCallerName: (name: string) => void;
  currentUser: { name: string; role: string };
  setCurrentUser: (u: { name: string; role: string }) => void;
  // Lead Operations
  addLead: (lead: Omit<Lead, "id" | "totalCalls" | "createdAt">) => Lead;
  updateLead: (id: string, updated: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  reassignLead: (id: string, newCaller: string) => void;
  // Call Operations
  addCallLog: (call: Omit<CallLog, "id">) => CallLog;
  getLeadById: (id: string) => Lead | undefined;
  getCallsForLead: (leadId: string) => CallLog[];
  // CSV Operations
  exportLeadsCSV: () => void;
  importLeadsCSV: (csvText: string) => { added: number; errors: string[] };
  // Stats
  stats: {
    callsToday: number;
    callsThisWeek: number;
    callsThisMonth: number;
    connectRate: number;
    conversionRate: number;
    pipelineCount: Record<PipelineStage, number>;
    followupsDueToday: Lead[];
    callerLeaderboard: {
      callerName: string;
      callsMade: number;
      connected: number;
      meetingsBooked: number;
      won: number;
      connectRate: number;
      conversionRate: number;
    }[];
  };
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [calls, setCalls] = useState<CallLog[]>(initialCalls);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedCallerFilter, setSelectedCallerFilter] = useState<string>("All");
  const [userRole, setUserRole] = useState<"Admin" | "Caller">("Admin");
  const [activeCallerName, setActiveCallerName] = useState<string>("Priya Sharma");

  // Load from database on mount
  useEffect(() => {
    let isMounted = true;
    async function loadFromDatabase() {
      try {
        setIsLoading(true);
        // Fetch leads from database API
        const leadsRes = await fetch("/api/leads", { cache: "no-store" });
        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          if (isMounted && leadsData.leads && Array.isArray(leadsData.leads)) {
            setLeads(leadsData.leads);
          }
        }

        // Fetch calls from database API
        const callsRes = await fetch("/api/calls", { cache: "no-store" });
        if (callsRes.ok) {
          const callsData = await callsRes.json();
          if (isMounted && callsData.calls && Array.isArray(callsData.calls)) {
            setCalls(callsData.calls);
          }
        }
      } catch (err) {
        console.warn("Could not load initial CRM data from database:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadFromDatabase();
    return () => {
      isMounted = false;
    };
  }, []);

  const addLead = (lead: Omit<Lead, "id" | "totalCalls" | "createdAt">): Lead => {
    const newLead: Lead = {
      ...lead,
      id: Date.now().toString(),
      totalCalls: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    // Optimistic UI update
    setLeads((prev) => [newLead, ...prev]);

    // Persist to database API
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLead),
    }).catch((err) => console.error("Failed to save lead to database API:", err));

    return newLead;
  };

  const updateLead = (id: string, updated: Partial<Lead>) => {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updated } : l)),
    );

    // Persist to database API
    fetch(`/api/leads/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch((err) => console.error("Failed to update lead in database API:", err));
  };

  const deleteLead = (id: string) => {
    // Optimistic UI update
    setLeads((prev) => prev.filter((l) => l.id !== id));

    // Persist to database API
    fetch(`/api/leads/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch((err) => console.error("Failed to delete lead from database API:", err));
  };

  const reassignLead = (id: string, newCaller: string) => {
    updateLead(id, { assignedCaller: newCaller });
  };

  const addCallLog = (call: Omit<CallLog, "id">): CallLog => {
    const newCall: CallLog = {
      ...call,
      id: "call-" + Date.now().toString(),
    };
    // Optimistic UI update
    setCalls((prev) => [newCall, ...prev]);

    // Persist to database API
    fetch("/api/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newCall,
        priority: call.priority || "Medium",
      }),
    }).catch((err) => console.error("Failed to save call to database API:", err));

    // Also update lead's totalCalls, last outcome, and followUpDate if provided
    updateLead(call.leadId, {
      totalCalls: (getLeadById(call.leadId)?.totalCalls ?? 0) + 1,
      lastCallOutcome: call.outcome,
      notes: call.notes || getLeadById(call.leadId)?.notes,
      ...(call.nextFollowUp
        ? {
            followUpDate: call.nextFollowUp.split(" ")[0],
            followUpTime: call.nextFollowUp.split(" ")[1] || "12:00",
            priority: call.priority || "Medium",
          }
        : {}),
      ...(call.outcome === "Won" ? { pipeline: "Won" } : {}),
      ...(call.outcome === "Meeting booked" ? { pipeline: "Meeting Booked" } : {}),
      ...(call.outcome === "Interested" && getLeadById(call.leadId)?.pipeline === "Lead"
        ? { pipeline: "Proposal" }
        : {}),
    });

    return newCall;
  };

  const getLeadById = (id: string): Lead | undefined => {
    return leads.find((l) => l.id === id);
  };

  const getCallsForLead = (leadId: string): CallLog[] => {
    return calls.filter((c) => c.leadId === leadId);
  };

  // CSV Export
  const exportLeadsCSV = () => {
    const headers = [
      "ID",
      "Business Name",
      "Contact Person",
      "Phone",
      "Email",
      "City",
      "Category",
      "Google Rating",
      "Reviews Count",
      "Website",
      "Instagram",
      "Source",
      "Assigned Caller",
      "Pipeline Stage",
      "Priority",
      "Follow-up Date",
      "Notes",
    ];

    const rows = leads.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.contactPerson.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.city}"`,
      `"${l.category}"`,
      l.googleRating,
      l.googleReviewsCount,
      `"${l.websiteUrl}"`,
      `"${l.instagramUrl}"`,
      `"${l.source}"`,
      `"${l.assignedCaller}"`,
      `"${l.pipeline}"`,
      `"${l.priority}"`,
      `"${l.followUpDate}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `solvrex_leads_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const importLeadsCSV = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      return { added: 0, errors: ["CSV file is empty or missing headers."] };
    }

    const headers = lines[0].split(",").map((h) => h.replace(/["\r]/g, "").trim().toLowerCase());
    let addedCount = 0;
    const errors: string[] = [];

    const newLeads: Lead[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Simple regex for CSV line splitting
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) =>
        v.replace(/^"|"$/g, "").replace(/""/g, '"').trim(),
      );

      if (values.length < 2) continue;

      const nameIndex = headers.findIndex((h) => h.includes("name") || h.includes("business"));
      const contactIndex = headers.findIndex((h) => h.includes("contact") || h.includes("person"));
      const phoneIndex = headers.findIndex((h) => h.includes("phone") || h.includes("mobile"));
      const emailIndex = headers.findIndex((h) => h.includes("email"));
      const cityIndex = headers.findIndex((h) => h.includes("city") || h.includes("location"));
      const categoryIndex = headers.findIndex((h) => h.includes("category") || h.includes("industry"));
      const ratingIndex = headers.findIndex((h) => h.includes("rating"));

      const businessName = nameIndex >= 0 ? values[nameIndex] : values[0];
      if (!businessName) {
        errors.push(`Row ${i}: Missing business name`);
        continue;
      }

      newLeads.push({
        id: "csv-" + Date.now() + "-" + i,
        name: businessName,
        contactPerson: contactIndex >= 0 ? values[contactIndex] : "Owner",
        phone: phoneIndex >= 0 ? values[phoneIndex] : "",
        email: emailIndex >= 0 ? values[emailIndex] : "",
        city: cityIndex >= 0 ? values[cityIndex] : "Mumbai",
        category: categoryIndex >= 0 ? values[categoryIndex] : "General",
        googleRating: ratingIndex >= 0 ? parseFloat(values[ratingIndex]) || 4.5 : 4.5,
        googleReviewsCount: 50,
        websiteUrl: "",
        instagramUrl: "",
        source: "CSV Import",
        assignedCaller: activeCallerName,
        status: "New",
        pipeline: "Lead",
        priority: "Medium",
        notes: "Imported via CSV",
        followUpDate: "",
        totalCalls: 0,
        createdAt: new Date().toISOString().split("T")[0],
      });
      addedCount++;
    }

    if (newLeads.length > 0) {
      setLeads((prev) => [...newLeads, ...prev]);
      // Persist bulk imported leads to database API
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: newLeads }),
      }).catch((err) => console.error("Failed to save imported leads to database API:", err));
    }

    return { added: addedCount, errors };
  };

  // Compute Live Metrics
  const stats = useMemo(() => {
    const todayStr = "2026-11-03"; // Matches mock system date

    const callsToday = calls.filter((c) => c.date.startsWith(todayStr)).length;
    const callsThisWeek = calls.length; // Active mock set
    const callsThisMonth = calls.length + 15;

    const connectedCalls = calls.filter(
      (c) =>
        c.outcome !== "Not answered" &&
        c.outcome !== "Busy" &&
        c.outcome !== "Wrong number",
    ).length;

    const connectRate = calls.length > 0 ? Math.round((connectedCalls / calls.length) * 100) : 0;

    const conversions = calls.filter(
      (c) => c.outcome === "Won" || c.outcome === "Meeting booked",
    ).length;

    const conversionRate =
      connectedCalls > 0 ? Math.round((conversions / connectedCalls) * 100) : 0;

    const pipelineCount: Record<PipelineStage, number> = {
      Lead: leads.filter((l) => l.pipeline === "Lead").length,
      Contacted: leads.filter((l) => l.pipeline === "Contacted").length,
      Proposal: leads.filter((l) => l.pipeline === "Proposal").length,
      Negotiation: leads.filter((l) => l.pipeline === "Negotiation").length,
      "Meeting Booked": leads.filter((l) => l.pipeline === "Meeting Booked").length,
      Won: leads.filter((l) => l.pipeline === "Won").length,
      Lost: leads.filter((l) => l.pipeline === "Lost").length,
    };

    const followupsDueToday = leads.filter((l) => l.followUpDate === todayStr);

    // Leaderboard per caller
    const callers = CALLER_TEAM.map((member) => {
      const callerCalls = calls.filter((c) => c.callerName === member.name);
      const connected = callerCalls.filter(
        (c) =>
          c.outcome !== "Not answered" &&
          c.outcome !== "Busy" &&
          c.outcome !== "Wrong number",
      ).length;
      const meetingsBooked = callerCalls.filter((c) => c.outcome === "Meeting booked").length;
      const won = callerCalls.filter((c) => c.outcome === "Won").length;
      const cRate = callerCalls.length > 0 ? Math.round((connected / callerCalls.length) * 100) : 0;
      const convRate = connected > 0 ? Math.round(((meetingsBooked + won) / connected) * 100) : 0;

      return {
        callerName: member.name,
        callsMade: callerCalls.length,
        connected,
        meetingsBooked,
        won,
        connectRate: cRate,
        conversionRate: convRate,
      };
    }).sort((a, b) => b.won * 2 + b.meetingsBooked - (a.won * 2 + a.meetingsBooked));

    return {
      callsToday,
      callsThisWeek,
      callsThisMonth,
      connectRate,
      conversionRate,
      pipelineCount,
      followupsDueToday,
      callerLeaderboard: callers,
    };
  }, [calls, leads]);

  return (
    <CRMContext.Provider
      value={{
        leads,
        calls,
        selectedCallerFilter,
        setSelectedCallerFilter,
        userRole,
        setUserRole,
        activeCallerName,
        setActiveCallerName,
        currentUser: { name: activeCallerName, role: userRole },
        setCurrentUser: (u: { name: string; role: string }) => {
          setActiveCallerName(u.name);
          if (u.role === "Admin" || u.role === "Caller") {
            setUserRole(u.role);
          }
        },
        addLead,
        updateLead,
        deleteLead,
        reassignLead,
        addCallLog,
        getLeadById,
        getCallsForLead,
        exportLeadsCSV,
        importLeadsCSV,
        stats,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
};
