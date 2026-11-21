"use client";

import { useEffect, useState, useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

type ScanResult = {
  status: "allowed" | "already_used" | "invalid";
  guest_name?: string | null;
  party_size?: number;
  used_at?: string | null;
  token?: string;
};

export default function GatePage() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [enteredCount, setEnteredCount] = useState(0);

  const audioSuccessRef = useRef<HTMLAudioElement | null>(null);
  const audioErrorRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Generate simple synth beeps
    audioSuccessRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbqWE2M2DF2/POci8zWb7k8tiLMC1evuv24Y0zMFq46PXkjjQwWLbn8+eSNjBWs+Pu8aE8M0uq0dvYsl09R57G1eDOfDxEkrrL1N+eRz9CmLLFzNeZTD0="
    );
    audioErrorRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbqWE2M2DF2/POci8zWb7k8tiLMC1evuv24Y0zMFq46PXkjjQwWLbn8+eSNjBWs+Pu8aE8M0uq0dvYsl09R57G1eDOfDxEkrrL1N+eRz9CmLLFzNeZTD0="
    );
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "gate", credential: pin }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuth(true);
      } else {
        setAuthError(data.error || "رمز PIN غير صحيح");
      }
    } catch (e) {
      setAuthError("تعذر الاتصال بالخادم");
    }
  };

  const processToken = async (rawText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Extract token if text is a URL (e.g. https://domain.com/i/TOKEN)
    let token = rawText.trim();
    if (token.includes("/i/")) {
      const parts = token.split("/i/");
      token = parts[parts.length - 1].split("?")[0].split("#")[0];
    }

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data: ScanResult = await res.json();

      setScanResult(data);

      if (data.status === "allowed") {
        setEnteredCount((c) => c + (data.party_size || 1));
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([150, 50, 150]);
        }
        audioSuccessRef.current?.play().catch(() => {});
      } else {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([400]);
        }
        audioErrorRef.current?.play().catch(() => {});
      }
    } catch (e) {
      alert("حدث خطأ في الاتصال أثناء المسح");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForNext = () => {
    setScanResult(null);
    setManualCode("");
  };

  if (isAuth !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4 text-white" dir="rtl">
        <div className="w-full max-w-sm rounded-3xl bg-gray-800 p-8 shadow-2xl">
          <div className="text-center">
            <span className="text-4xl">🛡️</span>
            <h1 className="mt-2 text-2xl font-bold">بوابة القاعة - فحص QR</h1>
            <p className="mt-1 text-sm text-gray-400">أدخل رمز PIN المخصص للأمن</p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="أدخل رمز PIN"
                className="w-full rounded-2xl bg-gray-700 px-4 py-3.5 text-center text-2xl tracking-widest text-white outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
            </div>
            {authError && <p className="text-center text-sm text-red-400">{authError}</p>}
            <button type="submit" className="w-full rounded-2xl bg-emerald-600 py-3.5 text-lg font-bold hover:bg-emerald-700">
              دخول البوابة
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white" dir="rtl">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-3">
        <div>
          <h1 className="text-lg font-bold">بوابة القاعة</h1>
          <p className="text-xs text-emerald-400">● الكاميرا متصلة والمسح الذري نشط</p>
        </div>
        <div className="rounded-xl bg-gray-800 px-3 py-1.5 text-center">
          <p className="text-[10px] text-gray-400">الداخلين</p>
          <p className="font-mono text-xl font-bold text-emerald-400">{enteredCount}</p>
        </div>
      </header>

      {/* Main Scanner Section */}
      <main className="relative flex flex-1 flex-col items-center justify-center p-4">
        <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl border-2 border-emerald-500/50 bg-black shadow-2xl">
          {!scanResult && (
            <Scanner
              onScan={(detectedCodes) => {
                if (detectedCodes && detectedCodes[0] && detectedCodes[0].rawValue) {
                  processToken(detectedCodes[0].rawValue);
                }
              }}
              onError={(err) => console.log("Scanner error:", err)}
              components={{
                finder: true,
              }}
            />
          )}

          {/* Target Reticle Indicator */}
          {!scanResult && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold bg-black/60 px-3 py-1 rounded-full text-white/80">
                وجه الكاميرا نحو رمز QR للدعوة
              </span>
            </div>
          )}
        </div>

        {/* Manual Code Fallback */}
        <div className="mt-6 w-full max-w-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode.trim()) processToken(manualCode.trim());
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="أو أدخل الرمز يدوياً…"
              className="flex-1 rounded-2xl bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="rounded-2xl bg-gray-700 px-5 py-3 text-sm font-semibold hover:bg-gray-600 disabled:opacity-50"
            >
              فحص
            </button>
          </form>
        </div>
      </main>

      {/* Fullscreen Result Modal Overlay */}
      {scanResult && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200 ${
            scanResult.status === "allowed"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {scanResult.status === "allowed" ? (
            <div className="flex flex-col items-center">
              <span className="text-7xl">✓</span>
              <h2 className="mt-4 text-5xl font-black">مسموح بالدخول</h2>
              <div className="my-6 h-1 w-24 rounded-full bg-white/40" />

              <p className="text-4xl font-extrabold">
                {scanResult.guest_name || "ضيف كريم"}
              </p>
              <p className="mt-3 text-2xl font-semibold opacity-90">
                عدد الأشخاص: {scanResult.party_size || 1}
              </p>

              <p className="mt-2 text-xs opacity-70">
                تم تسجيل الدخول وحرق البطاقة بنجاح
              </p>
            </div>
          ) : scanResult.status === "already_used" ? (
            <div className="flex flex-col items-center">
              <span className="text-7xl">⚠️</span>
              <h2 className="mt-4 text-5xl font-black">مستخدمة مسبقاً!</h2>
              <div className="my-6 h-1 w-24 rounded-full bg-white/40" />

              <p className="text-3xl font-extrabold">
                {scanResult.guest_name || "بطاقة مسجلة"}
              </p>
              <p className="mt-3 text-xl font-medium opacity-90">
                وقت أول دخول:{" "}
                {scanResult.used_at
                  ? new Date(scanResult.used_at).toLocaleTimeString("ar-SA", {
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "سابقاً"}
              </p>
              <p className="mt-2 text-sm font-bold text-yellow-200">
                لا يُسمح بإعادة استخدام نفس البطاقة
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-7xl">✕</span>
              <h2 className="mt-4 text-5xl font-black">رمز غير صالح</h2>
              <div className="my-6 h-1 w-24 rounded-full bg-white/40" />
              <p className="text-2xl font-bold">هذه البطاقة غير مسجلة في النظام</p>
            </div>
          )}

          <button
            type="button"
            onClick={resetForNext}
            autoFocus
            className="mt-10 w-full max-w-xs rounded-2xl bg-white py-4 text-xl font-black text-gray-950 shadow-2xl transition hover:bg-gray-100 active:scale-95"
          >
            مسح التالي ❯
          </button>
        </div>
      )}
    </div>
  );
}

