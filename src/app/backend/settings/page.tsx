"use client";

import { useStore } from "@/store/useStore";
import { CreditCard, Banknote, QrCode, Coffee, LayoutGrid, Smartphone, Copy, Download } from "lucide-react";
import Link from "next/link";
import QRCodeLib from "react-qrcode-logo";
import toast, { Toaster } from "react-hot-toast";
import { useState, useEffect, useRef } from "react";

function TableQRCard({ tableNumber }: { tableNumber: number }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const selfOrderUrl = typeof window !== "undefined"
    ? `${window.location.origin}/self-order?table=${tableNumber}`
    : `/self-order?table=${tableNumber}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("QR not ready yet");
      return;
    }

    // Create a new canvas with label
    const exportCanvas = document.createElement("canvas");
    const padding = 40;
    const labelHeight = 60;
    exportCanvas.width = canvas.width + padding * 2;
    exportCanvas.height = canvas.height + padding * 2 + labelHeight;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw QR
    ctx.drawImage(canvas, padding, padding);

    // Draw label
    ctx.fillStyle = "#3C2415";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Table ${tableNumber}`, exportCanvas.width / 2, canvas.height + padding + 35);

    ctx.fillStyle = "#8B6F5E";
    ctx.font = "12px Arial";
    ctx.fillText("Scan to order - SipSync", exportCanvas.width / 2, canvas.height + padding + 55);

    // Download
    const link = document.createElement("a");
    link.download = `SipSync-Table-${tableNumber}-QR.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
    toast.success(`QR downloaded for Table ${tableNumber}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selfOrderUrl);
    toast.success(`Link copied for Table ${tableNumber}!`);
  };

  return (
    <div className="p-4 bg-cream-dark rounded-xl">
      <div className="flex items-start gap-4">
        {/* QR Code */}
        <div ref={qrRef} className="bg-white rounded-lg p-2 shrink-0">
          <QRCodeLib
            value={selfOrderUrl}
            size={100}
            bgColor="#ffffff"
            fgColor="#3C2415"
            qrStyle="squares"
            eyeRadius={3}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-espresso mb-1">Table {tableNumber}</p>
          <p className="text-xs text-coffee-light truncate mb-3">{selfOrderUrl}</p>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cream border border-cream-medium rounded-lg text-xs font-medium text-espresso hover:border-latte transition"
            >
              <Copy className="w-3 h-3" />
              Copy Link
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-coffee text-cream rounded-lg text-xs font-medium hover:bg-coffee-dark transition"
            >
              <Download className="w-3 h-3" />
              Download QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { paymentMethods, updatePaymentMethods, floors } = useStore();
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

  const tables = floors[0]?.tables || [];

  const handleDownloadAll = () => {
    // Trigger download for each table with a small delay
    tables.forEach((table, i) => {
      setTimeout(() => {
        const card = document.querySelectorAll("[data-qr-table]")[i];
        const btn = card?.querySelector("[data-download-btn]") as HTMLButtonElement;
        if (btn) btn.click();
      }, i * 500);
    });
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

      {/* Self Ordering / QR Codes */}
      <div className="bg-cream border border-cream-medium rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-espresso">Self Ordering</h2>
              <p className="text-xs text-coffee-light">
                Download QR codes for each table. Customers scan and order from their phone.
              </p>
            </div>
          </div>
        </div>

        {tables.length > 0 ? (
          <>
            <div className="space-y-3">
              {tables.map((table) => (
                <TableQRCard key={table.id} tableNumber={table.number} />
              ))}
            </div>

            <button
              onClick={handleDownloadAll}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-coffee text-cream rounded-lg text-sm font-medium hover:bg-coffee-dark transition"
            >
              <Download className="w-4 h-4" />
              Download All QR Codes
            </button>
          </>
        ) : (
          <p className="text-sm text-coffee-light">
            No tables found. Add tables in the Floor Plan settings above.
          </p>
        )}
      </div>
    </div>
  );
}
