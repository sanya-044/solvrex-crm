import "server-only";

import { Resend } from "resend";

interface EmailDeliveryInput {
  to: string[];
  subject: string;
  html: string;
}

interface EmailDeliveryResult {
  id: string;
}

export class EmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigurationError";
  }
}

export class EmailProviderError extends Error {
  readonly providerCode: string | null;

  constructor(providerCode: string | null = null) {
    super("The email provider could not deliver the message.");
    this.name = "EmailProviderError";
    this.providerCode = providerCode;
  }
}

let resendClient: Resend | undefined;

function getEmailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey) {
    throw new EmailConfigurationError(
      "Email is not configured: RESEND_API_KEY is missing.",
    );
  }
  if (!from) {
    throw new EmailConfigurationError(
      "Email is not configured: RESEND_FROM_EMAIL is missing.",
    );
  }

  return { apiKey, from };
}

export async function deliverEmail({
  to,
  subject,
  html,
}: EmailDeliveryInput): Promise<EmailDeliveryResult> {
  const { apiKey, from } = getEmailConfiguration();
  resendClient ??= new Resend(apiKey);

  let response;
  try {
    response = await resendClient.emails.send({ from, to, subject, html });
  } catch {
    throw new EmailProviderError();
  }

  if (response.error) {
    throw new EmailProviderError(response.error.name);
  }
  if (!response.data?.id) {
    throw new EmailProviderError();
  }

  return { id: response.data.id };
}
