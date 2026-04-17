import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST ?? "mailpit";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 1025);
const MAIL_FROM = process.env.MAIL_FROM ?? "no-reply@actionfh.local";
const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

let transporter: nodemailer.Transporter | null = null;

export function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
    });
  }
  return transporter;
}

export { MAIL_FROM, APP_URL };

export function buildDailyCheckinEmail(name?: string) {
  const link = `${APP_URL}/daily-checkin`;
  const greeting = name ? `Hi ${name},` : "Hi friend,";

  const subject = "Your Daily Check-In is ready 🌱";

  const text = [
    greeting,
    "",
    "Take a gentle pause with today's Daily Check-In.",
    "",
    "What happens when you click the link below:",
    "  • You'll open a short, calming web experience — no app required.",
    "  • We'll guide you through a couple of reflective prompts and a breathing moment.",
    "  • In under two minutes you'll notice how you're feeling and set one small intention for today.",
    "",
    `Begin today's check-in: ${link}`,
    "",
    "Small actions, happier days.",
    "— Action for Happiness",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2d26;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #dfe6dd;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid #dfe6dd;">
                <span style="display:inline-block;width:12px;height:12px;background:#00a651;border-radius:50%;vertical-align:middle;margin-right:8px;"></span>
                <strong style="font-size:18px;color:#1f3d2c;vertical-align:middle;">Action for Happiness</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <div style="color:#00a651;font-weight:800;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;margin-bottom:10px;">Your Daily Check-In</div>
                <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;color:#1f3d2c;">${greeting}</h1>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#1f2d26;">
                  Take a gentle pause — it only takes two minutes, and it can make the whole day feel a little lighter.
                </p>
                <p style="margin:0 0 8px;font-size:15px;line-height:1.55;color:#5e6e66;">
                  <strong style="color:#1f3d2c;">When you tap the button below:</strong>
                </p>
                <ul style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.6;color:#5e6e66;">
                  <li>A short, calming web experience opens in your browser — no app needed.</li>
                  <li>We'll guide you through a couple of reflective prompts and a breathing moment.</li>
                  <li>You'll notice how you're feeling and set one tiny intention for today.</li>
                </ul>
                <p style="margin:0 0 32px;text-align:center;">
                  <a href="${link}" style="display:inline-block;background:#00a651;color:#ffffff;font-weight:800;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:16px;">Begin today&#39;s check-in</a>
                </p>
                <p style="margin:0;font-size:13px;color:#5e6e66;line-height:1.55;">
                  Or paste this into your browser:<br>
                  <a href="${link}" style="color:#008a43;word-break:break-all;">${link}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f4f7f2;border-top:1px solid #dfe6dd;font-size:13px;color:#5e6e66;text-align:center;">
                Small actions, happier days. — Action for Happiness
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html, link };
}
