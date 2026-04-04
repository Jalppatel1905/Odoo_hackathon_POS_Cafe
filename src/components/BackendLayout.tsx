"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import {
  Coffee,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  ChefHat,
  Monitor,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

const navItems = [
  {
    label: "Orders",
    href: "/backend/orders",
    icon: ShoppingCart,
    subItems: [
      { label: "Orders", href: "/backend/orders" },
      { label: "Payment", href: "/backend/orders/payments" },
      { label: "Customer", href: "/backend/orders/customers" },
    ],
  },
  {
    label: "Products",
    href: "/backend/products",
    icon: Package,
    subItems: [
      { label: "Products", href: "/backend/products" },
      { label: "Category", href: "/backend/products/categories" },
    ],
  },
  {
    label: "Reporting",
    href: "/backend/reporting",
    icon: BarChart3,
    subItems: [
      { label: "Dashboard", href: "/backend/reporting" },
    ],
  },
];

const settingsItems = [
  { label: "Setting", href: "/backend/settings", icon: Settings },
  { label: "Kitchen Display", href: "/backend/kitchen", icon: ChefHat },
  { label: "Customer Display", href: "/backend/customer-display", icon: Monitor },
];

export default function BackendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout, activeSession, openSession, sessions, loaded, loadData } =
    useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load data from DB on mount
  useEffect(() => {
    if (mounted && currentUser && !loaded) {
      loadData();
    }
  }, [mounted, currentUser, loaded, loadData]);

  useEffect(() => {
    if (mounted && !currentUser) {
      router.push("/auth");
    }
  }, [mounted, currentUser, router]);

  if (!mounted || !currentUser) return null;

  const lastSession = sessions[sessions.length - 1];
  const lastSell = lastSession?.closingAmount || 0;
  const lastOpen = lastSession
    ? new Date(lastSession.openedAt).toLocaleDateString()
    : "N/A";

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const handleOpenSession = () => {
    openSession();
    router.push("/pos");
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile only (slides in) */}
      <aside
        className={`fixed lg:hidden top-0 left-0 h-full w-64 bg-espresso text-cream z-50 transform transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-coffee-light/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6 text-latte" />
              <span className="text-lg font-bold">SipSync</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-cream-dark" />
            </button>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive(item.href)
                    ? "bg-coffee text-cream"
                    : "text-cream-dark hover:bg-coffee-dark hover:text-cream"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            </div>
          ))}
          <div className="border-t border-coffee-light/20 pt-2 mt-2">
            {settingsItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive(item.href)
                    ? "bg-coffee text-cream"
                    : "text-cream-dark hover:bg-coffee-dark hover:text-cream"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-cream border-b border-cream-medium sticky top-0 z-30">
          <div className="flex items-center justify-between h-14 px-4">
            {/* Left - Logo + Mobile Menu */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-coffee"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/backend" className="flex items-center gap-2">
                <Coffee className="w-6 h-6 text-coffee" />
                <span className="text-lg font-bold text-espresso">
                  Sip<span className="text-coffee">Sync</span>
                </span>
              </Link>
            </div>

            {/* Center - Navigation (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.label} className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === item.label ? null : item.label
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive(item.href)
                        ? "bg-coffee text-cream"
                        : "text-coffee-light hover:bg-cream-dark hover:text-coffee"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {item.subItems.length > 1 && (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  {/* Dropdown */}
                  {openDropdown === item.label && item.subItems.length > 1 && (
                    <div className="absolute top-full left-0 mt-1 bg-cream border border-cream-medium rounded-lg shadow-lg py-1 min-w-[160px] z-50">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`block px-4 py-2 text-sm transition ${
                            pathname === sub.href
                              ? "bg-cream-dark text-coffee font-medium"
                              : "text-coffee-light hover:bg-cream-dark hover:text-coffee"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right - Settings + User */}
            <div className="flex items-center gap-2">
              {/* 3-dot settings menu */}
              <div className="relative">
                <button
                  onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                  className="flex flex-col items-center justify-center w-8 h-8 rounded-lg hover:bg-cream-dark transition gap-0.5"
                >
                  <span className="w-1 h-1 bg-coffee rounded-full" />
                  <span className="w-1 h-1 bg-coffee rounded-full" />
                  <span className="w-1 h-1 bg-coffee rounded-full" />
                </button>
                {settingsDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-cream border border-cream-medium rounded-lg shadow-lg py-1 min-w-[180px] z-50">
                    {settingsItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setSettingsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-coffee-light hover:bg-cream-dark hover:text-coffee transition"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* User */}
              <div className="flex items-center gap-2 pl-2 border-l border-cream-medium">
                <div className="w-8 h-8 rounded-full bg-coffee text-cream flex items-center justify-center text-xs font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-espresso">
                  {currentUser.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-coffee-light hover:text-danger transition ml-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Click-away for dropdowns */}
        {(openDropdown || settingsDropdownOpen) && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => {
              setOpenDropdown(null);
              setSettingsDropdownOpen(false);
            }}
          />
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
