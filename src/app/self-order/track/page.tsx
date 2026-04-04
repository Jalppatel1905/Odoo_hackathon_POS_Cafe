"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { Coffee, ChefHat, Clock, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";

function TrackContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "1";
  const orderNo = searchParams.get("order") || "";

  const { orders, loaded, loadData } = useStore();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !loaded) loadData();
  }, [mounted, loaded, loadData]);

  // Auto refresh every 5 seconds
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [mounted, loadData]);

  const order = useMemo(() => {
    if (!orderNo) return orders.find((o) => o.tableNumber === parseInt(table));
    return orders.find((o) => o.orderNo === orderNo);
  }, [orders, orderNo, table]);

  const stages = [
    { key: "to_cook", label: "Order Received", icon: Clock, color: "text-orange-500", bg: "bg-orange-100" },
    { key: "preparing", label: "Preparing", icon: ChefHat, color: "text-blue-500", bg: "bg-blue-100" },
    { key: "completed", label: "Ready!", icon: CheckCircle, color: "text-green-500", bg: "bg-green-100" },
  ];

  const currentStageIndex = order
    ? stages.findIndex((s) => s.key === order.kitchenStatus)
    : 0;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FCF9F5] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#FCF9F5] border-b border-[#EDD9C4] px-4 py-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/self-order/menu?table=${table}`}
            className="w-9 h-9 rounded-full bg-white border border-[#EDD9C4] flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-[#6F4E37]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-serif font-bold text-[#3C2415]">Track Order</h1>
            <p className="text-xs text-[#8B6F5E]">
              {order ? `Order #${order.orderNo}` : "No order found"}
            </p>
          </div>
          <button
            onClick={() => loadData()}
            className="w-9 h-9 rounded-full bg-white border border-[#EDD9C4] flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 text-[#6F4E37]" />
          </button>
        </div>
      </div>

      {!order ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <Coffee className="w-12 h-12 text-[#EDD9C4] mb-3" />
          <p className="text-[#8B6F5E] text-sm">No active order found</p>
          <Link
            href={`/self-order/menu?table=${table}`}
            className="mt-4 text-sm text-[#6F4E37] font-medium underline"
          >
            Place an Order
          </Link>
        </div>
      ) : (
        <div className="flex-1 px-4 py-6 space-y-6">
          {/* Progress Steps */}
          <div className="bg-white rounded-2xl border border-[#EDD9C4] p-6">
            <div className="space-y-6">
              {stages.map((stage, i) => {
                const isActive = i === currentStageIndex;
                const isDone = i < currentStageIndex;
                const isPending = i > currentStageIndex;

                return (
                  <div key={stage.key} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isDone
                            ? "bg-green-100"
                            : isActive
                            ? stage.bg
                            : "bg-gray-100"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <stage.icon
                            className={`w-5 h-5 ${
                              isActive ? stage.color : "text-gray-300"
                            }`}
                          />
                        )}
                      </div>
                      {i < stages.length - 1 && (
                        <div
                          className={`w-0.5 h-8 mt-1 ${
                            isDone ? "bg-green-300" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-2">
                      <p
                        className={`text-sm font-semibold ${
                          isPending ? "text-gray-300" : "text-[#3C2415]"
                        }`}
                      >
                        {stage.label}
                      </p>
                      {isActive && (
                        <p className="text-xs text-[#8B6F5E] mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6F4E37] animate-pulse" />
                          In progress...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-[#EDD9C4] p-4">
            <h3 className="text-sm font-semibold text-[#3C2415] mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.lines.map((line) => (
                <div key={line.id} className="flex justify-between text-sm">
                  <span className="text-[#8B6F5E]">
                    {line.quantity}x {line.productName}
                  </span>
                  <span className="text-[#3C2415] font-medium">
                    ${line.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-[#EDD9C4] pt-2 mt-2 flex justify-between font-bold text-[#3C2415]">
                <span>Total</span>
                <span>${order.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="text-center">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${
                order.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {order.status === "paid" ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Paid
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" /> Pay at Counter
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="py-4 text-center text-[#8B6F5E] flex items-center justify-center gap-2">
        <Coffee className="w-4 h-4" />
        <span className="text-xs">Powered by SipSync</span>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCF9F5] flex items-center justify-center"><Coffee className="w-8 h-8 text-[#6F4E37] animate-pulse" /></div>}>
      <TrackContent />
    </Suspense>
  );
}
