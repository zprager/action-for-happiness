import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(id);
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  if (typeof body.email === "string") update.email = body.email;
  if (typeof body.name === "string") update.name = body.name;
  if (typeof body.password === "string") update.password = await bcrypt.hash(body.password, 10);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no updatable fields provided" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findByIdAndDelete(id);
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
