"use client";

import { useStore } from "@/store/useStore";
import { CreditCard, Banknote, QrCode, Coffee, LayoutGrid } from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { paymentMethods, updatePaymentMethods } = useStore();
  const [upiId, setUpiId] = useState(paymentMethods.upiId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setUpiId(paymentMethods.upiId);
    }
  }, [mounted, paymentMethods.upiId]);

  if (!mounted) return null;

  const handleSaveUpi = () => {
    updatePaymentMethods({ upiId });
    toast.success("UPI ID saved!");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-espresso">Settings</h1>
        <p className="text-coffee-light text-sm mt-1">Configure your POS system</p>
      </div>

      {/* POS Info */}
      <div className="bg-cream border border-cream-medium rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-coffee/10 flex items-center justify-center">
            <Coffee className="w-5 h-5 text-coffee" />
          </div>
          <div>
            <h2 className="font-semibold text-espresso">Point of Sale</h2>
            <p className="text-xs text-coffee-light">SipSync</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-cream border border-cream-medium rounded-xl p-5">
        <h2 className="text-lg font-semibold text-espresso mb-1">Payment Methods</h2>
        <p className="text-xs text-coffee-light mb-5">
          Enable or disable payment methods available at checkout
        </p>

        <div className="space-y-4">
          {/* Cash */}
          <div className="flex items-center justify-between p-4 bg-cream-dark rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-espresso text-sm">Cash</p>
                <p className="text-xs text-coffee-light">
                  If enabled, available during checkout
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentMethods.cash}
                onChange={(e) =>
                  updatePaymentMethods({ cash: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cream-medium rounded-full peer peer-checked:bg-coffee transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cream after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 after:shadow-sm" />
            </label>
          </div>

          {/* Digital */}
          <div className="flex items-center justify-between p-4 bg-cream-dark rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-espresso text-sm">
                  Digital (Bank, Card)
                </p>
                <p className="text-xs text-coffee-light">
                  Generic digital payment category
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentMethods.digital}
                onChange={(e) =>
                  updatePaymentMethods({ digital: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cream-medium rounded-full peer peer-checked:bg-coffee transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cream after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 after:shadow-sm" />
            </label>
          </div>

          {/* UPI QR */}
          <div className="p-4 bg-cream-dark rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-espresso text-sm">
                    QR Payment (UPI)
                  </p>
                  <p className="text-xs text-coffee-light">
                    Generate QR code based on UPI ID
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentMethods.upi}
                  onChange={(e) =>
                    updatePaymentMethods({ upi: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-cream-medium rounded-full peer peer-checked:bg-coffee transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cream after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5 after:shadow-sm" />
              </label>
            </div>

            {paymentMethods.upi && (
              <div className="ml-12 mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-espresso mb-1">
                    UPI ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g: 123@ybl.com"
                      className="flex-1 px-3 py-2 border border-cream-medium rounded-lg text-sm bg-cream focus:ring-2 focus:ring-coffee focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handleSaveUpi}
                      className="px-4 py-2 bg-coffee text-cream rounded-lg text-sm font-medium hover:bg-coffee-dark transition"
                    >
                      Save
                    </button>
                  </div>
                  <p className="text-xs text-coffee-light mt-1">
                    QR code will be generated on the payment page based on this UPI ID
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floor Plan */}
      <div className="bg-cream border border-cream-medium rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-coffee/10 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-coffee" />
            </div>
            <div>
              <h2 className="font-semibold text-espresso">Floor Plan</h2>
              <p className="text-xs text-coffee-light">
                Manage floors and table layouts
              </p>
            </div>
          </div>
          <Link
            href="/backend/settings/floors"
            className="px-4 py-2 bg-coffee text-cream rounded-lg text-sm font-medium hover:bg-coffee-dark transition"
          >
            Manage Floor Plan
          </Link>
        </div>
      </div>
    </div>
  );
}
