import "dotenv/config";

import { sendEmail } from "../services/email.service";

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("The email test script can only run outside production.");
    process.exitCode = 1;
    return;
  }

  const to = process.argv[2];
  if (!to) {
    console.error(
      "Usage: npm run email:test -- <recipient-email-address>",
    );
    process.exitCode = 1;
    return;
  }

  const result = await sendEmail({
    to,
    subject: "Solvrex CRM email service test",
    template: "account-invitation",
    variables: {
      fullName: "CRM Test Recipient",
      inviterName: "Solvrex CRM Team",
      invitationUrl: "http://localhost:3000/",
    },
  });

  if (!result.success) {
    console.error(`Test email failed: ${result.error.message}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Test email accepted by Resend. Message ID: ${result.data.id}`);
}

main().catch(() => {
  console.error("Test email failed due to an unexpected server error.");
  process.exitCode = 1;
});
