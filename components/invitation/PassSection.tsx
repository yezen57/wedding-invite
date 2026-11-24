"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { copy } from "@/config/copy";
import { wedding, dateDots } from "@/config/wedding";
import { Divider } from "./Ornaments";
import { Reveal, SectionTitle } from "./Reveal";

export function PassSection({
  token,
  guestName,
  partySize,
  usedAt,
}: {
  token: string;
  guestName?: string | null;
  partySize: number;
  usedAt?: string | null;
}) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!usedAt && token) {
      QRCode.toDataURL(token, {
        width: 320,
        margin: 1.5,
        color: {
          dark: "#632238",
          light: "#FFF8FA",
        },
      })
        .then(setQrUrl)
        .catch(console.error);
    }
  }, [token, usedAt]);

  const downloadPass = () => {
    if (!qrUrl) return;
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 840;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw luxury blush rose card
    ctx.fillStyle = "#FFF5F7";
    ctx.fillRect(0, 0, 600, 840);

    ctx.strokeStyle = "#B35978";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 560, 800);

    ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, 544, 784);

    ctx.fillStyle = "#632238";
    ctx.textAlign = "center";
    ctx.font = "bold 34px serif";
    ctx.fillText(`${wedding.groom} & ${wedding.bride}`, 300, 85);

    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#965A6E";
    ctx.fillText("تتشرف حرم / صدام علي ناجي وحرم / معاذ عبده الحرثي", 300, 120);

    ctx.font = "bold 20px serif";
    ctx.fillStyle = "#B35978";
    ctx.fillText(copy.pass.title, 300, 155);

    if (guestName) {
      ctx.fillStyle = "#632238";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`${copy.pass.greeting} ${guestName}`, 300, 195);
    }

    ctx.fillStyle = "#B35978";
    ctx.font = "20px sans-serif";
    ctx.fillText(copy.pass.partySize(partySize), 300, 230);

    // Draw QR image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 160, 260, 280, 280);

      ctx.fillStyle = "#965A6E";
      ctx.font = "16px sans-serif";
      ctx.fillText(copy.pass.hint, 300, 595);

      ctx.fillStyle = "#632238";
      ctx.font = "22px serif";
      ctx.fillText(`${wedding.venue.nameAr} - ${wedding.venue.nameEn}`, 300, 680);

      ctx.font = "18px serif";
      ctx.fillText(dateDots(), 300, 720);

      const a = document.createElement("a");
      a.download = `wedding-pass-${token.slice(0, 8)}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = qrUrl;
  };

  const isUsed = Boolean(usedAt);

  return (
    <section data-snap data-ornament="soft" className="snap-section">
      <Divider className="mb-6" />
      <SectionTitle sub={copy.pass.hint}>{copy.pass.title}</SectionTitle>

      <Reveal delay={0.1} className="paper-card mt-6 w-full max-w-[22rem] p-6 text-center">
        <div ref={cardRef} className="flex flex-col items-center">
          <p className="font-serif text-lg font-medium text-gold">{dateDots()}</p>
          <p className="text-xs text-taupe mt-1 mb-0.5">تتشرف حرم / صدام علي ناجي وحرم / معاذ عبده الحرثي</p>
          <h3 className="font-display text-3xl text-bronze">
            {wedding.groom} & {wedding.bride}
          </h3>

          <div className="my-3 h-px w-32 bg-linear-to-r from-transparent via-[var(--gold)] to-transparent" />

          {guestName && (
            <p className="text-lg font-bold text-bronze">
              {copy.pass.greeting} {guestName}
            </p>
          )}

          <p className="mt-1 text-sm font-semibold text-gold">
            {copy.pass.partySize(partySize)}
          </p>

          <div className="my-5 flex aspect-square w-52 items-center justify-center rounded-2xl border-2 border-[var(--gold)] bg-[#FFF8FA] p-3 shadow-inner">
            {isUsed ? (
              <div className="flex flex-col items-center justify-center p-3 text-center">
                <svg viewBox="0 0 24 24" className="h-10 w-10 text-gold" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-base font-bold text-bronze">{copy.pass.used}</p>
                <p className="mt-1 text-xs text-taupe">{copy.pass.usedHint}</p>
              </div>
            ) : qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="QR Code" className="h-full w-full object-contain" />
            ) : (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
            )}
          </div>

          {!isUsed && qrUrl && (
            <button type="button" onClick={downloadPass} className="paper-btn mt-2 w-full py-2.5 text-sm">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {copy.pass.save}
            </button>
          )}
        </div>
      </Reveal>
    </section>
  );
}

