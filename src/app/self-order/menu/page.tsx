"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Coffee, Search, ShoppingCart, Plus, Minus, ArrowLeft } from "lucide-react";

function MenuContent() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "1";

  const { products, categories, loaded, loadData } = useStore();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !loaded) loadData();
  }, [mounted, loaded, loadData]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [products, selectedCategory, search]);

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [pid, qty]) => {
    const product = products.find((p) => p.id === pid);
    return sum + (product ? product.price * qty : 0);
  }, 0);

  const addToCart = (pid: string) => {
    setCart((prev) => ({ ...prev, [pid]: (prev[pid] || 0) + 1 }));
  };

  const removeFromCart = (pid: string) => {
    setCart((prev) => {
      const newQty = (prev[pid] || 0) - 1;
      if (newQty <= 0) {
        const { [pid]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [pid]: newQty };
    });
  };

  const goToCart = () => {
    if (cartCount === 0) return;
    // Store cart in sessionStorage for the cart page
    sessionStorage.setItem("selfOrderCart", JSON.stringify(cart));
    sessionStorage.setItem("selfOrderTable", table);
    router.push(`/self-order/cart?table=${table}`);
  };

  if (!mounted || !loaded) {
    return (
      <div className="min-h-screen bg-[#FCF9F5] flex items-center justify-center">
        <Coffee className="w-8 h-8 text-[#6F4E37] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF9F5] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#FCF9F5] border-b border-[#EDD9C4] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SipSync" className="w-7 h-7 rounded-lg object-contain" />
            <span className="text-lg font-serif font-bold text-[#3C2415]">
              Sip<span className="text-[#D4A574] font-sans font-normal">Sync</span>
            </span>
          </div>
          <span className="text-xs bg-[#6F4E37] text-white px-2.5 py-1 rounded-full font-medium">
            Table {table}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B6F5E]" />
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EDD9C4] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#6F4E37]/30"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              !selectedCategory
                ? "bg-[#6F4E37] text-white"
                : "bg-white text-[#8B6F5E] border border-[#EDD9C4]"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? "text-white"
                  : "bg-white text-[#8B6F5E] border border-[#EDD9C4]"
              }`}
              style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="flex-1 px-4 py-4 space-y-3 pb-24">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-[#8B6F5E]">No items found</div>
        ) : (
          filteredProducts.map((product) => {
            const qty = cart[product.id] || 0;
            const cat = categories.find((c) => c.id === product.category);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#EDD9C4] p-4 flex items-center gap-4"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (cat?.color || "#6F4E37") + "15" }}
                >
                  <Coffee className="w-6 h-6" style={{ color: cat?.color || "#6F4E37" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#3C2415]">{product.name}</h3>
                  <p className="text-xs text-[#8B6F5E] truncate">{product.description}</p>
                  <p className="text-sm font-bold text-[#6F4E37] mt-1">${product.price}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {qty > 0 ? (
                    <div className="flex items-center gap-2 bg-[#F5E6D3] rounded-full px-1 py-1">
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#6F4E37] shadow-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-[#3C2415] w-5 text-center">{qty}</span>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="w-7 h-7 rounded-full bg-[#6F4E37] flex items-center justify-center text-white shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-9 h-9 rounded-full bg-[#6F4E37] flex items-center justify-center text-white shadow-md hover:bg-[#5C3D2E] transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cart Footer */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="max-w-md mx-auto px-4 pb-4">
            <button
              onClick={goToCart}
              className="w-full bg-[#6F4E37] text-white py-4 rounded-2xl flex items-center justify-between px-6 shadow-xl hover:bg-[#5C3D2E] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">{cartCount} items</span>
              </div>
              <span className="font-bold">${cartTotal.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCF9F5] flex items-center justify-center"><Coffee className="w-8 h-8 text-[#6F4E37] animate-pulse" /></div>}>
      <MenuContent />
    </Suspense>
  );
}
