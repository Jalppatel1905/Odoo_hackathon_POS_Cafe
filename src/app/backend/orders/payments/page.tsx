"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  CreditCard,
  Users,
  ChevronDown,
  ChevronRight,
  Banknote,
  QrCode,
} from "lucide-react";

const subTabs = [
  { label: "Orders", href: "/backend/orders", icon: ShoppingCart },
  { label: "Payment", href: "/backend/orders/payments", icon: CreditCard },
  { label: "Customer", href: "/backend/orders/customers", icon: Users },
];

const methodConfig: Record<string, { label: string; icon: typeof CreditCard; color: string }> = {
  cash: { label: "Cash", icon: Banknote, color: "bg-green-100 text-green-600" },
  digital: { label: "Card / Digital", icon: CreditCard, color: "bg-blue-100 text-blue-600" },
  upi: { label: "UPI", icon: QrCode, color: "bg-purple-100 text-purple-600" },
};

export default function PaymentsPage() {
  const [mounted, setMounted] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["cash", "digital", "upi"]);
  const pathname = usePathname();

  const { orders } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const allPayments = useMemo(() => {
    return orders.flatMap((order) =>
      order.payments.map((p) => ({
        ...p,
        orderNo: order.orderNo,
        orderId: order.id,
      }))
    );
  }, [orders]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof allPayments> = { cash: [], digital: [], upi: [] };
    allPayments.forEach((p) => {
      if (groups[p.method]) {
        groups[p.method].push(p);
      }
    });
    return groups;
  }, [allPayments]);

  const toggleGroup = (method: string) => {
    setExpandedGroups((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-cream-dark rounded-lg p-1 w-fit">
        {subTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition ${
              pathname === tab.href
                ? "bg-coffee text-cream shadow-sm"
                : "text-coffee-light hover:text-coffee hover:bg-cream"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-espresso">Payments</h1>
        <p className="text-coffee-light text-sm mt-1">
          All payments grouped by method
        </p>
      </div>

      {/* Payment Groups */}
      <div className="space-y-3">
        {(["cash", "digital", "upi"] as const).map((method) => {
          const config = methodConfig[method];
          const payments = grouped[method];
          const total = payments.reduce((sum, p) => sum + p.amount, 0);
          const isExpanded = expandedGroups.includes(method);
          const Icon = config.icon;

          return (
            <div
              key={method}
              className="bg-cream border border-cream-medium rounded-xl overflow-hidden"
            >
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(method)}
                className="w-full flex items-center justify-between p-4 hover:bg-cream-dark/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-espresso">{config.label}</p>
                    <p className="text-xs text-coffee-light">
                      {payments.length} payment{payments.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-espresso">
                    ${total.toFixed(2)}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-coffee-light" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-coffee-light" />
                  )}
                </div>
              </button>

              {/* Expanded Rows */}
              {isExpanded && payments.length > 0 && (
                <div className="border-t border-cream-medium">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream-dark">
                        <th className="text-left p-3 font-semibold text-espresso">
                          Payment Method
                        </th>
                        <th className="text-left p-3 font-semibold text-espresso">
                          Order
                        </th>
                        <th className="text-left p-3 font-semibold text-espresso">
                          Date
                        </th>
                        <th className="text-right p-3 font-semibold text-espresso">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr
                          key={p.id}
                          className="border-t border-cream-medium hover:bg-cream-dark/30 transition"
                        >
                          <td className="p-3 text-espresso">{config.label}</td>
                          <td className="p-3 text-coffee-light">{p.orderNo}</td>
                          <td className="p-3 text-coffee-light">
                            {new Date(p.date).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right font-medium text-espresso">
                            ${p.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {isExpanded && payments.length === 0 && (
                <div className="border-t border-cream-medium p-6 text-center text-coffee-light text-sm">
                  No payments for this method
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
