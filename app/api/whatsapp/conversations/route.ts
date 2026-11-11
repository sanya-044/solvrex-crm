import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAllConversations, createConversation } from "@/services/whatsapp.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const caller = searchParams.get("caller") || undefined;
  const query = searchParams.get("q") || undefined;
  const unreadOnly = searchParams.get("unread") === "true";

  // Callers by default see their assigned threads unless Admin/Manager
  const isManager = /admin|manager/i.test(user.role);
  const callerFilter = isManager ? caller : user.fullName;

  try {
    const conversations = await getAllConversations({
      caller: callerFilter,
      query,
      unreadOnly,
    });

    return NextResponse.json({
      success: true,
      conversations,
      count: conversations.length,
    });
  } catch (error) {
    console.error("GET /api/whatsapp/conversations error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve WhatsApp conversations." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    leadId?: string;
    leadName?: string;
    phoneNumber?: string;
    initialMessage?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.leadName || !body.phoneNumber) {
    return NextResponse.json(
      { error: "Lead Name and Phone Number are required." },
      { status: 400 }
    );
  }

  try {
    const newConv = await createConversation({
      leadId: body.leadId,
      leadName: body.leadName,
      phoneNumber: body.phoneNumber,
      assignedCaller: user.fullName,
      initialMessage: body.initialMessage,
    });

    return NextResponse.json({
      success: true,
      conversation: newConv,
    });
  } catch (error) {
    console.error("POST /api/whatsapp/conversations error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation." },
      { status: 500 }
    );
  }
}

