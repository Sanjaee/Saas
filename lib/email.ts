import { env } from "./env";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email sending stub. Swap in Resend/SES/SendGrid by filling RESEND_API_KEY
 * or by replacing the body of this function.
 */
export async function sendEmail({ to, subject, html }: EmailOptions) {
  const log = (message: string) =>
    console.log(`\n📧 [email] to=${to} subject="${subject}"\n${message}\n`);

  if (env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${env.public.NEXT_PUBLIC_APP_NAME} <no-reply@zacode.dev>`,
          to: [to],
          subject,
          html,
        }),
      });
      if (!res.ok) throw new Error(`Resend error ${res.status}`);
      log("sent via Resend");
      return { ok: true as const, provider: "resend" };
    } catch (e) {
      console.error("Resend failed, falling back to console:", e);
    }
  }

  log(html.replace(/<[^>]+>/g, " "));
  return { ok: true as const, provider: "console" };
}

export function layoutEmail(title: string, bodyHtml: string, ctaLabel?: string, ctaUrl?: string) {
  const appName = env.public.NEXT_PUBLIC_APP_NAME;
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f6f9;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;padding:32px 16px;">
      <tr><td style="font-size:22px;font-weight:800;color:#6d28d9;padding-bottom:16px;">${appName}</td></tr>
      <tr><td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;">
        <h1 style="font-size:20px;margin:0 0 12px;color:#111;">${title}</h1>
        <div style="font-size:14px;line-height:1.6;color:#374151;">${bodyHtml}</div>
        ${ctaLabel && ctaUrl ? `<div style="margin-top:24px;"><a href="${ctaUrl}" style="background:#6d28d9;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block;">${ctaLabel}</a></div>` : ""}
      </td></tr>
      <tr><td style="font-size:12px;color:#9ca3af;padding-top:16px;text-align:center;">
        You received this email because of your ${appName} account.
      </td></tr>
    </table>
  </body>
</html>`;
}
