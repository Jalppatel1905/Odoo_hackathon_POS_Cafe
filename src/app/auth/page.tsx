"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import toast, { Toaster } from "react-hot-toast";

function AuthForm() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(mode !== "signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { login, signup, currentUser } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && currentUser) {
      router.push("/backend");
    }
  }, [mounted, currentUser, router]);

  if (!mounted) return null;
  if (currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = await login(email, password);
      if (success) {
        toast.success("Login successful!");
        router.push("/backend");
      } else {
        toast.error("Invalid email or password");
      }
    } else {
      if (!name.trim()) {
        toast.error("Name is required");
        return;
      }
      const success = await signup(name, email, password);
      if (success) {
        toast.success("Account created successfully!");
        router.push("/backend");
      } else {
        toast.error("Email already exists");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#3C2415",
            color: "#FFF8F0",
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />

      {/* ========== Left Panel — Brand Showcase ========== */}
      <div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #3C2415 0%, #6F4E37 50%, #5C3D2E 100%)",
        }}
      >
        {/* Decorative floating circles */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04] animate-float"
          style={{
            background: "radial-gradient(circle, #D4A574 0%, transparent 70%)",
            top: "-80px",
            right: "-100px",
          }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full opacity-[0.06] animate-float"
          style={{
            background: "radial-gradient(circle, #FFF8F0 0%, transparent 70%)",
            bottom: "-60px",
            left: "-80px",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute w-[200px] h-[200px] rounded-full opacity-[0.05] animate-float"
          style={{
            background: "radial-gradient(circle, #D4A574 0%, transparent 70%)",
            top: "40%",
            left: "15%",
            animationDelay: "4s",
          }}
        />

        {/* Subtle grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Horizontal decorative line */}
        <div
          className="absolute left-0 right-0 h-px opacity-10"
          style={{
            top: "30%",
            background: "linear-gradient(90deg, transparent, #D4A574, transparent)",
          }}
        />
        <div
          className="absolute left-0 right-0 h-px opacity-10"
          style={{
            bottom: "25%",
            background: "linear-gradient(90deg, transparent, #D4A574, transparent)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 px-16 max-w-lg text-center animate-fade-in-up">
          {/* Logo */}
          <div className="flex items-center justify-center mb-10">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #D4A574 0%, #6F4E37 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              <img
                src="/logo.png"
                alt="SipSync"
                className="w-14 h-14 rounded-2xl object-contain"
              />
            </div>
          </div>

          {/* Brand Name */}
          <h1
            className="font-serif text-6xl tracking-tight mb-4"
            style={{ color: "#FFF8F0" }}
          >
            Sip<span style={{ color: "#D4A574" }}>Sync</span>
          </h1>

          {/* Tagline */}
          <p
            className="font-sans text-lg leading-relaxed mb-3 tracking-wide"
            style={{ color: "rgba(255,248,240,0.7)" }}
          >
            Where every order flows seamlessly
          </p>
          <p
            className="font-sans text-sm leading-relaxed max-w-sm mx-auto mb-14"
            style={{ color: "rgba(255,248,240,0.45)" }}
          >
            The complete restaurant POS platform — from table ordering to kitchen
            display, multi-payment checkout, and real-time analytics.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 mb-14">
            <span
              className="block w-8 h-px"
              style={{ background: "rgba(212,165,116,0.3)" }}
            />
            <span
              className="block w-1.5 h-1.5 rounded-full"
              style={{ background: "rgba(212,165,116,0.4)" }}
            />
            <span
              className="block w-8 h-px"
              style={{ background: "rgba(212,165,116,0.3)" }}
            />
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Table Ordering",
              "Kitchen Display",
              "Multi-Payment",
              "Live Dashboard",
              "Staff Management",
              "Analytics",
            ].map((feature) => (
              <span
                key={feature}
                className="font-sans text-xs tracking-wider uppercase px-5 py-2.5 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 cursor-default"
                style={{
                  background: "rgba(255,248,240,0.06)",
                  color: "rgba(255,248,240,0.6)",
                  border: "1px solid rgba(255,248,240,0.08)",
                }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          className="absolute bottom-8 left-0 right-0 text-center font-sans text-xs tracking-widest uppercase"
          style={{ color: "rgba(255,248,240,0.2)" }}
        >
          &copy; 2026 SipSync &mdash; Premium POS
        </div>
      </div>

      {/* ========== Right Panel — Auth Form ========== */}
      <div
        className="w-full lg:w-[48%] flex items-center justify-center px-6 py-12 lg:py-0 min-h-screen lg:min-h-0"
        style={{ background: "#FFF8F0" }}
      >
        <div className="w-full max-w-[420px] animate-fade-in-up delay-200">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #D4A574 0%, #6F4E37 100%)",
                }}
              >
                <img
                  src="/logo.png"
                  alt="SipSync"
                  className="w-8 h-8 rounded-xl object-contain"
                />
              </div>
              <h1 className="font-serif text-3xl" style={{ color: "#3C2415" }}>
                Sip<span style={{ color: "#6F4E37" }}>Sync</span>
              </h1>
            </div>
            <p className="font-sans text-sm" style={{ color: "#8B6F5E" }}>
              Where every order flows seamlessly
            </p>
          </div>

          {/* Tab Switcher */}
          <div
            className="flex mb-10 p-1.5 rounded-2xl"
            style={{ background: "#F5E6D3" }}
          >
            <button
              onClick={() => setIsLogin(true)}
              className="flex-1 py-3.5 text-sm font-semibold font-sans rounded-xl transition-all duration-300 relative"
              style={{
                background: isLogin ? "#FFF8F0" : "transparent",
                color: isLogin ? "#6F4E37" : "#8B6F5E",
                boxShadow: isLogin
                  ? "0 2px 12px rgba(111,78,55,0.1)"
                  : "none",
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className="flex-1 py-3.5 text-sm font-semibold font-sans rounded-xl transition-all duration-300 relative"
              style={{
                background: !isLogin ? "#FFF8F0" : "transparent",
                color: !isLogin ? "#6F4E37" : "#8B6F5E",
                boxShadow: !isLogin
                  ? "0 2px 12px rgba(111,78,55,0.1)"
                  : "none",
              }}
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2
              className="font-serif text-3xl mb-2"
              style={{ color: "#3C2415" }}
            >
              {isLogin ? "Welcome back" : "Get started"}
            </h2>
            <p className="font-sans text-sm" style={{ color: "#8B6F5E" }}>
              {isLogin
                ? "Enter your credentials to access your dashboard"
                : "Create your account to start managing your restaurant"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (signup only) */}
            {!isLogin && (
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium font-sans"
                  style={{ color: "#3C2415" }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-5 py-4 rounded-xl font-sans text-sm outline-none transition-all duration-300 placeholder:opacity-40"
                  style={{
                    background: "#F5E6D3",
                    color: "#3C2415",
                    border: "2px solid transparent",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "2px solid #D4A574";
                    e.target.style.background = "#FFF8F0";
                    e.target.style.boxShadow = "0 0 0 4px rgba(212,165,116,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "2px solid transparent";
                    e.target.style.background = "#F5E6D3";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium font-sans"
                style={{ color: "#3C2415" }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@restaurant.com"
                required
                className="w-full px-5 py-4 rounded-xl font-sans text-sm outline-none transition-all duration-300 placeholder:opacity-40"
                style={{
                  background: "#F5E6D3",
                  color: "#3C2415",
                  border: "2px solid transparent",
                }}
                onFocus={(e) => {
                  e.target.style.border = "2px solid #D4A574";
                  e.target.style.background = "#FFF8F0";
                  e.target.style.boxShadow = "0 0 0 4px rgba(212,165,116,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "2px solid transparent";
                  e.target.style.background = "#F5E6D3";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium font-sans"
                style={{ color: "#3C2415" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-5 py-4 rounded-xl font-sans text-sm outline-none transition-all duration-300 placeholder:opacity-40"
                style={{
                  background: "#F5E6D3",
                  color: "#3C2415",
                  border: "2px solid transparent",
                }}
                onFocus={(e) => {
                  e.target.style.border = "2px solid #D4A574";
                  e.target.style.background = "#FFF8F0";
                  e.target.style.boxShadow = "0 0 0 4px rgba(212,165,116,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.border = "2px solid transparent";
                  e.target.style.background = "#F5E6D3";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl font-sans font-semibold text-sm tracking-wide transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 mt-2 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #6F4E37 0%, #5C3D2E 100%)",
                color: "#FFF8F0",
                boxShadow: "0 4px 20px rgba(111,78,55,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #5C3D2E 0%, #3C2415 100%)";
                e.currentTarget.style.boxShadow =
                  "0 8px 30px rgba(111,78,55,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, #6F4E37 0%, #5C3D2E 100%)";
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(111,78,55,0.3)";
              }}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Switch Link */}
          <p
            className="text-center font-sans text-sm mt-8"
            style={{ color: "#8B6F5E" }}
          >
            {isLogin ? "Don\u2019t have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold transition-colors duration-200 cursor-pointer"
              style={{ color: "#6F4E37" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#3C2415";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#6F4E37";
              }}
            >
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </p>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 font-sans text-xs tracking-wide transition-colors duration-200"
              style={{ color: "#8B6F5E" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#6F4E37";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#8B6F5E";
              }}
            >
              <span>&larr;</span>
              <span>Back to Home</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#FFF8F0" }}
        >
          <div className="text-center animate-fade-in-up">
            <div
              className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #D4A574 0%, #6F4E37 100%)",
              }}
            >
              <img
                src="/logo.png"
                alt="Loading"
                className="w-8 h-8 rounded-xl object-contain"
              />
            </div>
            <p
              className="font-sans text-sm tracking-wide"
              style={{ color: "#8B6F5E" }}
            >
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
