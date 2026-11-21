import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { role, credential } = await req.json();

    const expectedHostPassword = process.env.HOST_PASSWORD || "zaid2026";
    const expectedGatePin = process.env.GATE_PIN || "7788";

    if (role === "host") {
      if (credential !== expectedHostPassword) {
        return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
      }
    } else if (role === "gate") {
      if (credential !== expectedGatePin) {
        return NextResponse.json({ error: "رمز PIN غير صحيح" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
    }

    const token = await createSessionToken(role);

    const res = NextResponse.json({ success: true, role });
    res.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: "حدث خطأ في تسجيل الدخول" }, { status: 500 });
  }
}

