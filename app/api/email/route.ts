import { NextResponse } from "next/server";
import { buildDailyCheckinEmail, getTransporter, MAIL_FROM } from "@/lib/mailer";

export async function POST(req: Request) {
  const { to, name } = await req.json().catch(() => ({}));

  if (!to) {
    return NextResponse.json({ error: "to is required" }, { status: 400 });
  }

  const { subject, text, html } = buildDailyCheckinEmail(name);

  const info = await getTransporter().sendMail({
    from: MAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return NextResponse.json({ messageId: info.messageId }, { status: 202 });
}
