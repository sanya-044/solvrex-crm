import "server-only";

export interface WhatsAppConfig {
  phoneNumberId?: string;
  accessToken?: string;
  verifyToken?: string;
  businessAccountId?: string;
  apiVersion: string;
}

export function getWhatsAppConfig(): WhatsAppConfig {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "solvrex_wa_webhook_verify_secret",
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    apiVersion: process.env.WHATSAPP_API_VERSION || "v21.0",
  };
}

export function isWhatsAppCloudConfigured(): boolean {
  const config = getWhatsAppConfig();
  return Boolean(config.phoneNumberId && config.accessToken);
}

/**
 * Normalizes phone numbers to Meta WhatsApp Cloud API format (E.164 digits without +)
 * e.g. "+91 98765 43210" -> "919876543210"
 */
export function normalizeWhatsAppNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export interface SendMessageResult {
  success: boolean;
  messageId: string;
  isLive: boolean;
  error?: string;
}

/**
 * Sends a WhatsApp message via Meta Cloud API if credentials are provided,
 * otherwise falls back cleanly to simulated dev dispatch.
 */
export async function sendWhatsAppMessage(params: {
  to: string;
  text: string;
}): Promise<SendMessageResult> {
  const config = getWhatsAppConfig();
  const recipient = normalizeWhatsAppNumber(params.to);

  if (isWhatsAppCloudConfigured()) {
    try {
      const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipient,
          type: "text",
          text: {
            preview_url: false,
            body: params.text,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Meta WhatsApp Cloud API error:", data);
        return {
          success: false,
          messageId: "",
          isLive: true,
          error: data?.error?.message || `HTTP ${res.status} from Meta API`,
        };
      }

      const waMessageId = data?.messages?.[0]?.id || `wamid_${Date.now()}`;
      return {
        success: true,
        messageId: waMessageId,
        isLive: true,
      };
    } catch (err: unknown) {
      console.error("Failed to connect to Meta WhatsApp Cloud API:", err);
      return {
        success: false,
        messageId: "",
        isLive: true,
        error: err instanceof Error ? err.message : "Network error contacting Meta API",
      };
    }
  }

  // Simulated / Mock Mode (Ready for Meta Cloud API credentials)
  const mockId = `mock_wa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    success: true,
    messageId: mockId,
    isLive: false,
  };
}

export interface IncomingWhatsAppMessagePayload {
  from: string;
  id: string;
  timestamp: string;
  text?: string;
  type?: string;
}

export interface WhatsAppStatusUpdatePayload {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipientId: string;
}

/**
 * Extracts incoming messages & status updates from Meta's webhook notification payload
 */
export function parseWhatsAppWebhook(body: Record<string, unknown>): {
  messages: IncomingWhatsAppMessagePayload[];
  statuses: WhatsAppStatusUpdatePayload[];
} {
  const messages: IncomingWhatsAppMessagePayload[] = [];
  const statuses: WhatsAppStatusUpdatePayload[] = [];

  try {
    const entry = (body?.entry as Array<Record<string, unknown>>) || [];
    for (const e of entry) {
      const changes = (e?.changes as Array<Record<string, unknown>>) || [];
      for (const c of changes) {
        const val = c?.value as Record<string, unknown>;
        if (!val) continue;

        // Inbound customer messages
        const msgs = (val.messages as Array<Record<string, unknown>>) || [];
        for (const m of msgs) {
          const textObj = m.text as Record<string, unknown> | undefined;
          messages.push({
            from: String(m.from || ""),
            id: String(m.id || ""),
            timestamp: String(m.timestamp || ""),
            type: String(m.type || "text"),
            text: textObj ? String(textObj.body || "") : undefined,
          });
        }

        // Delivery/Read status updates
        const stats = (val.statuses as Array<Record<string, unknown>>) || [];
        for (const s of stats) {
          statuses.push({
            id: String(s.id || ""),
            status: String(s.status || "sent") as "sent" | "delivered" | "read" | "failed",
            timestamp: String(s.timestamp || ""),
            recipientId: String(s.recipient_id || ""),
          });
        }
      }
    }
  } catch (err) {
    console.error("Error parsing WhatsApp webhook payload:", err);
  }

  return { messages, statuses };
}
