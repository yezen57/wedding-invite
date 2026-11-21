import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = new TextEncoder().encode(
  process.env.SESSION_SECRET || "fallback_default_secret_32_chars_minimum_zaid_arwa"
);

export type Role = "host" | "gate";

export async function createSessionToken(role: Role): Promise<string> {
  return await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<Role | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (payload.role === "host" || payload.role === "gate") {
      return payload.role;
    }
  } catch (e) {}
  return null;
}

export async function getSessionRole(): Promise<Role | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

