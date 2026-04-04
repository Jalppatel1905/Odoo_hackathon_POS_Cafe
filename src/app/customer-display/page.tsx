"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Order } from "@/types";
import { Coffee, Check } from "lucide-react";

export default function CustomerDisplayPage() {
  const [mounted, setMounted] = useState(false);
  const { orders, loaded, loadData } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loaded) {
      loadData();
    }
  }, [mounted, loaded, loadData]);

  // Auto-refresh: re-read data every 3 seconds
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      loadData();
    }, 3000);
    return () => clearInterval(interval);
  }, [mounted, loadData]);

  if (!mounted) return null;

  const lastOrder: Order | undefined = orders.length > 0 ? orders[orders.length - 1] : undefined;
  const showOrder = lastOrder && lastOrder.status === "draft";
  const showThankYou = lastOrder && lastOrder.status === "paid";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream">
      {/* Left Side - Fixed Branding */}
      <div className="flex w-[40%] flex-col items-center justify-between bg-espresso py-16">
        <div />

        <div className="flex flex-col items-center gap-8">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-latte/20">
            <Coffee className="h-16 w-16 text-latte" />
          </div>
          <div className="text-center">
            <h1 className="font-serif text-5xl font-bold text-cream">
              SipSync
            </h1>
            <p className="mt-3 text-xl text-cream-medium">
              Welcome to SipSync
            </p>
          </div>
        </div>

        <p className="text-sm tracking-wider text-coffee-light">
          Powered by SipSync
        </p>
      </div>

      {/* Right Side - Dynamic Content */}
      <div className="flex w-[60%] flex-col items-center justify-center p-12">
        {showOrder ? (
          <OrderView order={lastOrder} />
        ) : showThankYou ? (
          <ThankYouView order={lastOrder} />
        ) : (
          <IdleView />
        )}
      </div>
    </div>
  );
}

// ---- Idle / Welcome Screen ----
function IdleView() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cream-dark">
        <Coffee className="h-14 w-14 text-coffee" />
      </div>
      <h2 className="font-serif text-4xl font-bold text-espresso">
        Welcome to SipSync
      </h2>
      <p className="max-w-md text-lg text-coffee-light">
        Your order details will appear here. Please let our staff know what
        you&apos;d like!
      </p>
    </div>
  );
}

// ---- Active Order View ----
function OrderView({ order }: { order: Order }) {
  return (
    <div className="flex h-full w-full max-w-xl flex-col">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="font-serif text-3xl font-bold text-espresso">
          Your Order
        </h2>
        <p className="mt-1 text-lg text-coffee-light">
          Order #{order.orderNo}
        </p>
      </div>

      {/* Order Lines */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-3">
          {order.lines.map((line, idx) => (
            <div
              key={line.id || idx}
              className="flex items-center justify-between rounded-xl bg-cream-dark px-6 py-4"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-semibold text-coffee">
                  {line.quantity} x
                </span>
                <span className="text-xl text-espresso">
                  {line.productName}
                </span>
              </div>
              <span className="text-xl font-semibold text-coffee">
                {formatCurrency(line.subtotal)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 space-y-3 border-t-2 border-cream-dark pt-6">
        <div className="flex justify-between text-lg text-coffee-light">
          <span>Sub Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        <div className="flex justify-between text-lg text-coffee-light">
          <span>Tax</span>
          <span>{formatCurrency(order.tax)}</span>
        </div>
        <div className="flex justify-between text-2xl font-bold text-espresso">
          <span>Total</span>
          <span>{formatCurrency(order.finalTotal)}</span>
        </div>
      </div>
    </div>
  );
}

// ---- Thank You View ----
function ThankYouView({ order }: { order: Order }) {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-success/15">
        <Check className="h-16 w-16 text-success" strokeWidth={3} />
      </div>
      <div>
        <h2 className="font-serif text-4xl font-bold text-espresso">
          Thank you for visiting!
        </h2>
        <p className="mt-3 text-xl text-coffee-light">See you again</p>
      </div>
      <div className="rounded-2xl bg-cream-dark px-12 py-6">
        <p className="text-lg text-coffee-light">Total Paid</p>
        <p className="mt-1 text-4xl font-bold text-espresso">
          {formatCurrency(order.finalTotal)}
        </p>
      </div>
    </div>
  );
}

// ---- Helpers ----
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}
