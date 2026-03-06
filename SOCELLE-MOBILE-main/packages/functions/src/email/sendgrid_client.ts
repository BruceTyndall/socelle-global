import { logger } from "firebase-functions";

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const FROM_EMAIL = "noreply@slotforce.app";
const FROM_NAME = "SLOTFORCE";

/**
 * Sends a transactional email via SendGrid.
 *
 * Requires the SENDGRID_API_KEY secret to be set in Cloud Functions config.
 * Set with: firebase functions:secrets:set SENDGRID_API_KEY
 */
export async function sendEmail(params: EmailParams): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    logger.warn("sendEmail: SENDGRID_API_KEY not configured — skipping send", {
      to: params.to,
      subject: params.subject,
    });
    return;
  }

  if (!params.to || !params.to.includes("@")) {
    logger.warn("sendEmail: invalid recipient — skipping", {
      to: params.to,
    });
    return;
  }

  const body = {
    personalizations: [{ to: [{ email: params.to }] }],
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: params.subject,
    content: [
      { type: "text/plain", value: params.text },
      { type: "text/html", value: params.html },
    ],
  };

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.ok || response.status === 202) {
    logger.info("sendEmail: sent", {
      to: params.to,
      subject: params.subject,
    });
    return;
  }

  const errText = await response.text().catch(() => "");
  logger.error("sendEmail: SendGrid error", {
    status: response.status,
    body: errText,
    to: params.to,
  });
  throw new Error(`SendGrid send failed: ${response.status}`);
}
