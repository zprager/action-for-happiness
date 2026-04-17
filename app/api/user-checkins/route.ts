import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserCheckin from "@/models/UserCheckin";
import { getBearerPayload } from "@/lib/auth";

export async function POST(req: Request) {
  const payload = getBearerPayload(req);
  if (!payload) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { checkinId, version, answers } = body as {
    checkinId?: string;
    version?: number;
    answers?: { key?: unknown; value?: unknown }[];
  };

  if (!checkinId || !Array.isArray(answers)) {
    return NextResponse.json({ error: "checkinId and answers are required" }, { status: 400 });
  }

  const cleaned = answers
    .filter(
      (a): a is { key: string; value: string } =>
        !!a && typeof a.key === "string" && typeof a.value === "string" && a.value.trim().length > 0
    )
    .map((a) => ({ key: a.key.trim(), value: a.value.trim() }));

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "answers must include at least one non-empty value" }, { status: 400 });
  }

  await connectDB();

  const doc = await UserCheckin.create({
    userId: payload.sub,
    checkinId,
    version: typeof version === "number" ? version : 1,
    answers: cleaned,
    completedAt: new Date(),
  });

  return NextResponse.json(
    {
      checkin: {
        id: doc._id,
        userId: doc.userId,
        checkinId: doc.checkinId,
        version: doc.version,
        answers: doc.answers,
        completedAt: doc.completedAt,
        createdAt: doc.createdAt,
      },
    },
    { status: 201 }
  );
}

export async function GET(req: Request) {
  const payload = getBearerPayload(req);
  if (!payload) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await connectDB();
  const checkins = await UserCheckin.find({ userId: payload.sub }).sort({ completedAt: -1 }).limit(30);
  return NextResponse.json({ checkins });
}
