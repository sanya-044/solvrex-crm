import { NextResponse } from "next/server";
import { getAllLeads, createLead, LeadRecord } from "@/services/leads.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caller = searchParams.get("caller") || undefined;
    const pipeline = searchParams.get("pipeline") || undefined;
    const city = searchParams.get("city") || undefined;
    const query = searchParams.get("q") || undefined;

    const leads = await getAllLeads({
      caller,
      pipeline,
      city,
      query,
    });

    return NextResponse.json({
      success: true,
      leads,
    });
  } catch (error) {
    console.error("GET /api/leads failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if bulk import
    if (Array.isArray(body.leads)) {
      const createdList: LeadRecord[] = [];
      for (const item of body.leads) {
        if (item.name && item.phone) {
          const lead = await createLead(item);
          createdList.push(lead);
        }
      }
      return NextResponse.json({
        success: true,
        count: createdList.length,
        leads: createdList,
      });
    }

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: "Lead name and phone are required." },
        { status: 400 }
      );
    }

    const newLead = await createLead(body);
    return NextResponse.json(
      {
        success: true,
        lead: newLead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/leads failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save lead to database." },
      { status: 500 }
    );
  }
}

