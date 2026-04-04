"use client";

import BackendLayout from "@/components/BackendLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <BackendLayout>{children}</BackendLayout>;
}
