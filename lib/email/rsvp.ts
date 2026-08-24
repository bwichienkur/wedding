import "server-only";

import { Resend } from "resend";
import { wedding } from "@/data/wedding";

export function isEmailEnabled(): boolean {
  return (
    process.env.EMAIL_ENABLED === "true" && Boolean(process.env.RESEND_API_KEY)
  );
}

function getResend(): Resend | null {
  if (!isEmailEnabled()) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendRsvpConfirmationEmail(options: {
  to: string;
  householdName: string;
  status: string;
  isUpdate?: boolean;
}): Promise<{ sent: boolean; skipped?: string }> {
  const resend = getResend();
  if (!resend) {
    return { sent: false, skipped: "Email disabled or not configured" };
  }

  const from =
    process.env.EMAIL_FROM || "Bright & Lexi <onboarding@resend.dev>";
  const subject = options.isUpdate
    ? `RSVP updated · ${wedding.couple.displayName}`
    : `RSVP received · ${wedding.couple.displayName}`;

  const text = [
    `Dear ${options.householdName},`,
    "",
    options.isUpdate
      ? "We received an update to your RSVP."
      : "Thank you for your RSVP.",
    `Status: ${options.status}`,
    "",
    `${wedding.couple.displayName}`,
    `${wedding.wedding.dateDisplay}`,
    `${wedding.wedding.venueName}, ${wedding.wedding.city}, ${wedding.wedding.region}`,
    "",
    "You can return to the wedding site to review your response before the RSVP deadline.",
  ].join("\n");

  const html = `
    <div style="font-family: Georgia, serif; color: #1C2A22; background: #F3EEE4; padding: 32px;">
      <p style="letter-spacing: 0.18em; text-transform: uppercase; color: #A6873B; font-size: 12px;">RSVP</p>
      <h1 style="font-weight: 500;">${wedding.couple.displayName}</h1>
      <p>Dear ${options.householdName},</p>
      <p>${options.isUpdate ? "We received an update to your RSVP." : "Thank you for your RSVP."}</p>
      <p><strong>Status:</strong> ${options.status}</p>
      <p>${wedding.wedding.dateDisplay}<br/>${wedding.wedding.venueName}, ${wedding.wedding.city}, ${wedding.wedding.region}</p>
      <p style="color: #5A615C; font-size: 14px;">You can return to the wedding site to review your response before the RSVP deadline.</p>
    </div>
  `;

  await resend.emails.send({
    from,
    to: options.to,
    subject,
    text,
    html,
  });

  return { sent: true };
}

export async function sendAdminRsvpNotification(options: {
  householdName: string;
  status: string;
}): Promise<void> {
  const resend = getResend();
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL;
  if (!resend || !adminTo) return;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "Bright & Lexi <onboarding@resend.dev>",
    to: adminTo,
    subject: `RSVP ${options.status}: ${options.householdName}`,
    text: `${options.householdName} submitted an RSVP (${options.status}).`,
  });
}
