import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export function signToken(payload: { sub: string; email: string }) {
  return jwt.sign(payload, SECRET!, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET!) as { sub: string; email: string; iat: number; exp: number };
}

export function getBearerPayload(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer (.+)$/i.exec(header.trim());
  if (!match) return null;
  try {
    return verifyToken(match[1]);
  } catch {
    return null;
  }
}
