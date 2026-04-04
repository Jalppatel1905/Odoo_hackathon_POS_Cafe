"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Coffee } from "lucide-react";
import { Suspense } from "react";

function SplashContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "1";
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0);
      setTimeout(() => {
        router.push(`/self-order/menu?table=${table}`);
      }, 500);
    }, 2500);
    return () => clearTimeout(timer);
  }, [router, table]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        opacity,
        background: "linear-gradient(135deg, #3C2415 0%, #6F4E37 50%, #8B6F5E 100%)",
      }}
    >
      <div className="animate-bounce mb-6">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
          <img src="/logo.png" alt="SipSync" className="w-16 h-16 rounded-xl object-contain" />
        </div>
      </div>
      <h1 className="text-4xl font-serif font-bold text-white mb-2">
        Sip<span className="text-[#D4A574] font-sans font-normal">Sync</span>
      </h1>
      <p className="text-white/60 text-sm">Table {table}</p>
      <div className="mt-8 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-white/40 animate-pulse"
            style={{ animationDelay: `${i * 300}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function SelfOrderSplash() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#3C2415" }}>
          <Coffee className="w-10 h-10 text-[#D4A574] animate-pulse" />
        </div>
      }
    >
      <SplashContent />
    </Suspense>
  );
}
