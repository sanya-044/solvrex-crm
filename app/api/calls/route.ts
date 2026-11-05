import { NextResponse } from "next/server";
import { getAllCalls, createCallRecord } from "@/services/calls.service";
import { updateLead, getLeadById } from "@/services/leads.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId") || undefined;
    const callerName = searchParams.get("caller") || undefined;

    const calls = await getAllCalls({ leadId, callerName });

    return NextResponse.json({
      success: true,
      calls,
    });
  } catch (error) {
    console.error("GET /api/calls failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch calls" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.leadId || !body.outcome) {
      return NextResponse.json(
        { success: false, error: "leadId and outcome are required" },
        { status: 400 }
      );
    }

    const durationSec = Number(body.durationSeconds) || 0;
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    const durationFormatted =
      body.duration || `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

    const newCall = await createCallRecord({
      leadId: body.leadId,
      leadName: body.leadName || "Lead",
      callerName: body.callerName || "Caller",
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      outcome: body.outcome,
      duration: durationFormatted,
      durationSeconds: durationSec,
      notes: body.notes || "",
      recordingUrl: body.recordingUrl || undefined,
      nextFollowUp: body.nextFollowUp || undefined,
      priority: body.priority || "Medium",
    });

    // Update the lead's stats in database
    try {
      const existingLead = await getLeadById(body.leadId);
      if (existingLead) {
        const leadUpdates: Record<string, unknown> = {
          totalCalls: (existingLead.totalCalls || 0) + 1,
          lastCallOutcome: body.outcome,
        };
        if (body.nextFollowUp) {
          const parts = body.nextFollowUp.split(" ");
          leadUpdates.followUpDate = parts[0];
          if (parts[1]) leadUpdates.followUpTime = parts[1];
        }
        await updateLead(body.leadId, leadUpdates);
      }
    } catch (e) {
      console.warn("Could not auto-update lead from call:", e);
    }

    return NextResponse.json(
      {
        success: true,
        call: newCall,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/calls failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record call log" },
      { status: 500 }
    );
  }
}
