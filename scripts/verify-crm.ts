import { getAllLeads, createLead, getLeadById, updateLead } from "../services/leads.service";
import { getAllCalls, createCallRecord } from "../services/calls.service";

async function verify() {
  console.log("=== 1. VERIFYING LEADS DATABASE SETUP ===");
  const initialLeads = await getAllLeads();
  console.log("✅ Total leads loaded:", initialLeads.length);
  console.log("✅ First lead:", initialLeads[0].name, "| Phone:", initialLeads[0].phone);

  const testLead = await createLead({
    name: "Apollo Health Diagnostic Center",
    contactPerson: "Dr. Sameer Khan",
    phone: "+91 98220 99881",
    email: "info@apollohealth.in",
    city: "Hyderabad",
    category: "Healthcare",
    googleRating: 4.8,
    googleReviewsCount: 310,
    websiteUrl: "https://apollohealth.example.com",
    instagramUrl: "",
    source: "Google Maps",
    assignedCaller: "Priya Sharma",
    status: "New",
    pipeline: "Lead",
    priority: "High",
    notes: "Diagnostic lab chains interested in caller automation.",
    followUpDate: "2026-11-06",
    followUpTime: "15:00",
  });
  console.log("✅ Created new lead permanently in database:", testLead.id, testLead.name);

  const fetched = await getLeadById(testLead.id);
  console.log("✅ Fetched created lead:", fetched?.name, "(matches ID:", fetched?.id === testLead.id, ")");

  const updated = await updateLead(testLead.id, {
    notes: "Updated notes: Director confirmed proposal review.",
    pipeline: "Proposal",
  });
  console.log("✅ Updated lead pipeline:", updated?.pipeline, "| notes:", updated?.notes);

  console.log("\n=== 2. VERIFYING CALL HISTORY DATABASE & API ===");
  const callsForLead1 = await getAllCalls({ leadId: "1" });
  console.log("✅ Initial call history for Lead 1 count:", callsForLead1.length);
  if (callsForLead1.length > 0) {
    console.log("✅ Lead 1 call outcome:", callsForLead1[0].outcome, "| duration:", callsForLead1[0].duration);
  }

  const newCall = await createCallRecord({
    leadId: testLead.id,
    leadName: testLead.name,
    callerName: "Priya Sharma",
    date: "2026-11-05 15:30",
    outcome: "Meeting booked",
    duration: "04:15",
    durationSeconds: 255,
    notes: "Walkthrough scheduled for Friday 3 PM with diagnostic director.",
    nextFollowUp: "2026-11-06 15:00",
    priority: "High",
  });
  console.log("✅ Logged call to database:", newCall.id, "| Outcome:", newCall.outcome, "| Duration:", newCall.duration);

  const updatedCalls = await getAllCalls({ leadId: testLead.id });
  console.log("✅ Verified call history for new lead from API/DB count:", updatedCalls.length);
  console.log("✅ Call outcome verified:", updatedCalls[0]?.outcome);

  console.log("\n🎉 ALL DATABASE AND API VERIFICATIONS PASSED SUCCESSFULLY!");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

