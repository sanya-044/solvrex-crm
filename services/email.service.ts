import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  deliverEmail,
  EmailConfigurationError,
  EmailProviderError,
} from "@/lib/email";

export interface EmailTemplateVariables {
  "password-reset": {
    fullName: string;
    resetUrl: string;
    expiryMinutes: number;
  };
  "account-invitation": {
    fullName: string;
    inviterName: string;
    invitationUrl: string;
  };
}

export type EmailTemplateName = keyof EmailTemplateVariables;

type TemplateDefinition = {
  fileName: string;
  requiredVariables: readonly string[];
};

const emailTemplates: Record<EmailTemplateName, TemplateDefinition> = {
  "password-reset": {
    fileName: "password-reset.html",
    requiredVariables: ["fullName", "resetUrl", "expiryMinutes"],
  },
  "account-invitation": {
    fileName: "account-invitation.html",
    requiredVariables: ["fullName", "inviterName", "invitationUrl"],
  },
};

export class EmailTemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailTemplateError";
  }
}

export type SendEmailResult =
  | { success: true; data: { id: string } }
  | {
      success: false;
      error: {
        code:
          | "configuration_error"
          | "invalid_recipient"
          | "invalid_input"
          | "unknown_template"
          | "template_error"
          | "provider_error"
          | "internal_error";
        message: string;
      };
    };

interface SendEmailInput<T extends EmailTemplateName> {
  to: string | string[];
  subject: string;
  template: T;
  variables: EmailTemplateVariables[T];
}

const recipientPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const placeholderPattern = /{{\s*([A-Za-z][A-Za-z0-9]*)\s*}}/g;

function isEmailTemplateName(name: string): name is EmailTemplateName {
  return Object.hasOwn(emailTemplates, name);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function validateTemplateVariables(
  templateName: EmailTemplateName,
  definition: TemplateDefinition,
  variables: Record<string, string | number>,
): void {
  const requiredNames = new Set(definition.requiredVariables);

  for (const name of definition.requiredVariables) {
    const value = variables[name];
    if (
      (typeof value !== "string" && typeof value !== "number") ||
      (typeof value === "string" && !value.trim()) ||
      (name === "expiryMinutes" &&
        (!Number.isInteger(value) || Number(value) <= 0))
    ) {
      throw new EmailTemplateError(
        `Template "${templateName}" requires a valid "${name}" value.`,
      );
    }
  }

  for (const name of Object.keys(variables)) {
    if (!requiredNames.has(name)) {
      throw new EmailTemplateError(
        `Template "${templateName}" does not support the "${name}" variable.`,
      );
    }
  }

  for (const name of ["resetUrl", "invitationUrl"]) {
    const value = variables[name];
    if (typeof value !== "string") {
      continue;
    }
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new EmailTemplateError(`The "${name}" value must be an absolute URL.`);
    }
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username ||
      url.password
    ) {
      throw new EmailTemplateError(`The "${name}" value must be a safe HTTP URL.`);
    }
  }
}

export async function renderEmailTemplate(
  templateName: string,
  variables: Record<string, string | number>,
): Promise<string> {
  if (!isEmailTemplateName(templateName)) {
    throw new EmailTemplateError("Unknown email template.");
  }

  const definition = emailTemplates[templateName];
  validateTemplateVariables(templateName, definition, variables);

  let template: string;
  try {
    template = await readFile(
      path.join(process.cwd(), "templates", "email", definition.fileName),
      "utf8",
    );
  } catch {
    throw new EmailTemplateError(
      `The "${templateName}" email template could not be loaded.`,
    );
  }

  const placeholders = new Set(
    Array.from(template.matchAll(placeholderPattern), (match) => match[1]),
  );
  for (const name of definition.requiredVariables) {
    if (!placeholders.has(name)) {
      throw new EmailTemplateError(
        `The "${templateName}" template is missing its "${name}" placeholder.`,
      );
    }
  }
  for (const name of placeholders) {
    if (!definition.requiredVariables.includes(name)) {
      throw new EmailTemplateError(
        `The "${templateName}" template contains an unsupported placeholder.`,
      );
    }
  }

  const rendered = template.replace(placeholderPattern, (_match, name: string) =>
    escapeHtml(String(variables[name])),
  );
  if (/{{\s*[A-Za-z][A-Za-z0-9]*\s*}}/.test(rendered)) {
    throw new EmailTemplateError(
      `The "${templateName}" template contains an unresolved placeholder.`,
    );
  }

  return rendered;
}

function failure(
  code: Extract<SendEmailResult, { success: false }>["error"]["code"],
  message: string,
): SendEmailResult {
  return { success: false, error: { code, message } };
}

export async function sendEmail<T extends EmailTemplateName>(
  input: SendEmailInput<T>,
): Promise<SendEmailResult> {
  const templateName: string = input.template;
  if (!isEmailTemplateName(templateName)) {
    return failure("unknown_template", "The requested email template is not available.");
  }

  const recipients = Array.isArray(input.to) ? input.to : [input.to];
  if (
    recipients.length === 0 ||
    recipients.length > 50 ||
    recipients.some(
      (recipient) =>
        typeof recipient !== "string" ||
        recipient.length > 254 ||
        !recipientPattern.test(recipient.trim()),
    )
  ) {
    return failure("invalid_recipient", "Provide one or more valid recipient email addresses.");
  }

  const subject = input.subject.trim();
  if (!subject || /[\r\n]/.test(subject) || subject.length > 998) {
    return failure("invalid_input", "Provide a valid email subject.");
  }

  let html: string;
  try {
    const variables: Record<string, string | number> = Object.fromEntries(
      Object.entries(input.variables),
    );
    html = await renderEmailTemplate(
      templateName,
      variables,
    );
  } catch (error) {
    if (error instanceof EmailTemplateError) {
      return failure("template_error", error.message);
    }
    return failure(
      "internal_error",
      "The email template could not be rendered due to an unexpected error.",
    );
  }

  try {
    const data = await deliverEmail({
      to: recipients.map((recipient) => recipient.trim()),
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    if (error instanceof EmailConfigurationError) {
      return failure("configuration_error", error.message);
    }
    if (error instanceof EmailProviderError) {
      return failure(
        "provider_error",
        "The email provider could not deliver the message. Check the server configuration and try again.",
      );
    }
    return failure(
      "internal_error",
      "The email could not be delivered due to an unexpected server error.",
    );
  }
}
