import { NextResponse } from "next/server";
import { getSessionRole } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { nanoid } from "nanoid";

export async function GET() {
  const role = await getSessionRole();
  if (role !== "host") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const list = await db.getInvitations();
    return NextResponse.json({ invitations: list });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "خطأ في جلب البيانات" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const role = await getSessionRole();
  if (role !== "host") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { guest_name, party_size } = await req.json();
    const token = nanoid(20);

    const created = await db.createInvitation({
      token,
      guest_name: guest_name && guest_name.trim() ? guest_name.trim() : null,
      party_size: Number(party_size) || 1,
    });

    return NextResponse.json({ invitation: created });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "خطأ في إنشاء الدعوة" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const role = await getSessionRole();
  if (role !== "host") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    await db.deleteInvitation(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "خطأ في الحذف" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const role = await getSessionRole();
  if (role !== "host") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    await db.reactivateInvitation(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "خطأ في إعادة التفعيل" }, { status: 500 });
  }
}

