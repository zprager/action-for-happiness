import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password, name } = await req.json().catch(() => ({}));

  if (!email || !password || !name) {
    return NextResponse.json({ error: "email, password, and name are required" }, { status: 400 });
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ error: "email already in use" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash, name });
  const token = signToken({ sub: String(user._id), email: user.email });

  return NextResponse.json(
    { token, user: { id: user._id, email: user.email, name: user.name, createdAt: user.createdAt, updatedAt: user.updatedAt } },
    { status: 201 }
  );
}
