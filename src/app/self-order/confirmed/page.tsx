"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Coffee, CheckCircle, Clock, ArrowRight } from "lucide-react";

function ConfirmedContent() {
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "1";
  const orderNo = searchParams.get("order") || "0000";
  const total = searchParams.get("total") || "0.00";

  return (
    <div className="min-h-screen bg-[#FCF9F5] flex flex-col items-center justify-center px-6 md:px-8 text-center">
      <div className="w-full max-w-md lg:max-w-lg">
        {/* Success Animation */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-14 h-14 md:w-16 md:h-16 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#3C2415] mb-2">
          Order Confirmed!
        </h1>
        <p className="text-[#8B6F5E] text-sm md:text-base mb-6 md:mb-8">
          Your order has been sent to the kitchen
        </p>

        {/* Order Info Card */}
        <div className="w-full bg-white rounded-2xl border border-[#EDD9C4] p-6 md:p-8 mb-6 md:mb-8 space-y-4 md:space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-[#8B6F5E] uppercase tracking-wider">Order Number</span>
            <span className="text-xl md:text-2xl font-bold text-[#6F4E37]">#{orderNo}</span>
          </div>
          <div className="border-t border-[#EDD9C4]" />
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-[#8B6F5E] uppercase tracking-wider">Table</span>
            <span className="text-sm md:text-base font-semibold text-[#3C2415]">Table {table}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-[#8B6F5E] uppercase tracking-wider">Total Amount</span>
            <span className="text-lg md:text-xl font-bold text-[#3C2415]">${total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-[#8B6F5E] uppercase tracking-wider">Payment</span>
            <span className="text-sm md:text-base font-medium text-[#6F4E37]">Pay at Counter</span>
          </div>
        </div>

        {/* Status */}
        <div className="w-full bg-[#F5E6D3] rounded-2xl p-4 md:p-5 mb-6 md:mb-8 flex items-center gap-3">
          <Clock className="w-5 h-5 md:w-6 md:h-6 text-[#6F4E37] shrink-0" />
          <div className="text-left">
            <p className="text-sm md:text-base font-semibold text-[#3C2415]">Being Prepared</p>
            <p className="text-xs md:text-sm text-[#8B6F5E]">Your food is being prepared in the kitchen</p>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <Link
            href={`/self-order/track?table=${table}&order=${orderNo}`}
            className="w-full flex items-center justify-center gap-2 bg-[#6F4E37] text-white py-3.5 md:py-4 rounded-2xl font-semibold text-sm md:text-base hover:bg-[#5C3D2E] transition"
          >
            Track My Order <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/self-order/menu?table=${table}`}
            className="w-full flex items-center justify-center gap-2 bg-white border border-[#EDD9C4] text-[#6F4E37] py-3.5 md:py-4 rounded-2xl font-semibold text-sm md:text-base hover:bg-[#F5E6D3] transition"
          >
            Order More
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[#8B6F5E]">
          <Coffee className="w-4 h-4" />
          <span className="text-xs">Powered by SipSync</span>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCF9F5] flex items-center justify-center"><Coffee className="w-8 h-8 text-[#6F4E37] animate-pulse" /></div>}>
      <ConfirmedContent />
    </Suspense>
  );
}
