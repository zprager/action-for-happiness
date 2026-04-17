import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const token = signToken({ sub: String(user._id), email: user.email });
  return NextResponse.json({
    token,
    user: { id: user._id, email: user.email, name: user.name, createdAt: user.createdAt, updatedAt: user.updatedAt },
  });
}
