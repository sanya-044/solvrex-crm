import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getConversationById, markConversationRead } from "@/services/whatsapp.service";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const conversation = await getConversationById(id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    // Automatically mark conversation as read when fetched by user
    await markConversationRead(id);
    conversation.unreadCount = 0;

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("GET /api/whatsapp/conversations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve conversation." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: { markRead?: boolean };
  try {
    body = await request.json();
  } catch {
    body = { markRead: true };
  }

  try {
    if (body.markRead) {
      await markConversationRead(id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/whatsapp/conversations/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update conversation." },
      { status: 500 }
    );
  }
}
