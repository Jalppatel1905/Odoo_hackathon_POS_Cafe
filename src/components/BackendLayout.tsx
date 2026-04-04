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
  ChevronRight,
  Home,
  CreditCard,
  Users,
  Tag,
  LayoutGrid,
  Play,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  external?: boolean; // opens in new tab
}

interface NavSection {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Orders & Sales",
    icon: ShoppingCart,
    items: [
      { label: "Orders", href: "/backend/orders", icon: ShoppingCart },
      { label: "Payments", href: "/backend/orders/payments", icon: CreditCard },
      { label: "Customers", href: "/backend/orders/customers", icon: Users },
    ],
  },
  {
    label: "Products",
    icon: Package,
    items: [
      { label: "All Products", href: "/backend/products", icon: Package },
      { label: "Categories", href: "/backend/products/categories", icon: Tag },
    ],
  },
  {
    label: "Reporting",
    icon: BarChart3,
    items: [
      { label: "Dashboard", href: "/backend/reporting", icon: BarChart3 },
    ],
  },
  {
    label: "Configuration",
    icon: Settings,
    items: [
      { label: "Settings", href: "/backend/settings", icon: Settings },
      { label: "Floor Plan", href: "/backend/settings/floors", icon: LayoutGrid },
      { label: "Kitchen Display", href: "/kitchen", icon: ChefHat, external: true },
      { label: "Customer Display", href: "/customer-display", icon: Monitor, external: true },
    ],
  },
];

export default function BackendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["Orders & Sales", "Products", "Reporting", "Configuration"]);
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout, activeSession, openSession, sessions, loaded, loadData } =
    useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const handleOpenSession = () => {
    openSession();
    router.push("/pos");
  };

  const isActive = (href: string) => pathname === href;
  const isSectionActive = (section: NavSection) =>
    section.items.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-[#5a3c28]/30">
        <div className="flex items-center justify-between">
          <Link href="/backend" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-latte/20 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-latte" />
            </div>
            {(!collapsed || mobile) && (
              <span className="text-lg font-bold text-cream">
                Sip<span className="text-latte font-normal">Sync</span>
              </span>
            )}
          </Link>
          {mobile && (
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-cream/60" />
            </button>
          )}
        </div>
      </div>

      {/* Open POS Button */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={handleOpenSession}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeSession
              ? "bg-green-600/90 hover:bg-green-600 text-white"
              : "bg-latte hover:bg-latte/90 text-espresso"
          }`}
        >
          <Play className="w-4 h-4" />
          {(!collapsed || mobile) && (activeSession ? "Continue POS" : "Open POS")}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {/* Home */}
        <Link
          href="/backend"
          onClick={mobile ? () => setSidebarOpen(false) : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
            pathname === "/backend"
              ? "bg-coffee text-cream"
              : "text-cream/70 hover:bg-coffee-dark/50 hover:text-cream"
          }`}
        >
          <Home className="w-4 h-4" />
          {(!collapsed || mobile) && "Dashboard"}
        </Link>

        {/* Sections */}
        {navSections.map((section) => (
          <div key={section.label} className="mt-1">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.label)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                isSectionActive(section)
                  ? "text-latte"
                  : "text-cream/40 hover:text-cream/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <section.icon className="w-3.5 h-3.5" />
                {(!collapsed || mobile) && section.label}
              </div>
              {(!collapsed || mobile) && (
                expandedSections.includes(section.label)
                  ? <ChevronDown className="w-3 h-3" />
                  : <ChevronRight className="w-3 h-3" />
              )}
            </button>

            {/* Section Items */}
            {(expandedSections.includes(section.label) || collapsed) && (
              <div className={`space-y-0.5 ${!collapsed || mobile ? "ml-2 pl-3 border-l border-coffee-light/20" : ""}`}>
                {section.items.map((item) =>
                  item.external ? (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={mobile ? () => setSidebarOpen(false) : undefined}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition text-cream/60 hover:bg-coffee-dark/40 hover:text-cream"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {(!collapsed || mobile) && (
                        <>
                          {item.label}
                          <span className="text-[10px] text-cream/30 ml-auto">↗</span>
                        </>
                      )}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={mobile ? () => setSidebarOpen(false) : undefined}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                        isActive(item.href)
                          ? "bg-coffee text-cream font-medium"
                          : "text-cream/60 hover:bg-coffee-dark/40 hover:text-cream"
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {(!collapsed || mobile) && item.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Section at Bottom */}
      <div className="border-t border-[#5a3c28]/30 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-coffee text-cream flex items-center justify-center text-xs font-bold shrink-0">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          {(!collapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cream truncate">{currentUser.name}</p>
              <p className="text-xs text-cream/40 truncate">{currentUser.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-cream/40 hover:text-red-400 transition shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile (slides in) */}
      <aside
        className={`fixed lg:hidden top-0 left-0 h-full w-64 bg-espresso z-50 transform transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent mobile />
      </aside>

      {/* Sidebar - Desktop (permanent) */}
      <aside
        className={`hidden lg:flex flex-col sticky top-0 h-screen bg-espresso transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Bar */}
        <header className="bg-cream border-b border-cream-medium sticky top-0 z-30 h-14 flex items-center px-4 justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-coffee"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex text-coffee-light hover:text-coffee transition"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb */}
            <div className="text-sm text-coffee-light">
              {pathname === "/backend" && <span className="text-espresso font-medium">Dashboard</span>}
              {pathname.includes("/orders") && !pathname.includes("/payments") && !pathname.includes("/customers") && <span className="text-espresso font-medium">Orders</span>}
              {pathname.includes("/payments") && <span className="text-espresso font-medium">Payments</span>}
              {pathname.includes("/customers") && <span className="text-espresso font-medium">Customers</span>}
              {pathname.includes("/products") && !pathname.includes("/categories") && <span className="text-espresso font-medium">Products</span>}
              {pathname.includes("/categories") && <span className="text-espresso font-medium">Categories</span>}
              {pathname.includes("/reporting") && <span className="text-espresso font-medium">Dashboard & Reports</span>}
              {pathname.includes("/settings") && !pathname.includes("/floors") && <span className="text-espresso font-medium">Settings</span>}
              {pathname.includes("/floors") && <span className="text-espresso font-medium">Floor Plan</span>}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {activeSession && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-success bg-success/10 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Session Active
              </span>
            )}
            <div className="flex items-center gap-2 pl-3 border-l border-cream-medium">
              <div className="w-8 h-8 rounded-full bg-coffee text-cream flex items-center justify-center text-xs font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium text-espresso">
                {currentUser.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
