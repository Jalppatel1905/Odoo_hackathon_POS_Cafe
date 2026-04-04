"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { Search, Coffee, ChefHat } from "lucide-react";

type StageFilter = "all" | "to_cook" | "preparing" | "completed";

export default function KitchenDisplay() {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<StageFilter>("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [preparedItems, setPreparedItems] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const perPage = 6;

  const { orders, updateOrder, categories, products, loaded, loadData } = useStore();

  useEffect(() => setMounted(true), []);

  // Load data from DB
  useEffect(() => {
    if (mounted && !loaded) loadData();
  }, [mounted, loaded, loadData]);

  // Auto-refresh every 5 seconds to get new orders
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [mounted, loadData]);

  const kitchenOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStage = stage === "all" || o.kitchenStatus === stage;
      const matchSearch =
        !search.trim() ||
        o.orderNo.includes(search) ||
        o.lines.some((l) => l.productName.toLowerCase().includes(search.toLowerCase()));

      let matchCategory = true;
      if (categoryFilter) {
        matchCategory = o.lines.some((l) => {
          const prod = products.find((p) => p.id === l.productId);
          return prod?.category === categoryFilter;
        });
      }

      return matchStage && matchSearch && matchCategory;
    });
  }, [orders, stage, search, categoryFilter, products]);

  const paginatedOrders = kitchenOrders.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(kitchenOrders.length / perPage);

  const countByStage = (s: string) =>
    orders.filter((o) => o.kitchenStatus === s).length;

  const advanceStage = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const next =
      order.kitchenStatus === "to_cook"
        ? "preparing"
        : order.kitchenStatus === "preparing"
        ? "completed"
        : "completed";
    updateOrder(orderId, { kitchenStatus: next as "to_cook" | "preparing" | "completed" });
  };

  const togglePrepared = (lineId: string) => {
    setPreparedItems((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  };

  const stageColor = (s: string) => {
    switch (s) {
      case "to_cook":
        return "bg-red-100 text-red-700 border-red-200";
      case "preparing":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const stageLabel = (s: string) => {
    switch (s) {
      case "to_cook": return "To Cook";
      case "preparing": return "Preparing";
      case "completed": return "Completed";
      default: return s;
    }
  };

  // Get unique categories from kitchen orders
  const usedCategories = useMemo(() => {
    const catIds = new Set<string>();
    orders.forEach((o) => {
      o.lines.forEach((l) => {
        const prod = products.find((p) => p.id === l.productId);
        if (prod) catIds.add(prod.category);
      });
    });
    return categories.filter((c) => catIds.has(c.id));
  }, [orders, products, categories]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-cream-dark flex">
      {/* Sidebar Filters */}
      <aside className="w-56 bg-espresso text-cream p-4 hidden lg:block">
        <div className="flex items-center gap-2 mb-6">
          <ChefHat className="w-6 h-6 text-latte" />
          <span className="font-bold text-lg">Kitchen</span>
        </div>

        <div className="space-y-1 mb-6">
          <p className="text-xs text-cream/50 uppercase tracking-wider mb-2">Filters</p>
          {categoryFilter && (
            <button
              onClick={() => setCategoryFilter(null)}
              className="text-xs text-latte hover:text-cream mb-2 flex items-center gap-1"
            >
              Clear Filter &times;
            </button>
          )}
          <p className="text-xs text-cream/50 uppercase tracking-wider mt-4 mb-2">Product</p>
          <button
            onClick={() => setCategoryFilter(null)}
            className={`block w-full text-left px-3 py-2 rounded text-sm ${
              !categoryFilter ? "bg-coffee text-cream" : "text-cream/70 hover:bg-coffee-dark"
            }`}
          >
            All Products
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-cream/50 uppercase tracking-wider mb-2">Category</p>
          {usedCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`block w-full text-left px-3 py-2 rounded text-sm ${
                categoryFilter === cat.id
                  ? "bg-coffee text-cream"
                  : "text-cream/70 hover:bg-coffee-dark"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-cream border-b border-cream-medium px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(
              [
                { key: "all", label: "All", count: orders.length },
                { key: "to_cook", label: "To Cook", count: countByStage("to_cook") },
                { key: "preparing", label: "Preparing", count: countByStage("preparing") },
                { key: "completed", label: "Completed", count: countByStage("completed") },
              ] as { key: StageFilter; label: string; count: number }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setStage(tab.key); setPage(0); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  stage === tab.key
                    ? "bg-coffee text-cream"
                    : "text-coffee-light hover:bg-cream-dark"
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  stage === tab.key ? "bg-cream/20" : "bg-cream-dark"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {totalPages > 1 && (
              <div className="flex items-center gap-1 text-sm text-coffee-light">
                <span>{page * perPage + 1}-{Math.min((page + 1) * perPage, kitchenOrders.length)}</span>
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-2 py-1 hover:bg-cream-dark rounded disabled:opacity-30"
                >
                  &lt;
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-2 py-1 hover:bg-cream-dark rounded disabled:opacity-30"
                >
                  &gt;
                </button>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-light" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-3 py-2 border border-cream-medium rounded-lg text-sm bg-cream w-48 focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Ticket Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {paginatedOrders.length === 0 ? (
            <div className="text-center py-20 text-coffee-light">
              <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No orders in kitchen</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => advanceStage(order.id)}
                  className={`bg-cream rounded-xl border-2 p-4 cursor-pointer hover:shadow-lg transition ${stageColor(order.kitchenStatus)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-espresso">#{order.orderNo}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageColor(order.kitchenStatus)}`}>
                      {stageLabel(order.kitchenStatus)}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {order.lines.map((line) => (
                      <div
                        key={line.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePrepared(line.id);
                        }}
                        className={`flex items-center gap-2 text-sm cursor-pointer rounded px-2 py-1 hover:bg-cream-dark transition ${
                          preparedItems.has(line.id) ? "line-through opacity-50" : ""
                        }`}
                      >
                        <span className="text-coffee font-medium w-8">{line.quantity} x</span>
                        <span className="text-espresso">{line.productName}</span>
                      </div>
                    ))}
                  </div>

                  {order.tableNumber > 0 && (
                    <p className="text-xs text-coffee-light mt-3">
                      Table {order.tableNumber}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
