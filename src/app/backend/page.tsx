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
  QrCode,
  TrendingUp,
  CalendarDays,
  Layers,
  Receipt,
  Sparkles,
} from "lucide-react";

const quickLinks = [
  {
    label: "Orders",
    href: "/backend/orders",
    icon: ShoppingCart,
    color: "bg-blue-50 text-blue-600",
    hoverBorder: "hover:border-blue-200",
    description: "View & manage orders",
  },
  {
    label: "Products",
    href: "/backend/products",
    icon: Package,
    color: "bg-green-50 text-green-600",
    hoverBorder: "hover:border-green-200",
    description: "Catalog & pricing",
  },
  {
    label: "Reporting",
    href: "/backend/reporting",
    icon: BarChart3,
    color: "bg-purple-50 text-purple-600",
    hoverBorder: "hover:border-purple-200",
    description: "Analytics & insights",
  },
  {
    label: "Kitchen Display",
    href: "/backend/kitchen",
    icon: ChefHat,
    color: "bg-orange-50 text-orange-600",
    hoverBorder: "hover:border-orange-200",
    description: "Live kitchen orders",
  },
  {
    label: "Customer Display",
    href: "/backend/customer-display",
    icon: Monitor,
    color: "bg-teal-50 text-teal-600",
    hoverBorder: "hover:border-teal-200",
    description: "Customer-facing screen",
  },
  {
    label: "Settings",
    href: "/backend/settings",
    icon: Settings,
    color: "bg-gray-100 text-gray-600",
    hoverBorder: "hover:border-gray-300",
    description: "System configuration",
  },
  {
    label: "Self Ordering",
    href: "/backend/settings",
    icon: QrCode,
    color: "bg-indigo-50 text-indigo-600",
    hoverBorder: "hover:border-indigo-200",
    description: "QR code ordering",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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

  // Calculate average order value
  const avgOrderValue =
    todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

  const stats = [
    {
      label: "Today's Orders",
      value: todayOrders.length,
      prefix: "",
      icon: Receipt,
      gradient: "from-blue-500/10 to-blue-600/5",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      borderAccent: "border-l-blue-500",
    },
    {
      label: "Today's Revenue",
      value: todayRevenue.toLocaleString(),
      prefix: "$",
      icon: DollarSign,
      gradient: "from-emerald-500/10 to-emerald-600/5",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      borderAccent: "border-l-emerald-500",
    },
    {
      label: "Avg. Order Value",
      value: avgOrderValue.toFixed(2),
      prefix: "$",
      icon: TrendingUp,
      gradient: "from-amber-500/10 to-amber-600/5",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      borderAccent: "border-l-amber-500",
    },
    {
      label: "Total Sessions",
      value: sessions.length,
      prefix: "",
      icon: Layers,
      gradient: "from-violet-500/10 to-violet-600/5",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      borderAccent: "border-l-violet-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* ── Welcome Section ─────────────────────────────────── */}
      <div
        className="animate-fade-in-up relative overflow-hidden rounded-2xl border border-cream-medium bg-gradient-to-br from-cream via-cream to-cream-dark p-8 shadow-sm"
      >
        {/* Decorative background circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-coffee/[0.04]" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-coffee/[0.06]" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Greeting */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-coffee-light font-sans text-sm">
              <CalendarDays className="h-4 w-4" />
              {formatDate()}
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-espresso lg:text-4xl">
              {getGreeting()},{" "}
              <span className="text-coffee">{currentUser.name}</span>
            </h1>
            <p className="max-w-md font-sans text-sm leading-relaxed text-coffee-light">
              Your café dashboard is ready. Start a new session to begin taking
              orders, or explore your reports and settings below.
            </p>
          </div>

          {/* Right: Open POS CTA */}
          <div className="flex-shrink-0">
            {activeSession ? (
              <button
                onClick={() => router.push("/pos")}
                className="group relative inline-flex items-center gap-3 rounded-xl bg-success px-8 py-4 font-sans text-sm font-semibold text-white shadow-lg shadow-success/25 transition-all duration-300 hover:shadow-xl hover:shadow-success/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                  <Play className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="text-base font-bold">Continue Session</div>
                  <div className="text-xs text-white/80">Session is active</div>
                </div>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            ) : (
              <button
                onClick={handleOpenSession}
                className="group relative inline-flex items-center gap-3 rounded-xl bg-coffee px-8 py-4 font-sans text-sm font-semibold text-cream shadow-lg shadow-coffee/25 transition-all duration-300 hover:bg-coffee-dark hover:shadow-xl hover:shadow-coffee-dark/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                  <Coffee className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="text-base font-bold">Open POS</div>
                  <div className="text-xs text-cream/70">
                    Start a new session
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>

        {/* Session Info Bar */}
        <div className="relative mt-6 flex flex-wrap items-center gap-6 border-t border-cream-medium pt-5 font-sans text-sm">
          <div className="flex items-center gap-2 text-coffee-light">
            <Clock className="h-4 w-4" />
            <span>
              Last opened: <strong className="text-espresso">{lastOpen}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-coffee-light">
            <DollarSign className="h-4 w-4" />
            <span>
              Last closing:{" "}
              <strong className="text-espresso">
                ${lastSell.toLocaleString()}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-coffee-light">
            <ShoppingCart className="h-4 w-4" />
            <span>
              Lifetime orders:{" "}
              <strong className="text-espresso">{orders.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`animate-fade-in-up group relative overflow-hidden rounded-xl border border-cream-medium border-l-4 ${stat.borderAccent} bg-cream p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
            style={{ animationDelay: `${(i + 1) * 100}ms` }}
          >
            {/* Subtle gradient overlay */}
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-60`}
            />

            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="font-sans text-xs font-medium uppercase tracking-wider text-coffee-light">
                  {stat.label}
                </p>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor} transition-transform duration-300 group-hover:scale-110`}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-serif text-3xl font-bold tracking-tight text-espresso">
                {stat.prefix}
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Access Grid ────────────────────────────────── */}
      <div className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-coffee-light" />
          <h3 className="font-serif text-lg font-semibold text-espresso">
            Quick Access
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {quickLinks.map((link, i) => (
            <button
              key={link.label}
              onClick={() => router.push(link.href)}
              className={`group relative flex flex-col items-start rounded-xl border border-cream-medium bg-cream p-5 text-left shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${link.hoverBorder}`}
            >
              <div
                className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${link.color} transition-transform duration-300 group-hover:scale-110`}
              >
                <link.icon className="h-5 w-5" />
              </div>
              <p className="font-sans text-sm font-semibold text-espresso">
                {link.label}
              </p>
              <p className="mt-0.5 font-sans text-xs text-coffee-light">
                {link.description}
              </p>
              <ArrowRight className="absolute right-4 top-5 h-4 w-4 text-coffee-light/0 transition-all duration-300 group-hover:text-coffee-light group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
