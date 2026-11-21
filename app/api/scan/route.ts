import { NextResponse } from "next/server";
import { getSessionRole } from "@/lib/auth";
import { db } from "@/lib/supabase";

export async function POST(req: Request) {
  const role = await getSessionRole();
  if (role !== "gate" && role !== "host") {
    return NextResponse.json({ error: "غير مصرح بالمسح" }, { status: 401 });
  }

  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "رمز المسح مفقود" }, { status: 400 });
    }

    const cleanToken = token.trim();
    // Atomic burn in database
    const result = await db.scanAndBurn(cleanToken);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "خطأ أثناء فحص الرمز" }, { status: 500 });
  }
}

