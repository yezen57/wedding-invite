"use client";

import { useEffect, useState } from "react";
import { wedding } from "@/config/wedding";

type Invite = {
  id: string;
  token: string;
  guest_name: string | null;
  party_size: number;
  used_at: string | null;
  created_at: string;
};

export default function HostDashboard() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [invitations, setInvitations] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);

  // New Invite form
  const [guestName, setGuestName] = useState("");
  const [isNoName, setIsNoName] = useState(false);
  const [partySize, setPartySize] = useState(1);
  const [createdInvite, setCreatedInvite] = useState<Invite | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unused" | "used">("all");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invitations");
      if (res.status === 401) {
        setIsAuth(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.invitations) {
        setInvitations(data.invitations);
        setIsAuth(true);
      }
    } catch (e) {
      setIsAuth(false);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "host", credential: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuth(true);
        fetchInvitations();
      } else {
        setAuthError(data.error || "كلمة المرور غير صحيحة");
      }
    } catch (e) {
      setAuthError("تعذر الاتصال بالخادم");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: isNoName ? null : guestName,
          party_size: partySize,
        }),
      });
      const data = await res.json();
      if (data.invitation) {
        setInvitations((prev) => [data.invitation, ...prev]);
        setCreatedInvite(data.invitation);
        setGuestName("");
        setIsNoName(false);
        setPartySize(1);
      }
    } catch (e) {
      alert("حدث خطأ أثناء إنشاء الدعوة");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الدعوة؟")) return;
    try {
      const res = await fetch("/api/invitations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setInvitations((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (e) {}
  };

  const handleReactivate = async (id: string) => {
    try {
      const res = await fetch("/api/invitations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setInvitations((prev) =>
          prev.map((i) => (i.id === id ? { ...i, used_at: null } : i))
        );
      }
    } catch (e) {}
  };

  const getInviteUrl = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/i/${token}`;
  };

  const copyUrl = (token: string, id: string) => {
    const url = getInviteUrl(token);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareWhatsApp = (invite: Invite) => {
    const url = getInviteUrl(invite.token);
    const greeting = invite.guest_name ? `الأخ الكريم ${invite.guest_name}` : "ضيفنا الكريم";
    const text = `السلام عليكم ورحمة الله وبركاته،\n${greeting} يسعدنا ويشرفنا حضوركم لحفل زفاف (${wedding.groom} & ${wedding.bride}) يوم الثلاثاء 1 ديسمبر 2026 في قاعة ${wedding.venue.nameAr}.\n\nرابط بطاقة الدعوة ورمز الدخول الخاص بكم:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Stats calculation
  const totalInvites = invitations.length;
  const totalGuests = invitations.reduce((acc, i) => acc + (i.party_size || 1), 0);
  const enteredGuests = invitations
    .filter((i) => Boolean(i.used_at))
    .reduce((acc, i) => acc + (i.party_size || 1), 0);
  const remainingGuests = totalGuests - enteredGuests;

  // Filtered invitations
  const filtered = invitations.filter((i) => {
    if (filter === "unused" && i.used_at) return false;
    if (filter === "used" && !i.used_at) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      const name = (i.guest_name || "بدون اسم").toLowerCase();
      return name.includes(s) || i.token.toLowerCase().includes(s);
    }
    return true;
  });

  if (isAuth === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFCF7] p-4" dir="rtl">
        <div className="w-full max-w-md rounded-3xl border border-[var(--gold)]/30 bg-[#FFFDF9] p-8 shadow-xl">
          <div className="text-center">
            <h1 className="font-display text-3xl text-bronze">لوحة أهل العريس</h1>
            <p className="mt-2 text-sm text-taupe">أدخل كلمة المرور لإدارة الدعوات والضيوف</p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-bronze">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="mt-1.5 w-full rounded-2xl border border-[var(--card-border)] bg-white px-4 py-3 outline-none focus:border-[var(--gold)]"
                autoFocus
              />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button type="submit" className="paper-btn mt-2 w-full py-3">
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF7] p-4 sm:p-8" dir="rtl">
      <div className="mx-auto max-w-5xl">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--gold)]/20 pb-6 sm:flex-row sm:items-center">
          <div>
            <span className="font-serif text-sm tracking-widest text-gold">لوحة الإدارة</span>
            <h1 className="font-display text-4xl text-bronze">
              دعوات زفاف {wedding.groom} & {wedding.bride}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="paper-btn text-xs py-2 px-4">
              عرض الدعوة العامة ↗
            </a>
            <a href="/gate" target="_blank" className="paper-btn text-xs py-2 px-4 text-emerald-800 border-emerald-300">
              بوابة القاعة (الماسح) 📷
            </a>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[var(--card-border)] bg-white p-4 text-center shadow-xs">
            <p className="text-xs text-taupe">إجمالي الدعوات</p>
            <p className="mt-1 font-serif text-3xl font-bold text-bronze">{totalInvites}</p>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-white p-4 text-center shadow-xs">
            <p className="text-xs text-taupe">مجموع المدعوين</p>
            <p className="mt-1 font-serif text-3xl font-bold text-gold">{totalGuests}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-center shadow-xs">
            <p className="text-xs text-emerald-700">دخلوا القاعة</p>
            <p className="mt-1 font-serif text-3xl font-bold text-emerald-700">{enteredGuests}</p>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-white p-4 text-center shadow-xs">
            <p className="text-xs text-taupe">المتبقي</p>
            <p className="mt-1 font-serif text-3xl font-bold text-taupe">{remainingGuests}</p>
          </div>
        </div>

        {/* Create Invitation Form */}
        <div className="mt-8 rounded-3xl border border-[var(--gold)]/30 bg-[#FFFDF9] p-6 shadow-sm">
          <h2 className="font-display text-2xl text-bronze">إنشاء دعوة جديدة</h2>
          <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-end">
            <div className="sm:col-span-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-bronze">اسم الضيف</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsNoName(!isNoName);
                    if (!isNoName) setGuestName("");
                  }}
                  className="text-xs text-gold hover:underline"
                >
                  {isNoName ? "إضافة اسم" : "بدون اسم"}
                </button>
              </div>
              <input
                type="text"
                disabled={isNoName}
                value={isNoName ? "بدون اسم محدد" : guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="مثال: د. محمد السعيد وعائلته"
                className="mt-1.5 w-full rounded-2xl border border-[var(--card-border)] bg-white px-4 py-2.5 outline-none focus:border-[var(--gold)] disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-semibold text-bronze">عدد الأشخاص (1-20)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={partySize}
                onChange={(e) => setPartySize(Math.max(1, Math.min(20, Number(e.target.value))))}
                className="mt-1.5 w-full rounded-2xl border border-[var(--card-border)] bg-white px-4 py-2.5 text-center outline-none focus:border-[var(--gold)]"
              />
            </div>

            <div className="sm:col-span-3">
              <button type="submit" className="paper-btn w-full py-2.5 text-base">
                + توليد الرابط
              </button>
            </div>
          </form>

          {/* Created Link Alert */}
          {createdInvite && (
            <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800">
                ✓ تم توليد الدعوة بنجاح لـ: {createdInvite.guest_name || "ضيف كريم"} ({createdInvite.party_size} أشخاص)
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => shareWhatsApp(createdInvite)}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                >
                  مشاركة عبر واتساب 💬
                </button>
                <button
                  type="button"
                  onClick={() => copyUrl(createdInvite.token, "new")}
                  className="rounded-xl border border-emerald-600 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                  {copiedId === "new" ? "تم النسخ ✓" : "نسخ الرابط 📋"}
                </button>
                <a
                  href={getInviteUrl(createdInvite.token)}
                  target="_blank"
                  className="text-xs text-emerald-800 underline hover:text-emerald-950"
                >
                  معاينة الدعوة الشخصية ↗
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الرمز…"
            className="w-full sm:w-72 rounded-2xl border border-[var(--card-border)] bg-white px-4 py-2 text-sm outline-none focus:border-[var(--gold)]"
          />

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {(["all", "unused", "used"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  filter === mode
                    ? "bg-[var(--gold)] text-white"
                    : "border border-[var(--card-border)] bg-white text-taupe hover:text-bronze"
                }`}
              >
                {mode === "all" ? "الكل" : mode === "unused" ? "لم يدخلوا" : "دخلوا القاعة"}
              </button>
            ))}
          </div>
        </div>

        {/* Invitations Table */}
        <div className="mt-4 overflow-hidden rounded-3xl border border-[var(--gold)]/20 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#FAF4EB] text-xs font-semibold text-taupe">
                <tr>
                  <th className="p-4">اسم الضيف</th>
                  <th className="p-4 text-center">العدد</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((inv) => {
                  const entered = Boolean(inv.used_at);
                  return (
                    <tr key={inv.id} className="hover:bg-amber-50/30 transition">
                      <td className="p-4">
                        <p className="font-semibold text-bronze">{inv.guest_name || "بدون اسم"}</p>
                        <p className="text-xs text-taupe font-mono" dir="ltr">
                          /i/{inv.token.slice(0, 10)}...
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block rounded-full bg-amber-100/60 px-2.5 py-0.5 text-xs font-bold text-bronze">
                          {inv.party_size}
                        </span>
                      </td>
                      <td className="p-4">
                        {entered ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            ✓ دخل (
                            {new Date(inv.used_at!).toLocaleTimeString("ar-SA", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                            )
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                            لم تُستخدم
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => shareWhatsApp(inv)}
                            title="مشاركة عبر واتساب"
                            className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100"
                          >
                            واتساب
                          </button>
                          <button
                            type="button"
                            onClick={() => copyUrl(inv.token, inv.id)}
                            title="نسخ الرابط"
                            className="rounded-lg bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"
                          >
                            {copiedId === inv.id ? "تم النسخ" : "نسخ"}
                          </button>
                          {entered && (
                            <button
                              type="button"
                              onClick={() => handleReactivate(inv.id)}
                              title="إعادة تفعيل البطاقة"
                              className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                            >
                              إعادة تفعيل
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(inv.id)}
                            title="حذف"
                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-taupe">
                      {loading ? "جارٍ التحميل…" : "لا توجد دعوات مسجلة"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

