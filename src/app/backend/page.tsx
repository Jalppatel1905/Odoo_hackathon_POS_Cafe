"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

export default function BackendPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { currentUser } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !currentUser) {
      router.push("/auth");
    }
  }, [mounted, currentUser, router]);

  if (!mounted || !currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {currentUser.name}!</h1>
        <p className="text-gray-500">Backend dashboard coming in next module...</p>
      </div>
    </div>
  );
}
