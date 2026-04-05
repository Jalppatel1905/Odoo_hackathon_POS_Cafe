"use client";

import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { Order } from "@/types";

export default function CustomerDisplayPage() {
  const [mounted, setMounted] = useState(false);
  const { orders, loaded, loadData } = useStore();
  const [showThankYouOverride, setShowThankYouOverride] = useState(false);
  const lastPaidOrderIdRef = useRef<string | null>(null);
  const thankYouTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loaded) {
      loadData();
    }
  }, [mounted, loaded, loadData]);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      loadData();
    }, 3000);
    return () => clearInterval(interval);
  }, [mounted, loadData]);

  // Detect when an order transitions to paid -> show thank you for 10s then back to idle
  const lastOrder: Order | undefined =
    orders.length > 0 ? orders[orders.length - 1] : undefined;

  useEffect(() => {
    if (!lastOrder) return;
    if (lastOrder.status === "paid" && lastPaidOrderIdRef.current !== lastOrder.id) {
      lastPaidOrderIdRef.current = lastOrder.id;
      setShowThankYouOverride(true);
      if (thankYouTimerRef.current) clearTimeout(thankYouTimerRef.current);
      thankYouTimerRef.current = setTimeout(() => {
        setShowThankYouOverride(false);
      }, 10000);
    }
  }, [lastOrder]);

  useEffect(() => {
    return () => {
      if (thankYouTimerRef.current) clearTimeout(thankYouTimerRef.current);
    };
  }, []);

  if (!mounted) return null;

  const showOrder = lastOrder && lastOrder.status === "draft";
  const showThankYou = lastOrder && lastOrder.status === "paid" && showThankYouOverride;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream">
      {/* ===== LEFT BRANDING PANEL (40%) ===== */}
      <div className="relative flex w-[40%] flex-col items-center justify-between overflow-hidden border-r border-coffee-light/10 bg-cream-dark">
        {/* Decorative background circles */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-coffee/[0.03] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-coffee/[0.04] animate-[pulse_10s_ease-in-out_infinite_1s]" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-coffee/[0.02] animate-[pulse_12s_ease-in-out_infinite_2s]" />

        {/* Top decorative line */}
        <div className="relative z-10 mt-12 flex flex-col items-center gap-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-coffee-light/40 to-transparent" />
          <p className="font-serif text-xs uppercase tracking-[0.35em] text-coffee-light/50">
            Freshly Crafted
          </p>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-coffee-light/40 to-transparent" />
        </div>

        {/* Center logo + brand */}
        <div className="relative z-10 flex flex-col items-center gap-10">
          {/* Logo with glow ring */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-coffee/[0.06] blur-xl animate-[pulse_6s_ease-in-out_infinite]" />
            <div className="relative rounded-2xl border border-coffee-light/10 bg-cream p-2 shadow-lg shadow-coffee/[0.08]">
              <img
                src="/logo.png"
                alt="SipSync"
                className="h-36 w-36 rounded-xl object-contain"
              />
            </div>
          </div>

          {/* Brand name */}
          <div className="text-center">
            <h1 className="font-serif text-6xl font-bold tracking-tight text-espresso">
              SipSync
            </h1>
            <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-coffee/30 to-transparent" />
            <p className="mt-4 font-serif text-lg italic tracking-wide text-coffee-light/70">
              Premium Coffee Experience
            </p>
          </div>

          {/* Decorative coffee beans row */}
          <div className="flex items-center gap-3">
            <CoffeeBean className="h-3 w-3 text-coffee-light/30 animate-[pulse_4s_ease-in-out_infinite]" />
            <CoffeeBean className="h-4 w-4 text-coffee-light/40 animate-[pulse_4s_ease-in-out_infinite_0.5s]" />
            <CoffeeBean className="h-3 w-3 text-coffee-light/30 animate-[pulse_4s_ease-in-out_infinite_1s]" />
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 mb-10 flex flex-col items-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-coffee-light/20 to-transparent" />
          <p className="text-[11px] uppercase tracking-[0.4em] text-coffee-light/40">
            Powered by SipSync
          </p>
        </div>
      </div>

      {/* ===== RIGHT CONTENT PANEL (60%) ===== */}
      <div className="relative flex w-[60%] flex-col items-center justify-center overflow-hidden bg-cream p-16">
        {/* Subtle background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex h-full w-full max-w-2xl flex-col items-center justify-center">
          {showOrder ? (
            <OrderView order={lastOrder} />
          ) : showThankYou ? (
            <ThankYouView order={lastOrder} />
          ) : (
            <IdleView />
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================
// IDLE / WELCOME STATE
// =============================================
function IdleView() {
  return (
    <div className="flex flex-col items-center gap-10 text-center animate-[fadeIn_0.8s_ease-out]">
      {/* Animated coffee cup */}
      <div className="relative">
        <div className="absolute -inset-6 rounded-full bg-coffee/[0.04] animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute -inset-12 rounded-full bg-coffee/[0.02] animate-[pulse_5s_ease-in-out_infinite_1s]" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-cream-dark shadow-inner">
          <CoffeeCupIcon className="h-16 w-16 text-coffee" />
        </div>
        {/* Steam lines */}
        <div className="absolute -top-6 left-1/2 flex -translate-x-1/2 gap-2">
          <div className="h-8 w-[2px] rounded-full bg-coffee-light/20 animate-[steamRise_2.5s_ease-in-out_infinite]" />
          <div className="h-6 w-[2px] rounded-full bg-coffee-light/15 animate-[steamRise_2.5s_ease-in-out_infinite_0.4s]" />
          <div className="h-7 w-[2px] rounded-full bg-coffee-light/20 animate-[steamRise_2.5s_ease-in-out_infinite_0.8s]" />
        </div>
      </div>

      {/* Welcome text */}
      <div className="space-y-4">
        <h2 className="font-serif text-5xl font-bold leading-tight text-espresso">
          Welcome
        </h2>
        <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-coffee/30 to-transparent" />
        <p className="font-serif text-2xl font-light italic text-coffee-light">
          to SipSync Cafe
        </p>
      </div>

      {/* Subtle CTA */}
      <div className="mt-4 space-y-3">
        <p className="text-lg text-coffee-light/70">
          Your order details will appear here
        </p>
        <p className="text-sm uppercase tracking-[0.3em] text-coffee-light/40">
          Place your order with our barista
        </p>
      </div>
    </div>
  );
}

// =============================================
// ORDER IN PROGRESS
// =============================================
function OrderView({ order }: { order: Order }) {
  return (
    <div className="flex h-full w-full flex-col animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-coffee-light/60">
          Your Order
        </p>
        <h2 className="mt-2 font-serif text-4xl font-bold text-espresso">
          Order #{order.orderNo}
        </h2>
        <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-coffee/20 to-transparent" />
      </div>

      {/* Order lines */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
        {/* Column headers */}
        <div className="mb-3 flex items-center px-6 text-xs uppercase tracking-[0.2em] text-coffee-light/50">
          <span className="w-16">Qty</span>
          <span className="flex-1">Item</span>
          <span className="text-right">Price</span>
        </div>

        <div className="space-y-2">
          {order.lines.map((line, idx) => (
            <div
              key={line.id || idx}
              className="flex items-center rounded-xl border border-coffee-light/[0.06] bg-cream-dark/70 px-6 py-4 transition-all duration-300"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <span className="w-16 font-serif text-xl font-semibold text-coffee">
                {line.quantity}x
              </span>
              <span className="flex-1 text-xl font-medium text-espresso">
                {line.productName}
              </span>
              <span className="text-xl font-semibold tabular-nums text-coffee">
                {formatCurrency(line.subtotal)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals section */}
      <div className="mt-8 border-t border-coffee-light/10 pt-6">
        <div className="space-y-3">
          <div className="flex justify-between px-2 text-lg text-coffee-light/70">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between px-2 text-lg text-coffee-light/70">
            <span>Tax</span>
            <span className="tabular-nums">{formatCurrency(order.tax)}</span>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-coffee-light/10 via-coffee-light/20 to-coffee-light/10" />
          <div className="flex items-baseline justify-between rounded-xl bg-espresso/[0.04] px-5 py-4">
            <span className="font-serif text-2xl font-bold text-espresso">
              Total
            </span>
            <span className="font-serif text-3xl font-bold tabular-nums text-espresso">
              {formatCurrency(order.finalTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// PAYMENT COMPLETE / THANK YOU
// =============================================
function ThankYouView({ order }: { order: Order }) {
  return (
    <div className="flex flex-col items-center gap-10 text-center animate-[fadeIn_0.6s_ease-out]">
      {/* Animated checkmark */}
      <div className="relative">
        <div className="absolute -inset-6 rounded-full bg-success/[0.08] animate-[pulse_3s_ease-in-out_infinite]" />
        <div className="absolute -inset-12 rounded-full bg-success/[0.04] animate-[pulse_4s_ease-in-out_infinite_0.5s]" />
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-success/10 shadow-lg shadow-success/[0.08]">
          <svg
            className="h-16 w-16 text-success animate-[scaleIn_0.5s_ease-out]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              className="animate-[drawCheck_0.6s_ease-out_0.3s_both]"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: 24,
              }}
            />
          </svg>
        </div>
      </div>

      {/* Thank you message */}
      <div className="space-y-3">
        <h2 className="font-serif text-5xl font-bold text-espresso">
          Thank You!
        </h2>
        <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-success/30 to-transparent" />
      </div>

      {/* Total paid */}
      <div className="rounded-2xl border border-coffee-light/[0.08] bg-cream-dark px-16 py-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-coffee-light/60">
          Total Paid
        </p>
        <p className="mt-2 font-serif text-5xl font-bold tabular-nums text-espresso">
          {formatCurrency(order.finalTotal)}
        </p>
      </div>

      {/* Visit again */}
      <div className="space-y-2">
        <p className="font-serif text-xl italic text-coffee-light/70">
          We hope you enjoyed your visit
        </p>
        <p className="text-sm uppercase tracking-[0.25em] text-coffee-light/40">
          Please visit again soon
        </p>
      </div>
    </div>
  );
}

// =============================================
// SVG ICON COMPONENTS
// =============================================
function CoffeeCupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Cup body */}
      <path d="M12 24h32v24a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8V24z" />
      {/* Handle */}
      <path d="M44 28h4a6 6 0 0 1 0 12h-4" />
      {/* Saucer */}
      <path d="M6 56h44" />
      {/* Liquid line */}
      <path d="M16 32h24" opacity="0.3" />
    </svg>
  );
}

function CoffeeBean({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <ellipse cx="8" cy="8" rx="5" ry="7" />
      <path d="M8 2c-1.5 2.5 0 5 1 7s-0.5 4.5-1 5" stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
    </svg>
  );
}

// =============================================
// HELPERS
// =============================================
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}
