"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { wedding } from "@/config/wedding";

export function VenueMedia() {
  const [canPlayVideo, setCanPlayVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [userPrefersVideo, setUserPrefersVideo] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 1. Detect network speed using Network Information API if available
    const nav = navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        saveData?: boolean;
        downlink?: number;
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    };

    const checkConnection = () => {
      const conn = nav.connection;
      if (conn) {
        if (conn.saveData) {
          setIsSlowNetwork(true);
          return false;
        }
        if (conn.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)) {
          setIsSlowNetwork(true);
          return false;
        }
        if (typeof conn.downlink === "number" && conn.downlink < 1.5) {
          setIsSlowNetwork(true);
          return false;
        }
      }
      setIsSlowNetwork(false);
      return true;
    };

    const isFast = checkConnection();

    if (isFast) {
      setCanPlayVideo(true);
    } else {
      setCanPlayVideo(false);
    }

    if (nav.connection?.addEventListener) {
      const handler = () => {
        const fast = checkConnection();
        setCanPlayVideo(fast);
      };
      nav.connection.addEventListener("change", handler);
      return () => nav.connection?.removeEventListener?.("change", handler);
    }
  }, []);

  // Determine whether video should be rendered and played
  const shouldShowVideo = userPrefersVideo !== null ? userPrefersVideo : canPlayVideo;

  return (
    <div className="relative aspect-[9/12] max-h-[38svh] w-full overflow-hidden rounded-[1.35rem] bg-cream shadow-inner">
      {/* 1. Base Image: loads immediately (42KB WebP) */}
      <Image
        src={wedding.venue.image}
        alt={`${wedding.venue.nameAr} - ${wedding.venue.nameEn}`}
        fill
        sizes="(max-width: 640px) 85vw, 400px"
        priority
        className="object-cover"
      />

      {/* 2. Video layer: rendered only if connection is fast or requested by user */}
      {shouldShowVideo && wedding.venue.video && (
        <video
          ref={videoRef}
          src={wedding.venue.video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => {
            setCanPlayVideo(false);
            setVideoLoaded(false);
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* 3. Subtle Luxury Badge / Switcher */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-[rgb(177_138_78/0.4)] bg-[rgb(255_252_247/0.85)] px-3 py-1 text-xs text-bronze shadow-[0_4px_12px_rgba(142,107,59,0.2)] backdrop-blur-md">
        {shouldShowVideo && videoLoaded ? (
          <button
            type="button"
            onClick={() => setUserPrefersVideo(false)}
            title="عرض الصورة لتوفير البيانات"
            className="flex items-center gap-1.5 font-medium hover:text-gold"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            <span>فيديو القاعة</span>
          </button>
        ) : isSlowNetwork ? (
          <button
            type="button"
            onClick={() => setUserPrefersVideo(true)}
            title="اتصال ضعيف - انقر لتشغيل الفيديو"
            className="flex items-center gap-1.5 font-medium text-taupe hover:text-gold"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>عرض الفيديو</span>
          </button>
        ) : (
          <span className="flex items-center gap-1.5 font-medium text-taupe">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.6" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span>صورة القاعة</span>
          </span>
        )}
      </div>
    </div>
  );
}
