"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Trash2,
  X,
  ShoppingCart,
  CreditCard,
  Users,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const subTabs = [
  { label: "Orders", href: "/backend/orders", icon: ShoppingCart },
  { label: "Payment", href: "/backend/orders/payments", icon: CreditCard },
  { label: "Customer", href: "/backend/orders/customers", icon: Users },
];

export default function OrdersPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "paid">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const pathname = usePathname();

  const { orders, deleteOrders, updateOrder } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        (o.customerName || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const detailOrder = useMemo(
    () => orders.find((o) => o.id === detailOrderId) || null,
    [orders, detailOrderId]
  );

  const draftSelected = useMemo(
    () => selected.filter((id) => orders.find((o) => o.id === id)?.status === "draft"),
    [selected, orders]
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const draftIds = filtered.filter((o) => o.status === "draft").map((o) => o.id);
    if (draftIds.every((id) => selected.includes(id))) {
      setSelected((prev) => prev.filter((id) => !draftIds.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...draftIds])]);
    }
  };

  const handleDelete = () => {
    if (draftSelected.length === 0) {
      toast.error("Only draft orders can be deleted");
      return;
    }
    deleteOrders(draftSelected);
    setSelected([]);
    toast.success(`Deleted ${draftSelected.length} order(s)`);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Toaster position="top-right" />

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
        <h1 className="text-2xl font-bold text-espresso">Orders</h1>
        <p className="text-coffee-light text-sm mt-1">
          View and manage all orders
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order no or customer..."
            className="w-full pl-10 pr-4 py-2.5 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "draft" | "paid")}
          className="px-4 py-2.5 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-cream-dark border border-cream-medium rounded-lg p-3">
          <span className="text-sm text-espresso font-medium">
            {selected.length} selected
          </span>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-danger text-cream rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-cream border border-cream-medium rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-dark border-b border-cream-medium">
                <th className="text-left p-3 w-10">
                  <input
                    type="checkbox"
                    onChange={toggleAll}
                    checked={
                      filtered.filter((o) => o.status === "draft").length > 0 &&
                      filtered
                        .filter((o) => o.status === "draft")
                        .every((o) => selected.includes(o.id))
                    }
                    className="rounded border-cream-medium accent-coffee"
                  />
                </th>
                <th className="text-left p-3 font-semibold text-espresso">Order No</th>
                <th className="text-left p-3 font-semibold text-espresso">Table</th>
                <th className="text-left p-3 font-semibold text-espresso">Date</th>
                <th className="text-right p-3 font-semibold text-espresso">Total</th>
                <th className="text-left p-3 font-semibold text-espresso">Customer</th>
                <th className="text-left p-3 font-semibold text-espresso">Kitchen</th>
                <th className="text-left p-3 font-semibold text-espresso">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-coffee-light">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setDetailOrderId(order.id)}
                    className="border-b border-cream-medium hover:bg-cream-dark/50 cursor-pointer transition"
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      {order.status === "draft" && (
                        <input
                          type="checkbox"
                          checked={selected.includes(order.id)}
                          onChange={() => toggleSelect(order.id)}
                          className="rounded border-cream-medium accent-coffee"
                        />
                      )}
                    </td>
                    <td className="p-3 font-medium text-espresso">#{order.orderNo}</td>
                    <td className="p-3">
                      {order.tableNumber > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-coffee/10 text-coffee">
                          Table {order.tableNumber}
                        </span>
                      ) : (
                        <span className="text-coffee-light">-</span>
                      )}
                    </td>
                    <td className="p-3 text-coffee-light">
                      {new Date(order.date).toLocaleDateString()}{" "}
                      <span className="text-xs">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="p-3 text-right font-medium text-espresso">
                      ${order.finalTotal.toFixed(2)}
                    </td>
                    <td className="p-3 text-coffee-light">
                      {order.customerName || "-"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.kitchenStatus === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.kitchenStatus === "preparing"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.kitchenStatus === "completed" ? "Ready" : order.kitchenStatus === "preparing" ? "Cooking" : "To Cook"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "paid"
                            ? "bg-success/10 text-success"
                            : "bg-cream-medium text-coffee-light"
                        }`}
                      >
                        {order.status === "paid" ? "Paid" : "Draft"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-cream rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-cream-medium">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-coffee/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-coffee" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-espresso">
                    Order #{detailOrder.orderNo}
                  </h2>
                  <p className="text-xs text-coffee-light">
                    {new Date(detailOrder.date).toLocaleDateString()} at{" "}
                    {new Date(detailOrder.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailOrderId(null)}
                className="w-8 h-8 rounded-lg hover:bg-cream-dark flex items-center justify-center transition"
              >
                <X className="w-5 h-5 text-coffee-light" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Order Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-cream-dark rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-coffee-light mb-1">Table</p>
                  <p className="text-sm font-bold text-espresso">
                    {detailOrder.tableNumber > 0 ? `Table ${detailOrder.tableNumber}` : "No Table"}
                  </p>
                </div>
                <div className="bg-cream-dark rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-coffee-light mb-1">Customer</p>
                  <p className="text-sm font-bold text-espresso">
                    {detailOrder.customerName || "Walk-in"}
                  </p>
                </div>
                <div className="bg-cream-dark rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-coffee-light mb-1">Kitchen</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    detailOrder.kitchenStatus === "completed"
                      ? "bg-green-100 text-green-700"
                      : detailOrder.kitchenStatus === "preparing"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {detailOrder.kitchenStatus === "completed" ? "Ready" : detailOrder.kitchenStatus === "preparing" ? "Cooking" : "To Cook"}
                  </span>
                </div>
                <div className="bg-cream-dark rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-coffee-light mb-1">Payment</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    detailOrder.status === "paid"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}>
                    {detailOrder.status === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>

              {/* Product Lines */}
              <div>
                <h3 className="text-sm font-semibold text-espresso mb-2">Order Items</h3>
                <div className="border border-cream-medium rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream-dark border-b border-cream-medium">
                        <th className="text-left p-3 font-semibold text-espresso">Product</th>
                        <th className="text-center p-3 font-semibold text-espresso">QTY</th>
                        <th className="text-right p-3 font-semibold text-espresso">Price</th>
                        <th className="text-right p-3 font-semibold text-espresso">Tax</th>
                        <th className="text-right p-3 font-semibold text-espresso">Sub-Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailOrder.lines.map((line) => (
                        <tr key={line.id} className="border-b border-cream-medium/50 last:border-0">
                          <td className="p-3">
                            <p className="font-medium text-espresso">{line.productName}</p>
                            {line.notes && (
                              <p className="text-xs text-coffee-light italic mt-0.5">{line.notes}</p>
                            )}
                          </td>
                          <td className="p-3 text-center text-coffee-light">{line.quantity}</td>
                          <td className="p-3 text-right text-coffee-light">₹{line.price.toFixed(2)}</td>
                          <td className="p-3 text-right text-coffee-light">{line.tax}%</td>
                          <td className="p-3 text-right font-medium text-espresso">₹{line.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Details */}
              {detailOrder.payments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-espresso mb-2">Payment Methods</h3>
                  <div className="space-y-2">
                    {detailOrder.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between bg-cream-dark rounded-lg px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-coffee-light" />
                          <span className="text-sm font-medium text-espresso capitalize">
                            {p.method === "digital" ? "Card / Bank" : p.method === "upi" ? "UPI" : "Cash"}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-espresso">₹{p.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="bg-espresso/5 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-light">Subtotal</span>
                  <span className="font-medium text-espresso">₹{detailOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-light">Tax</span>
                  <span className="font-medium text-espresso">₹{detailOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-cream-medium pt-2 mt-1">
                  <span className="font-serif font-bold text-espresso">Total</span>
                  <span className="font-serif text-lg font-bold text-coffee">₹{detailOrder.finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
