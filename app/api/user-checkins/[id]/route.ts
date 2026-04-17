import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import UserCheckin from "@/models/UserCheckin";
import { getBearerPayload } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const payload = getBearerPayload(req);
  if (!payload) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  await connectDB();
  const checkin = await UserCheckin.findOne({ _id: id, userId: payload.sub });
  if (!checkin) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ checkin });
}
