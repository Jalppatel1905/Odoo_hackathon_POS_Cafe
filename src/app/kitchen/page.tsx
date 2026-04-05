"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import {
  Search,
  ChefHat,
  Lock,
  Clock,
  Flame,
  CheckCircle,
  UtensilsCrossed,
  Timer,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

type StageFilter = "all" | "to_cook" | "preparing" | "completed";

export default function KitchenDisplay() {
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [stage, setStage] = useState<StageFilter>("all");
  const [search, setSearch] = useState("");
  const [preparedItems, setPreparedItems] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(new Date());

  const { orders, updateOrder, categories, products, loaded, loadData } = useStore();

  useEffect(() => setMounted(true), []);

  // Check if password is required
  useEffect(() => {
    if (!mounted) return;
    const saved = sessionStorage.getItem("kitchen-auth");
    if (saved === "true") {
      setAuthenticated(true);
      setCheckingAuth(false);
      return;
    }
    fetch("/api/kitchen-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setAuthenticated(true);
          sessionStorage.setItem("kitchen-auth", "true");
        }
        setCheckingAuth(false);
      })
      .catch(() => setCheckingAuth(false));
  }, [mounted]);

  // Load data from DB
  useEffect(() => {
    if (mounted && authenticated && !loaded) loadData();
  }, [mounted, authenticated, loaded, loadData]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!mounted || !authenticated) return;
    const interval = setInterval(() => loadData(), 5000);
    return () => clearInterval(interval);
  }, [mounted, authenticated, loadData]);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    setAuthError("");
    const res = await fetch("/api/kitchen-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) {
      setAuthenticated(true);
      sessionStorage.setItem("kitchen-auth", "true");
    } else {
      setAuthError("Wrong password");
    }
  };

  const kitchenOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStage = stage === "all" || o.kitchenStatus === stage;
      const matchSearch =
        !search.trim() ||
        o.orderNo.includes(search) ||
        o.lines.some((l) => l.productName.toLowerCase().includes(search.toLowerCase()));
      return matchStage && matchSearch;
    });
  }, [orders, stage, search]);

  const countByStage = (s: string) => orders.filter((o) => o.kitchenStatus === s).length;

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

  const getTimeSince = (dateStr: string) => {
    const diff = Math.floor((now.getTime() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
  };

  const stageConfig = {
    to_cook: {
      bg: "bg-red-50",
      border: "border-red-200",
      badge: "bg-red-100 text-red-700",
      accent: "text-red-600",
      icon: Flame,
      label: "To Cook",
      nextLabel: "Start Cooking",
    },
    preparing: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      badge: "bg-amber-100 text-amber-700",
      accent: "text-amber-600",
      icon: Timer,
      label: "Preparing",
      nextLabel: "Mark Ready",
    },
    completed: {
      bg: "bg-green-50",
      border: "border-green-200",
      badge: "bg-green-100 text-green-700",
      accent: "text-green-600",
      icon: CheckCircle,
      label: "Ready",
      nextLabel: "Done",
    },
  };

  const stageTabs = [
    { key: "all" as StageFilter, label: "All Orders", icon: UtensilsCrossed, count: orders.length, color: "text-espresso" },
    { key: "to_cook" as StageFilter, label: "To Cook", icon: Flame, count: countByStage("to_cook"), color: "text-red-600" },
    { key: "preparing" as StageFilter, label: "Cooking", icon: Timer, count: countByStage("preparing"), color: "text-amber-600" },
    { key: "completed" as StageFilter, label: "Ready", icon: CheckCircle, count: countByStage("completed"), color: "text-green-600" },
  ];

  if (!mounted || checkingAuth) return null;

  // Password Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-cream-dark flex items-center justify-center p-4">
        <div className="bg-cream rounded-2xl border border-cream-medium shadow-xl p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-coffee/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-coffee" />
          </div>
          <h1 className="text-xl font-bold text-espresso mb-1">Kitchen Display</h1>
          <p className="text-sm text-coffee-light mb-6">Enter password to access</p>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setAuthError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter password"
            className="w-full px-4 py-3 border border-cream-medium rounded-xl text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none mb-3"
            autoFocus
          />
          {authError && <p className="text-xs text-danger mb-3">{authError}</p>}
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-coffee text-white rounded-xl font-semibold text-sm hover:bg-coffee-dark transition"
          >
            Access Kitchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EBE3] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-cream-medium">
        <div className="px-4 lg:px-6 py-3">
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="SipSync" className="w-9 h-9 rounded-lg object-contain" />
              <div>
                <h1 className="text-lg font-bold text-espresso flex items-center gap-2">
                  Kitchen Display
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </h1>
                <p className="text-xs text-coffee-light">
                  {now.toLocaleTimeString()} &middot; {orders.filter((o) => o.kitchenStatus !== "completed").length} active orders
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-light" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders..."
                  className="pl-9 pr-3 py-2 border border-cream-medium rounded-lg text-sm bg-cream w-52 focus:ring-2 focus:ring-coffee/30 outline-none"
                />
              </div>
              <button
                onClick={() => loadData()}
                className="w-9 h-9 rounded-lg bg-cream border border-cream-medium flex items-center justify-center hover:bg-cream-dark transition"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-coffee" />
              </button>
            </div>
          </div>

          {/* Stage Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {stageTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStage(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                  stage === tab.key
                    ? "bg-coffee text-white shadow-sm"
                    : "bg-cream text-coffee-light hover:bg-cream-dark border border-cream-medium"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${stage === tab.key ? "text-white" : tab.color}`} />
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  stage === tab.key ? "bg-white/20 text-white" : "bg-cream-dark text-coffee"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Order Tickets */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {kitchenOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-coffee-light py-20">
            <ChefHat className="w-16 h-16 opacity-20 mb-4" />
            <p className="text-lg font-medium">No orders</p>
            <p className="text-sm opacity-60">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kitchenOrders.map((order) => {
              const config = stageConfig[order.kitchenStatus as keyof typeof stageConfig];
              const StageIcon = config.icon;
              const allPrepared = order.lines.every((l) => preparedItems.has(l.id));

              return (
                <div
                  key={order.id}
                  className={`${config.bg} rounded-2xl border-2 ${config.border} overflow-hidden shadow-sm hover:shadow-md transition-all`}
                >
                  {/* Ticket Header */}
                  <div className="px-4 py-3 flex items-center justify-between border-b border-black/5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-espresso">#{order.orderNo}</span>
                      {order.tableNumber > 0 && (
                        <span className="text-xs bg-white/80 px-2 py-0.5 rounded-full text-coffee-light font-medium">
                          T{order.tableNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-coffee-light flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeSince(order.date)}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${config.badge}`}>
                        <StageIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-4 py-3 space-y-1">
                    {order.lines.map((line) => {
                      const isPrepared = preparedItems.has(line.id);
                      return (
                        <button
                          key={line.id}
                          onClick={() => togglePrepared(line.id)}
                          className={`w-full flex items-center gap-3 text-left py-1.5 px-2 rounded-lg transition text-sm ${
                            isPrepared
                              ? "bg-green-100/50 line-through opacity-50"
                              : "hover:bg-white/50"
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                            isPrepared
                              ? "bg-green-500 border-green-500"
                              : "border-gray-300 bg-white"
                          }`}>
                            {isPrepared && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span className="font-bold text-coffee w-7 text-center">{line.quantity}x</span>
                          <span className="text-espresso font-medium flex-1">{line.productName}</span>
                          {line.notes && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full italic">
                              {line.notes}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Button */}
                  {order.kitchenStatus !== "completed" && (
                    <div className="px-4 pb-3">
                      <button
                        onClick={() => advanceStage(order.id)}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
                          order.kitchenStatus === "to_cook"
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        {config.nextLabel}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {order.kitchenStatus === "completed" && (
                    <div className="px-4 pb-3 text-center">
                      <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Ready for pickup
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
