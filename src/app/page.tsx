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
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Table & Floor Plan",
    desc: "Manage your tables easily and see which ones are free or occupied in real time.",
    delay: "delay-100",
  },
  {
    icon: ChefHat,
    title: "Kitchen Display",
    desc: "Send orders directly to the kitchen screen. Track what's cooking and what's ready.",
    delay: "delay-200",
  },
  {
    icon: CreditCard,
    title: "Easy Checkout",
    desc: "Accept Cash, Cards, and UPI payments. Split bills with just a few taps.",
    delay: "delay-300",
  },
  {
    icon: Monitor,
    title: "Customer Screen",
    desc: "Show customers their order details and payment status on a separate display.",
    delay: "delay-400",
  },
  {
    icon: BarChart3,
    title: "Reports & Dashboard",
    desc: "See your daily sales, top-selling items, and business insights at a glance.",
    delay: "delay-500",
  },
  {
    icon: QrCode,
    title: "QR Code Ordering",
    desc: "Let customers scan a QR code and order from their phone. No waiting needed.",
    delay: "delay-700",
  },
];

const menuItems = [
  { name: "Espresso", price: 50, category: "Coffee", delay: "delay-100" },
  { name: "Cappuccino", price: 80, category: "Coffee", delay: "delay-200" },
  { name: "Cheese Burger", price: 150, category: "Quick Bites", delay: "delay-300" },
  { name: "Margherita Pizza", price: 250, category: "Food", delay: "delay-400" },
  { name: "Penne Pasta", price: 200, category: "Food", delay: "delay-500" },
  { name: "Green Tea", price: 65, category: "Drinks", delay: "delay-700" },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] selection:bg-[var(--primary)] selection:text-white font-sans overflow-hidden text-[var(--foreground)]">
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-700 ${
          scrolled
            ? "bg-[#FCF9F5]/95 backdrop-blur-xl border-b border-[#E8D0B3]/60 shadow-[0_4px_30px_rgba(139,94,60,0.05)] py-3"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-default">
            <img src="/logo.png" alt="SipSync" className="w-9 h-9 rounded-2xl object-contain group-hover:scale-105 transition-transform duration-500" />
            <span className="text-2xl font-serif font-bold tracking-tight text-[#4A3628]">
              Sip<span className="text-[#D2A679] font-sans font-medium">Sync</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            {["features", "menu", "workflow"].map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className="relative text-sm font-medium capitalize transition-colors duration-300 text-[#633F24]/80 hover:text-[#8B5E3C] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[#8B5E3C] after:scale-x-0 after:origin-right hover:after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/auth"
              className="text-sm font-medium transition-colors text-[#633F24] hover:text-[#8B5E3C]"
            >
              Sign In
            </Link>
            <Link
              href="/auth?mode=signup"
              className="relative overflow-hidden text-sm px-7 py-3 rounded-full transition-all duration-500 font-medium bg-[#8B5E3C] text-white hover:bg-[#633F24] shadow-md hover:shadow-xl hover:shadow-[#8B5E3C]/20 hover:-translate-y-0.5 group"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-full"></span>
              <span className="relative z-10">Get Started</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 bg-[#FCF9F5]">
        {/* Abstract Background Elements for Light theme */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-[#D2A679] rounded-full mix-blend-multiply filter blur-[150px] opacity-20 animate-pulse-slow"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-[#E8D0B3] rounded-full mix-blend-multiply filter blur-[150px] opacity-30"></div>
          <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-[#8B5E3C] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.08] animate-float"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8B5E3C]/5 border border-[#8B5E3C]/10 backdrop-blur-md mb-8">
              <Sparkles className="w-4 h-4 text-[#8B5E3C]" />
              <span className="text-xs uppercase tracking-widest text-[#8B5E3C] font-semibold">Restaurant POS System</span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-serif font-bold text-[#4A3628] leading-[1.1] mb-8">
              Manage Your Cafe <span className="block mt-2 italic text-[#8B5E3C]">Effortlessly.</span>
            </h1>
            <p className="text-lg text-[#633F24]/80 mb-10 max-w-lg leading-relaxed font-light">
              Run your restaurant smoothly with SipSync. Take orders, manage tables, accept payments, and track sales — all from one simple system.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                href="/auth?mode=signup"
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#8B5E3C] to-[#633F24] text-white px-8 py-4 rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_8px_20px_rgba(139,94,60,0.3)] font-medium text-sm"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="flex items-center justify-center gap-2 bg-transparent border border-[#C09A7D] text-[#633F24] px-8 py-4 rounded-full hover:bg-[#F1E5D1]/50 transition-all duration-300 font-medium text-sm"
              >
                See Features
              </a>
            </div>
          </div>

          <div className="relative w-full aspect-square max-w-[600px] mx-auto animate-fade-in-up delay-200">
            <div className="absolute inset-0 bg-white/70 rounded-[2.5rem] border border-[#E8D0B3]/50 backdrop-blur-2xl shadow-xl p-6 flex flex-col transform rotate-2 hover:rotate-0 transition-transform duration-700 hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                <span className="ml-2 text-xs font-serif font-medium tracking-wide text-[#8B5E3C]/60">SipSync POS Terminal</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {["Table 01", "Table 02", "Table 03", "Table 04", "Table 05", "Table 06"].map((t, i) => (
                  <div
                    key={t}
                    className={`text-center py-4 rounded-2xl text-xs font-semibold tracking-wide transition-all ${
                      i === 1
                        ? "bg-gradient-to-br from-[#8B5E3C] to-[#633F24] text-white shadow-md shadow-[#8B5E3C]/20"
                        : "bg-white text-[#633F24] border border-[#E8D0B3]/30 hover:bg-[#F1E5D1]/50"
                    }`}
                  >
                    {t}
                  </div>
                ))}
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-[#E8D0B3]/30 p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex justify-between items-end border-b border-[#F1E5D1] pb-3 mb-4">
                     <span className="text-xs uppercase tracking-widest text-[#8B5E3C] font-bold">Current Order</span>
                     <span className="text-[10px] text-[#A68A71] bg-[#F1E5D1]/50 px-2 py-1 rounded-full border border-[#D2A679]/30">Table 02</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { item: "2x Cappuccino", price: "₹160.00" },
                      { item: "1x Cheese Burger", price: "₹150.00" },
                      { item: "1x Fries", price: "₹120.00" }
                    ].map((row, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-[#4A3628] font-light">
                        <span>{row.item}</span><span className="font-medium">{row.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 mt-auto">
                  <div className="flex justify-between items-center bg-[#F1E5D1]/40 p-4 rounded-xl border border-[#D2A679]/20">
                    <span className="text-sm font-medium text-[#633F24]">Total Amount</span>
                    <span className="text-xl font-sans font-bold text-[#4A3628]">₹430.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 max-w-2xl mx-auto animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#4A3628] tracking-tight mb-6">
              Everything you need, <span className="italic text-[#8B5E3C]">in one place.</span>
            </h2>
            <p className="text-lg text-[#633F24]/80 font-light leading-relaxed">
              From taking orders to tracking sales — SipSync gives you all the tools to run your restaurant easily.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`bg-[#FCF9F5] p-10 rounded-[2rem] border border-[#E8D0B3]/40 shadow-sm hover:shadow-xl hover:shadow-[#D2A679]/10 hover:-translate-y-1 transition-all duration-500 group animate-fade-in-up ${f.delay}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 border border-[#E8D0B3]/50 group-hover:bg-[#8B5E3C]/5 transition-colors duration-500 shadow-sm">
                  <f.icon className="w-6 h-6 text-[#A68A71] group-hover:text-[#8B5E3C] transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#4A3628] mb-3">{f.title}</h3>
                <p className="text-[#633F24]/80 leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section id="menu" className="py-32 px-6 bg-[#FCF9F5] relative overflow-hidden text-[#4A3628]">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#E8D0B3] rounded-full mix-blend-multiply filter blur-[200px] opacity-30"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8 animate-fade-in-up">
            <div className="max-w-xl">
              <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#4A3628] tracking-tight mb-6">
                Our Menu.
              </h2>
              <p className="text-lg text-[#633F24]/80 font-light leading-relaxed">
                Add, organize, and manage your menu items easily. Here&apos;s a quick preview of what you can offer.
              </p>
            </div>
            <Link href="/auth?mode=signup" className="text-[#8B5E3C] hover:text-[#4A3628] flex items-center gap-2 font-medium transition-colors border-b border-[#8B5E3C]/30 hover:border-[#4A3628] pb-1">
              Manage Your Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {menuItems.map((item, i) => (
              <div
                key={item.name}
                className={`group cursor-default animate-fade-in-up ${item.delay}`}
              >
                <div className="flex justify-between items-baseline border-b border-[#D2A679]/30 pb-4 mb-3 group-hover:border-[#8B5E3C] transition-colors duration-500">
                  <h4 className="text-lg font-serif font-semibold text-[#4A3628]">{item.name}</h4>
                  <span className="text-[#8B5E3C] font-semibold">₹{item.price}</span>
                </div>
                <p className="text-sm text-[#A68A71] font-light tracking-widest uppercase">{item.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FCF9F5]/50 to-white"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-24 animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#F1E5D1] text-[#8B5E3C] text-xs font-bold tracking-widest uppercase mb-6 border border-[#D2A679]/40 shadow-sm">How It Works</div>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#4A3628] tracking-tight">Simple 4-Step Flow</h2>
            <p className="mt-6 text-[#633F24]/80 font-light max-w-2xl mx-auto text-lg leading-relaxed">From setting up your cafe to collecting payment — it&apos;s as easy as 1-2-3-4.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting Line for Grid */}
            <div className="hidden md:block absolute top-[3.5rem] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-transparent via-[#E8D0B3] to-transparent"></div>

            {[
              { step: "01", icon: Monitor, title: "Set Up Your Cafe", desc: "Add your menu items, set up tables, and configure payment methods." },
              { step: "02", icon: Users, title: "Select a Table", desc: "Pick a table from the floor view and start a new order." },
              { step: "03", icon: ChefHat, title: "Take Orders", desc: "Add items to cart, write notes, and send the order to the kitchen." },
              { step: "04", icon: CreditCard, title: "Collect Payment", desc: "Accept Cash, Card, or UPI and you're done!" },
            ].map((s, i) => (
              <div key={s.step} className={`relative flex flex-col items-center text-center group animate-fade-in-up delay-${(i+1)*100}`}>
                <div className="w-[7rem] h-[7rem] rounded-full bg-white border border-[#E8D0B3]/50 shadow-[0_8px_30px_rgba(210,166,121,0.15)] flex items-center justify-center font-serif font-bold text-[#8B5E3C] group-hover:-translate-y-2 group-hover:shadow-[0_15px_40px_rgba(139,94,60,0.2)] transition-all duration-500 z-10 relative mb-8">
                  <span className="absolute 0 top-0 right-0 w-8 h-8 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center text-[11px] font-sans font-bold border-[3px] border-white shadow-sm">{s.step}</span>
                  <s.icon className="w-10 h-10 text-[#C09A7D] group-hover:text-[#8B5E3C] transition-colors duration-500" />
                </div>
                <div className="bg-[#FCF9F5] p-8 rounded-3xl border border-[#E8D0B3]/40 shadow-sm group-hover:shadow-xl group-hover:shadow-[#D2A679]/10 transition-all duration-500 w-full hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5E3C]/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <h4 className="text-xl font-serif font-bold text-[#4A3628] mb-4">{s.title}</h4>
                  <p className="text-[#633F24]/80 font-light leading-relaxed text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-[#FCF9F5] relative overflow-hidden text-center border-t border-[#E8D0B3]/40">
        <div className="relative z-10 max-w-3xl mx-auto animate-fade-in-up">
          <h2 className="text-5xl lg:text-6xl font-serif font-bold text-[#4A3628] tracking-tight mb-8">
            Ready to get started?
          </h2>
          <p className="text-xl text-[#633F24]/80 font-light mb-12 max-w-xl mx-auto">
            Set up your restaurant POS in minutes. Simple to use, powerful enough for any cafe.
          </p>
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center gap-3 bg-[#4A3628] text-white px-10 py-5 rounded-full hover:scale-105 transition-all duration-300 font-semibold shadow-xl hover:shadow-[0_0_30px_rgba(74,54,40,0.3)]"
          >
            Start Free Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 px-6 border-t border-[#E8D0B3]/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 animate-fade-in-up">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <img src="/logo.png" alt="SipSync" className="w-10 h-10 rounded-2xl object-contain" />
              <span className="text-2xl font-serif font-bold text-[#4A3628] tracking-tight">
                Sip<span className="text-[#D2A679] font-sans font-medium">Sync</span>
              </span>
            </div>
            <p className="text-[#633F24]/70 font-light leading-relaxed max-w-sm mb-8">
              A simple and powerful POS system built for restaurants and cafes. Manage orders, payments, and kitchen — all in one place.
            </p>
          </div>
          
          <div>
            <h4 className="font-serif font-bold text-[#4A3628] text-lg mb-6 tracking-wide">Platform</h4>
            <ul className="space-y-4 text-sm text-[#A68A71] font-light">
              <li><a href="#features" className="hover:text-[#8B5E3C] transition-colors">Features</a></li>
              <li><a href="#menu" className="hover:text-[#8B5E3C] transition-colors">Menu Manager</a></li>
              <li><a href="#workflow" className="hover:text-[#8B5E3C] transition-colors">How It Works</a></li>
              <li><Link href="/auth?mode=signup" className="hover:text-[#8B5E3C] transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif font-bold text-[#4A3628] text-lg mb-6 tracking-wide">Legal</h4>
            <ul className="space-y-4 text-sm text-[#A68A71] font-light">
              <li><a href="#" className="hover:text-[#8B5E3C] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#8B5E3C] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#8B5E3C] transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-[#E8D0B3]/30 flex flex-col md:flex-row justify-between items-center text-xs text-[#A68A71] font-light animate-fade-in-up delay-200">
          <p>&copy; {new Date().getFullYear()} SipSync POS. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built for restaurants & cafes.</p>
        </div>
      </footer>
    </div>
  );
}
