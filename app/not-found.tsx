import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="font-display text-4xl text-bronze">الصفحة غير موجودة</h1>
      <p className="mt-3 text-taupe">الرابط المطلوب غير صحيح أو انتهت صلاحيته</p>
      <Link href="/" className="paper-btn mt-6">
        العودة للدعوة
      </Link>
    </div>
  );
}
