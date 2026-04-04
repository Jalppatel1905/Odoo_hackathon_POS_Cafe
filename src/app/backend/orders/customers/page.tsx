"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Plus,
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

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh",
];

const countries = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Japan", "Singapore", "UAE",
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  street1: "",
  street2: "",
  city: "",
  state: "",
  country: "",
};

export default function CustomersPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const pathname = usePathname();

  const { customers, addCustomer } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const id = Math.random().toString(36).substring(2, 10);
    addCustomer({
      id,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: {
        street1: form.street1.trim(),
        street2: form.street2.trim(),
        city: form.city.trim(),
        state: form.state,
        country: form.country,
      },
      totalSales: 0,
    });
    toast.success("Customer added successfully");
    setForm(emptyForm);
    setShowForm(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-espresso">Customers</h1>
          <p className="text-coffee-light text-sm mt-1">
            Manage your customer records
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-coffee text-cream rounded-lg text-sm font-medium hover:bg-coffee-dark transition"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-light" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-cream border border-cream-medium rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-dark border-b border-cream-medium">
                <th className="text-left p-3 font-semibold text-espresso">Name</th>
                <th className="text-left p-3 font-semibold text-espresso">Contact</th>
                <th className="text-left p-3 font-semibold text-espresso">Phone</th>
                <th className="text-right p-3 font-semibold text-espresso">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-coffee-light">
                    No customers found
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-cream-medium last:border-0 hover:bg-cream-dark/50 transition"
                  >
                    <td className="p-3 font-medium text-espresso">{customer.name}</td>
                    <td className="p-3 text-coffee-light">{customer.email || "-"}</td>
                    <td className="p-3 text-coffee-light">{customer.phone || "-"}</td>
                    <td className="p-3 text-right font-medium text-espresso">
                      ${customer.totalSales.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-cream rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-cream-medium">
              <h2 className="text-lg font-bold text-espresso">New Customer</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm);
                }}
                className="w-8 h-8 rounded-lg hover:bg-cream-dark flex items-center justify-center transition"
              >
                <X className="w-5 h-5 text-coffee-light" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-espresso mb-1">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                  placeholder="Customer name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-espresso mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                  placeholder="email@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-espresso mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                  placeholder="+91 9876543210"
                />
              </div>

              {/* Address */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-espresso">Address</p>
                <input
                  type="text"
                  value={form.street1}
                  onChange={(e) => setForm({ ...form, street1: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                  placeholder="Street 1"
                />
                <input
                  type="text"
                  value={form.street2}
                  onChange={(e) => setForm({ ...form, street2: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                  placeholder="Street 2"
                />
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2.5 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                  placeholder="City"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <select
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full px-3 py-2.5 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full px-3 py-2.5 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                    >
                      <option value="">Select Country</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm(emptyForm);
                  }}
                  className="px-4 py-2.5 border border-cream-medium rounded-lg text-sm font-medium text-coffee-light hover:bg-cream-dark transition"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-coffee text-cream rounded-lg text-sm font-medium hover:bg-coffee-dark transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
