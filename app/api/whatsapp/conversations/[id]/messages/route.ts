import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { sendChatMessage } from "@/services/whatsapp.service";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Ctx) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.text || !body.text.trim()) {
    return NextResponse.json({ error: "Message text is required." }, { status: 400 });
  }

  try {
    const message = await sendChatMessage({
      conversationId: id,
      text: body.text.trim(),
      senderName: user.fullName,
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error: unknown) {
    console.error("POST /api/whatsapp/conversations/[id]/messages error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send message." },
      { status: 500 }
    );
  }
}
