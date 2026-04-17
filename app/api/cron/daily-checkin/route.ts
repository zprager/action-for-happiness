import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { buildDailyCheckinEmail, getTransporter, MAIL_FROM } from "@/lib/mailer";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: Request) {
  if (!CRON_SECRET || req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectDB();
  const users = await User.find({}, { email: 1, name: 1 }).lean();
  const transporter = getTransporter();

  const results = await Promise.allSettled(
    users.map((u) => {
      const { subject, text, html } = buildDailyCheckinEmail(u.name);
      return transporter.sendMail({ from: MAIL_FROM, to: u.email, subject, text, html });
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({ total: users.length, sent, failed });
}
