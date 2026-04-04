"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Coffee } from "lucide-react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = login(email, password);
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
      const success = signup(name, email, password);
      if (success) {
        toast.success("Account created successfully!");
        router.push("/backend");
      } else {
        toast.error("Email already exists");
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-right" />

      {/* Left Side - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: "#714B67" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="z-10 text-center text-white px-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Coffee className="w-12 h-12" />
            <h1 className="text-5xl font-bold">
              Sip<span className="font-light">Sync</span>
            </h1>
          </div>
          <p className="text-xl opacity-90 mb-2">Restaurant POS System</p>
          <p className="text-sm opacity-70 max-w-sm mx-auto">
            Complete solution for table ordering, kitchen management, multi-payment checkout, and real-time analytics.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 text-sm opacity-80 max-w-xs mx-auto">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">Table Ordering</div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">Kitchen Display</div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">Multi-Payment</div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">Live Dashboard</div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coffee className="w-8 h-8 text-[#714B67]" />
              <h1 className="text-3xl font-bold text-gray-900">
                Sip<span className="text-[#714B67]">Sync</span>
              </h1>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex mb-8 bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                isLogin
                  ? "bg-white text-[#714B67] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                !isLogin
                  ? "bg-white text-[#714B67] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-2xl font-bold text-gray-800">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-gray-500 text-sm -mt-3">
              {isLogin
                ? "Enter your credentials to access POS"
                : "Fill in details to get started"}
            </p>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent outline-none transition text-sm"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email / Username
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent outline-none transition text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#714B67] focus:border-transparent outline-none transition text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full text-white py-2.5 rounded-lg font-semibold transition-all text-sm bg-[#714B67] hover:bg-[#5a3c53]"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          {/* Switch Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold hover:underline text-[#714B67]"
            >
              {isLogin ? "Sign Up here" : "Login"}
            </button>
          </p>

          {/* Back to Home */}
          <p className="text-center text-xs text-gray-400 mt-4">
            <a href="/" className="hover:text-[#714B67] transition">
              &larr; Back to Home
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
}
