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
  X,
  Eye,
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
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
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
        tableNumber: order.tableNumber,
        customerName: order.customerName,
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

  const viewOrder = useMemo(
    () => orders.find((o) => o.id === viewOrderId) || null,
    [orders, viewOrderId]
  );

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
        <h1 className="text-2xl font-serif font-bold text-espresso">Payments</h1>
        <p className="text-coffee-light text-sm mt-1">
          All payments grouped by method &middot; Click eye icon to view order details
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
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.color}`}>
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
                  <span className="text-lg font-bold text-espresso">₹{total.toFixed(2)}</span>
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
                        <th className="text-left p-3 font-semibold text-espresso">Order</th>
                        <th className="text-left p-3 font-semibold text-espresso">Table</th>
                        <th className="text-left p-3 font-semibold text-espresso">Customer</th>
                        <th className="text-left p-3 font-semibold text-espresso">Date</th>
                        <th className="text-right p-3 font-semibold text-espresso">Amount</th>
                        <th className="text-center p-3 font-semibold text-espresso w-16">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr
                          key={p.id}
                          className="border-t border-cream-medium hover:bg-cream-dark/30 transition"
                        >
                          <td className="p-3 font-medium text-espresso">#{p.orderNo}</td>
                          <td className="p-3">
                            {p.tableNumber > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-coffee/10 text-coffee">
                                T{p.tableNumber}
                              </span>
                            ) : (
                              <span className="text-coffee-light">-</span>
                            )}
                          </td>
                          <td className="p-3 text-coffee-light">{p.customerName || "-"}</td>
                          <td className="p-3 text-coffee-light">
                            {new Date(p.date).toLocaleDateString()}{" "}
                            <span className="text-xs">{new Date(p.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-espresso">₹{p.amount.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => setViewOrderId(p.orderId)}
                              className="w-8 h-8 rounded-lg bg-cream-dark hover:bg-cream-medium flex items-center justify-center mx-auto transition"
                              title="View Order Details"
                            >
                              <Eye className="w-4 h-4 text-coffee" />
                            </button>
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

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-cream-medium">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-coffee/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-coffee" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-espresso">Order #{viewOrder.orderNo}</h2>
                  <p className="text-xs text-coffee-light">
                    {new Date(viewOrder.date).toLocaleDateString()} at{" "}
                    {new Date(viewOrder.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewOrderId(null)}
                className="w-8 h-8 rounded-lg hover:bg-cream-dark flex items-center justify-center transition"
              >
                <X className="w-5 h-5 text-coffee-light" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-cream-dark rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-coffee-light mb-1">Table</p>
                  <p className="text-sm font-bold text-espresso">
                    {viewOrder.tableNumber > 0 ? `Table ${viewOrder.tableNumber}` : "No Table"}
                  </p>
                </div>
                <div className="bg-cream-dark rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-coffee-light mb-1">Customer</p>
                  <p className="text-sm font-bold text-espresso">{viewOrder.customerName || "Walk-in"}</p>
                </div>
                <div className="bg-cream-dark rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-coffee-light mb-1">Kitchen</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    viewOrder.kitchenStatus === "completed" ? "bg-green-100 text-green-700"
                    : viewOrder.kitchenStatus === "preparing" ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                  }`}>
                    {viewOrder.kitchenStatus === "completed" ? "Ready" : viewOrder.kitchenStatus === "preparing" ? "Cooking" : "To Cook"}
                  </span>
                </div>
                <div className="bg-cream-dark rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-coffee-light mb-1">Payment</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                    Paid
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-semibold text-espresso mb-2">Order Items</h3>
                <div className="border border-cream-medium rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream-dark border-b border-cream-medium">
                        <th className="text-left p-3 font-semibold text-espresso">Product</th>
                        <th className="text-center p-3 font-semibold text-espresso">QTY</th>
                        <th className="text-right p-3 font-semibold text-espresso">Price</th>
                        <th className="text-right p-3 font-semibold text-espresso">Sub-Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewOrder.lines.map((line) => (
                        <tr key={line.id} className="border-b border-cream-medium/50 last:border-0">
                          <td className="p-3">
                            <p className="font-medium text-espresso">{line.productName}</p>
                            {line.notes && <p className="text-xs text-coffee-light italic mt-0.5">{line.notes}</p>}
                          </td>
                          <td className="p-3 text-center text-coffee-light">{line.quantity}</td>
                          <td className="p-3 text-right text-coffee-light">₹{line.price.toFixed(2)}</td>
                          <td className="p-3 text-right font-medium text-espresso">₹{line.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-sm font-semibold text-espresso mb-2">Payment Breakdown</h3>
                <div className="space-y-2">
                  {viewOrder.payments.map((p) => {
                    const cfg = methodConfig[p.method] || methodConfig.cash;
                    const PIcon = cfg.icon;
                    return (
                      <div key={p.id} className="flex items-center justify-between bg-cream-dark rounded-lg px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${cfg.color}`}>
                            <PIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-medium text-espresso">{cfg.label}</span>
                        </div>
                        <span className="text-sm font-bold text-espresso">₹{p.amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-espresso/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-light">Subtotal</span>
                  <span className="font-medium text-espresso">₹{viewOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-light">Tax</span>
                  <span className="font-medium text-espresso">₹{viewOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-cream-medium pt-2 mt-1">
                  <span className="font-serif font-bold text-espresso">Total Paid</span>
                  <span className="font-serif text-lg font-bold text-coffee">₹{viewOrder.finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
