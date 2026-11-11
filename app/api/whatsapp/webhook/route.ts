import { NextResponse } from "next/server";
import { getWhatsAppConfig, parseWhatsAppWebhook } from "@/lib/whatsapp";
import { receiveInboundWhatsAppMessage } from "@/services/whatsapp.service";

export const dynamic = "force-dynamic";

/**
 * Meta WhatsApp Cloud API Webhook Verification (GET)
 * Meta pings this URL when you configure the webhook in the Meta App Dashboard.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const config = getWhatsAppConfig();

  if (mode === "subscribe" && token === config.verifyToken) {
    console.log("[WhatsApp Webhook] Verification successful.");
    return new Response(challenge || "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("[WhatsApp Webhook] Verification token mismatch.", { mode, token });
  return new Response("Forbidden", { status: 403 });
}

/**
 * Meta WhatsApp Cloud API Event Receiver (POST)
 * Receives incoming customer messages, delivery receipts, and read notifications.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[WhatsApp Webhook Event]:", JSON.stringify(body, null, 2));
  }

  try {
    const { messages, statuses } = parseWhatsAppWebhook(body);

    // Process Inbound Customer Messages
    for (const msg of messages) {
      if (msg.text && msg.from) {
        await receiveInboundWhatsAppMessage({
          fromPhone: msg.from,
          text: msg.text,
          waMessageId: msg.id,
        });
      }
    }

    if (statuses.length > 0) {
      // In the future, message delivery status (DELIVERED, READ) can be mapped back using msg.id
      console.log(`[WhatsApp Webhook] Received ${statuses.length} status updates.`);
    }

    return NextResponse.json({ status: "ok", received: true });
  } catch (error) {
    console.error("[WhatsApp Webhook Error]:", error);
    // Always return 200 OK so Meta doesn't flood retries
    return NextResponse.json({ status: "ok", error: "Handled with warning" });
  }
}
