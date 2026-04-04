"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Coffee, ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";

function CartContent() {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "1";

  const { products, loaded, loadData, addOrder, addCustomer, activeSession } = useStore();
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");

  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem("selfOrderCart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (mounted && !loaded) loadData();
  }, [mounted, loaded, loadData]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([pid, qty]) => {
        const product = products.find((p) => p.id === pid);
        if (!product) return null;
        return { ...product, qty };
      })
      .filter(Boolean) as (typeof products[0] & { qty: number })[];
  }, [cart, products]);

  const subtotal = cartItems.reduce((s, item) => s + item.price * item.qty, 0);
  const tax = cartItems.reduce((s, item) => s + (item.price * item.qty * item.tax) / 100, 0);
  const total = subtotal + tax;
  const totalQty = cartItems.reduce((s, item) => s + item.qty, 0);

  const updateQty = (pid: string, delta: number) => {
    setCart((prev) => {
      const newQty = (prev[pid] || 0) + delta;
      if (newQty <= 0) {
        const { [pid]: _, ...rest } = prev;
        sessionStorage.setItem("selfOrderCart", JSON.stringify(rest));
        return rest;
      }
      const updated = { ...prev, [pid]: newQty };
      sessionStorage.setItem("selfOrderCart", JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (pid: string) => {
    setCart((prev) => {
      const { [pid]: _, ...rest } = prev;
      sessionStorage.setItem("selfOrderCart", JSON.stringify(rest));
      return rest;
    });
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || submitting) return;
    setSubmitting(true);

    const orderNo = String(Math.floor(Math.random() * 9000) + 1000);
    const order = {
      id: Math.random().toString(36).substring(2, 10),
      orderNo,
      sessionId: activeSession?.id || "",
      date: new Date().toISOString(),
      tableId: `table-${table}`,
      tableNumber: parseInt(table),
      lines: cartItems.map((item) => ({
        id: Math.random().toString(36).substring(2, 10),
        productId: item.id,
        productName: item.name,
        quantity: item.qty,
        price: item.price,
        tax: item.tax,
        unit: item.unit,
        subtotal: item.price * item.qty,
        notes: "",
      })),
      total: subtotal,
      tax,
      finalTotal: total,
      status: "draft" as const,
      customerId: "",
      customerName: custName || "Self Order",
      payments: [],
      kitchenStatus: "to_cook" as const,
    };

    // Save customer if name provided
    if (custName.trim()) {
      const custId = Math.random().toString(36).substring(2, 10);
      await addCustomer({
        id: custId,
        name: custName.trim(),
        phone: custPhone.trim(),
        email: "",
        address: { street1: "", street2: "", city: "", state: "", country: "" },
        totalSales: 0,
      });
    }

    await addOrder(order);
    sessionStorage.removeItem("selfOrderCart");
    router.push(`/self-order/confirmed?table=${table}&order=${orderNo}&total=${total.toFixed(2)}`);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FCF9F5] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#FCF9F5] border-b border-[#EDD9C4]">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/self-order/menu?table=${table}`)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-[#EDD9C4] flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-[#6F4E37]" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-serif font-bold text-[#3C2415]">Your Cart</h1>
              <p className="text-xs md:text-sm text-[#8B6F5E]">{totalQty} items - Table {table}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-6 py-4 md:py-6 space-y-3 md:space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <Coffee className="w-12 h-12 text-[#EDD9C4] mx-auto mb-3" />
            <p className="text-[#8B6F5E] text-sm">Your cart is empty</p>
            <button
              onClick={() => router.push(`/self-order/menu?table=${table}`)}
              className="mt-4 text-sm text-[#6F4E37] font-medium underline"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#EDD9C4] p-4 md:p-5 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-semibold text-[#3C2415]">{item.name}</h3>
                <p className="text-sm md:text-base text-[#6F4E37] font-bold mt-1">
                  ${(item.price * item.qty).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 bg-[#F5E6D3] rounded-full px-1 py-1">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center text-[#6F4E37] shadow-sm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-[#3C2415] w-5 text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#6F4E37] flex items-center justify-center text-white shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[#8B6F5E] hover:text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Summary + Place Order */}
      {cartItems.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-[#EDD9C4]">
          <div className="max-w-2xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-3 md:space-y-4">
            {/* Customer details */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <input
                type="text"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="Your Name"
                className="flex-1 border border-[#EDD9C4] rounded-xl p-2.5 md:p-3 text-sm md:text-base outline-none focus:ring-2 focus:ring-[#6F4E37]/30 bg-[#FCF9F5]"
              />
              <input
                type="tel"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="Phone"
                className="flex-1 border border-[#EDD9C4] rounded-xl p-2.5 md:p-3 text-sm md:text-base outline-none focus:ring-2 focus:ring-[#6F4E37]/30 bg-[#FCF9F5]"
              />
            </div>

            <div className="space-y-2 text-sm md:text-base">
              <div className="flex justify-between text-[#8B6F5E]">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8B6F5E]">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#3C2415] font-bold text-base md:text-lg pt-2 border-t border-[#EDD9C4]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="w-full bg-[#6F4E37] text-white py-4 rounded-2xl font-semibold text-sm md:text-base hover:bg-[#5C3D2E] transition disabled:opacity-50 shadow-lg"
            >
              {submitting ? "Placing Order..." : "Place Order - Pay at Counter"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCF9F5] flex items-center justify-center"><Coffee className="w-8 h-8 text-[#6F4E37] animate-pulse" /></div>}>
      <CartContent />
    </Suspense>
  );
}
