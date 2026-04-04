"use client";

import Link from "next/link";
import {
  Coffee,
  UtensilsCrossed,
  Monitor,
  CreditCard,
  BarChart3,
  QrCode,
  ChefHat,
  Users,
  ArrowRight,
  Star,
} from "lucide-react";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Table Ordering",
    desc: "Floor-based table management with drag & drop layout and real-time status tracking.",
  },
  {
    icon: ChefHat,
    title: "Kitchen Display",
    desc: "Real-time order push to kitchen with stage tracking: To Cook, Preparing, Completed.",
  },
  {
    icon: CreditCard,
    title: "Multi-Payment",
    desc: "Accept Cash, Card/Bank, and UPI QR payments seamlessly in one checkout flow.",
  },
  {
    icon: Monitor,
    title: "Customer Display",
    desc: "Transparent customer-facing screen showing live order and payment status.",
  },
  {
    icon: BarChart3,
    title: "Live Dashboard",
    desc: "Real-time sales analytics, top products, category insights, and exportable reports.",
  },
  {
    icon: QrCode,
    title: "Self Ordering",
    desc: "QR-based mobile ordering linked to tables with automatic kitchen integration.",
  },
];

const menuItems = [
  { name: "Espresso", price: 50, category: "Coffee" },
  { name: "Cappuccino", price: 80, category: "Coffee" },
  { name: "Burger", price: 150, category: "Quick Bites" },
  { name: "Pizza", price: 250, category: "Food" },
  { name: "Pasta", price: 200, category: "Food" },
  { name: "Green Tea", price: 65, category: "Drinks" },
  { name: "Milkshake", price: 140, category: "Drinks" },
  { name: "Fries", price: 120, category: "Quick Bites" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-7 h-7 text-[#714B67]" />
            <span className="text-xl font-bold text-gray-900">
              Sip<span className="text-[#714B67]">Sync</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-[#714B67] transition">Features</a>
            <a href="#menu" className="hover:text-[#714B67] transition">Menu Preview</a>
            <a href="#how-it-works" className="hover:text-[#714B67] transition">How it Works</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="text-sm text-gray-600 hover:text-[#714B67] font-medium transition"
            >
              Login
            </Link>
            <Link
              href="/auth?mode=signup"
              className="text-sm bg-[#714B67] text-white px-4 py-2 rounded-lg hover:bg-[#5a3c53] transition font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#714B67]/10 text-[#714B67] px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Restaurant POS System
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Manage Your Cafe
              <br />
              <span className="text-[#714B67]">Effortlessly</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              SipSync is a complete restaurant POS solution - from table ordering
              to kitchen display, multi-payment checkout to real-time analytics.
              Everything in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/auth?mode=signup"
                className="flex items-center justify-center gap-2 bg-[#714B67] text-white px-6 py-3 rounded-lg hover:bg-[#5a3c53] transition font-semibold text-sm"
              >
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-[#714B67] hover:text-[#714B67] transition font-semibold text-sm"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Hero Visual - POS Preview */}
          <div className="flex-1 w-full max-w-lg">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-400">SipSync POS Terminal</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["Table 1", "Table 2", "Table 3", "Table 4", "Table 5", "Table 6"].map((t) => (
                  <div
                    key={t}
                    className={`text-center py-3 rounded-lg text-xs font-medium ${
                      t === "Table 2"
                        ? "bg-[#714B67] text-white"
                        : "bg-white border border-gray-200 text-gray-600"
                    }`}
                  >
                    {t}
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="text-xs text-gray-400 mb-2">Current Order - Table 2</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-700">
                    <span>2x Cappuccino</span><span>$160</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>1x Burger</span><span>$150</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>1x Fries</span><span>$120</span>
                  </div>
                  <div className="border-t pt-1.5 mt-1.5 flex justify-between font-bold text-gray-900">
                    <span>Total</span><span>$430</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Everything You Need to Run Your Restaurant
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              From order creation to kitchen management, payments to analytics -
              SipSync handles the complete restaurant workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[#714B67]/30 hover:shadow-lg transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#714B67]/10 flex items-center justify-center mb-4 group-hover:bg-[#714B67] transition-colors">
                  <f.icon className="w-5 h-5 text-[#714B67] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section id="menu" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Menu Preview</h2>
            <p className="text-gray-500">Sample items you can manage in SipSync POS</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className="bg-gray-50 rounded-xl p-4 text-center hover:bg-[#714B67]/5 transition border border-transparent hover:border-[#714B67]/20"
              >
                <div className="w-12 h-12 rounded-full bg-[#714B67]/10 flex items-center justify-center mx-auto mb-3">
                  <Coffee className="w-5 h-5 text-[#714B67]" />
                </div>
                <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                <p className="text-[#714B67] font-bold mt-1">${item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500">Complete end-to-end POS flow in 5 simple steps</p>
          </div>
          <div className="space-y-6">
            {[
              { step: "1", title: "Setup Backend", desc: "Configure products, categories, payment methods, and floor/table layout." },
              { step: "2", title: "Open POS Session", desc: "Start a new session and select a table from the floor view." },
              { step: "3", title: "Take Orders", desc: "Add products to cart, set quantities, add notes, and send to kitchen." },
              { step: "4", title: "Process Payment", desc: "Choose Cash, Card, or UPI QR - validate and confirm payment." },
              { step: "5", title: "Track & Report", desc: "View real-time dashboard with sales analytics, top products, and export reports." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-[#714B67] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {s.step}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{s.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Sync Your Restaurant?
          </h2>
          <p className="text-gray-500 mb-8">
            Get started with SipSync POS and streamline your restaurant operations today.
          </p>
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center gap-2 bg-[#714B67] text-white px-8 py-3.5 rounded-lg hover:bg-[#5a3c53] transition font-semibold"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-[#714B67]" />
            <span className="font-bold text-gray-900">
              Sip<span className="text-[#714B67]">Sync</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>Built for Hackathon 2025</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
