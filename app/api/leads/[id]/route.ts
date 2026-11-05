import { NextResponse } from "next/server";
import { getLeadById, updateLead, deleteLead } from "@/services/leads.service";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const lead = await getLeadById(id);

    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("GET /api/leads/[id] failed:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch lead" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateLead(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Lead not found or update failed" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error("PATCH /api/leads/[id] failed:", error);
    return NextResponse.json({ success: false, error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const ok = await deleteLead(id);

    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error("DELETE /api/leads/[id] failed:", error);
    return NextResponse.json({ success: false, error: "Failed to delete lead" }, { status: 500 });
  }
}

