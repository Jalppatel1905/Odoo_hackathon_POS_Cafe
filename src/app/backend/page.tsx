"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import {
  Coffee,
  Play,
  Clock,
  DollarSign,
  ShoppingCart,
  Package,
  BarChart3,
  ChefHat,
  Monitor,
  Settings,
  ArrowRight,
} from "lucide-react";

const quickLinks = [
  { label: "Orders", href: "/backend/orders", icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
  { label: "Products", href: "/backend/products", icon: Package, color: "bg-green-50 text-green-600" },
  { label: "Reporting", href: "/backend/reporting", icon: BarChart3, color: "bg-purple-50 text-purple-600" },
  { label: "Kitchen Display", href: "/backend/kitchen", icon: ChefHat, color: "bg-orange-50 text-orange-600" },
  { label: "Customer Display", href: "/backend/customer-display", icon: Monitor, color: "bg-teal-50 text-teal-600" },
  { label: "Settings", href: "/backend/settings", icon: Settings, color: "bg-gray-100 text-gray-600" },
];

export default function BackendHome() {
  const router = useRouter();
  const { currentUser, activeSession, openSession, sessions, orders } =
    useStore();

  if (!currentUser) return null;

  const lastSession = sessions[sessions.length - 1];
  const lastSell = lastSession?.closingAmount || 0;
  const lastOpen = lastSession
    ? new Date(lastSession.openedAt).toLocaleDateString()
    : "N/A";

  const handleOpenSession = () => {
    openSession();
    router.push("/pos");
  };

  const todayOrders = orders.filter(
    (o) => new Date(o.date).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.finalTotal, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-espresso">
          Welcome back, {currentUser.name}!
        </h1>
        <p className="text-coffee-light text-sm mt-1">
          Manage your POS system and start taking orders
        </p>
      </div>

      {/* POS Terminal Card */}
      <div className="bg-cream border border-cream-medium rounded-xl shadow-sm overflow-hidden">
        <div className="bg-coffee p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cream/20 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-cream" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-cream">SipSync</h2>
              <p className="text-cream/70 text-xs">Point of Sale Terminal</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs text-coffee-light mb-1 font-medium uppercase tracking-wider">
            POS Terminal created from POS Setting
          </p>
          <p className="text-xs text-coffee-light mb-4">
            Contains Last Open session and Last closing sell amount
          </p>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-cream-dark rounded-lg p-3">
              <div className="flex items-center gap-2 text-coffee-light text-xs mb-1">
                <Clock className="w-3.5 h-3.5" />
                Last Open
              </div>
              <p className="text-espresso font-semibold">{lastOpen}</p>
            </div>
            <div className="bg-cream-dark rounded-lg p-3">
              <div className="flex items-center gap-2 text-coffee-light text-xs mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                Last Sell
              </div>
              <p className="text-espresso font-semibold">${lastSell.toLocaleString()}</p>
            </div>
          </div>

          {activeSession ? (
            <button
              onClick={() => router.push("/pos")}
              className="w-full bg-success text-cream py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Continue Session
            </button>
          ) : (
            <button
              onClick={handleOpenSession}
              className="w-full bg-coffee text-cream py-3 rounded-lg font-semibold text-sm hover:bg-coffee-dark transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Open Session
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cream border border-cream-medium rounded-xl p-4">
          <p className="text-xs text-coffee-light mb-1">Today&apos;s Orders</p>
          <p className="text-2xl font-bold text-espresso">{todayOrders.length}</p>
        </div>
        <div className="bg-cream border border-cream-medium rounded-xl p-4">
          <p className="text-xs text-coffee-light mb-1">Today&apos;s Revenue</p>
          <p className="text-2xl font-bold text-espresso">${todayRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-cream border border-cream-medium rounded-xl p-4">
          <p className="text-xs text-coffee-light mb-1">Total Sessions</p>
          <p className="text-2xl font-bold text-espresso">{sessions.length}</p>
        </div>
        <div className="bg-cream border border-cream-medium rounded-xl p-4">
          <p className="text-xs text-coffee-light mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-espresso">{orders.length}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-sm font-semibold text-espresso mb-3">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => router.push(link.href)}
              className="bg-cream border border-cream-medium rounded-xl p-4 text-center hover:border-latte hover:shadow-sm transition group"
            >
              <div
                className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center mx-auto mb-2`}
              >
                <link.icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-espresso">{link.label}</p>
              <ArrowRight className="w-3 h-3 text-coffee-light mx-auto mt-1 opacity-0 group-hover:opacity-100 transition" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
