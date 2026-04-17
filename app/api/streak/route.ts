import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserCheckin from "@/models/UserCheckin";
import { getBearerPayload } from "@/lib/auth";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const payload = getBearerPayload(req);
  if (!payload) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectDB();

  const checkins = await UserCheckin.find({ userId: payload.sub })
    .select({ completedAt: 1 })
    .sort({ completedAt: -1 })
    .lean();

  const days = new Set<string>();
  for (const c of checkins) {
    days.add(dayKey(new Date(c.completedAt)));
  }

  const today = new Date();
  const todayKey = dayKey(today);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = dayKey(yesterday);

  let cursor: Date;
  if (days.has(todayKey)) {
    cursor = new Date(`${todayKey}T00:00:00.000Z`);
  } else if (days.has(yesterdayKey)) {
    cursor = new Date(`${yesterdayKey}T00:00:00.000Z`);
  } else {
    return NextResponse.json({ streak: 0 });
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return NextResponse.json({ streak });
}
