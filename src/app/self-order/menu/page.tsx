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

  // Desktop cart sidebar content
  const cartItems = Object.entries(cart)
    .map(([pid, qty]) => {
      const product = products.find((p) => p.id === pid);
      if (!product) return null;
      return { ...product, qty };
    })
    .filter(Boolean) as (typeof products[0] & { qty: number })[];

  return (
    <div className="min-h-screen bg-[#FCF9F5] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#FCF9F5] border-b border-[#EDD9C4]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 md:gap-3">
              <img src="/logo.png" alt="SipSync" className="w-7 h-7 md:w-9 md:h-9 rounded-lg object-contain" />
              <span className="text-lg md:text-xl font-serif font-bold text-[#3C2415]">
                Sip<span className="text-[#D4A574] font-sans font-normal">Sync</span>
              </span>
            </div>
            <span className="text-xs md:text-sm bg-[#6F4E37] text-white px-2.5 md:px-4 py-1 md:py-1.5 rounded-full font-medium">
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
              className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white border border-[#EDD9C4] rounded-xl text-sm md:text-base outline-none focus:ring-2 focus:ring-[#6F4E37]/30"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition ${
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
                className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition ${
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
      </div>

      {/* Main Content: Products + Desktop Cart Sidebar */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Products Grid */}
        <div className="flex-1 px-4 lg:px-8 py-4 md:py-6 pb-24 lg:pb-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-[#8B6F5E]">No items found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product) => {
                const qty = cart[product.id] || 0;
                const cat = categories.find((c) => c.id === product.category);
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-[#EDD9C4] p-4 md:p-5 flex items-center gap-4 sm:flex-col sm:items-stretch sm:text-center"
                  >
                    <div
                      className="w-14 h-14 sm:w-full sm:h-24 md:h-28 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: (cat?.color || "#6F4E37") + "15" }}
                    >
                      <Coffee className="w-6 h-6 sm:w-10 sm:h-10" style={{ color: cat?.color || "#6F4E37" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-base font-semibold text-[#3C2415]">{product.name}</h3>
                      <p className="text-xs md:text-sm text-[#8B6F5E] truncate">{product.description}</p>
                      <p className="text-sm md:text-lg font-bold text-[#6F4E37] mt-1">₹{product.price}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 shrink-0 sm:mt-2">
                      {qty > 0 ? (
                        <div className="flex items-center gap-2 bg-[#F5E6D3] rounded-full px-1 py-1">
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center text-[#6F4E37] shadow-sm"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold text-[#3C2415] w-5 text-center">{qty}</span>
                          <button
                            onClick={() => addToCart(product.id)}
                            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#6F4E37] flex items-center justify-center text-white shadow-sm"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product.id)}
                          className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#6F4E37] flex items-center justify-center text-white shadow-md hover:bg-[#5C3D2E] transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Cart Sidebar - visible only on lg+ */}
        <div className="hidden lg:block w-80 xl:w-96 border-l border-[#EDD9C4] bg-white sticky top-[145px] self-start max-h-[calc(100vh-145px)] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-[#6F4E37]" />
              <h2 className="text-lg font-serif font-bold text-[#3C2415]">Your Cart</h2>
              {cartCount > 0 && (
                <span className="ml-auto text-xs bg-[#6F4E37] text-white px-2 py-0.5 rounded-full">{cartCount}</span>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-10">
                <Coffee className="w-10 h-10 text-[#EDD9C4] mx-auto mb-2" />
                <p className="text-sm text-[#8B6F5E]">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 py-2 border-b border-[#EDD9C4] last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#3C2415] truncate">{item.name}</p>
                        <p className="text-xs text-[#8B6F5E]">₹{item.price} x {item.qty}</p>
                      </div>
                      <p className="text-sm font-bold text-[#6F4E37] shrink-0">₹{(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#EDD9C4] pt-3 mb-4">
                  <div className="flex justify-between text-base font-bold text-[#3C2415]">
                    <span>Total</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={goToCart}
                  className="w-full bg-[#6F4E37] text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-[#5C3D2E] transition shadow-lg flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Checkout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Cart Footer - hidden on lg+ */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
          <div className="px-4 pb-4">
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
              <span className="font-bold">₹{cartTotal.toFixed(2)}</span>
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
