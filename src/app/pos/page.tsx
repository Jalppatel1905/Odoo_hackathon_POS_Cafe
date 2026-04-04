"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import {
  Coffee,
  ArrowLeft,
  RotateCw,
  Settings,
  X,
  Plus,
  Minus,
  Send,
  CreditCard,
  Trash2,
  StickyNote,
  User,
  FileText,
} from "lucide-react";

type Screen = "floor" | "order" | "payment" | "upi-qr" | "confirmed";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  tax: number;
  unit: string;
  notes: string;
}

export default function POSTerminal() {
  const [mounted, setMounted] = useState(false);
  const [screen, setScreen] = useState<Screen>("floor");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedTableNum, setSelectedTableNum] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeNumpad, setActiveNumpad] = useState<"qty" | "price" | "disc">("qty");
  const [selectedCartIndex, setSelectedCartIndex] = useState<number>(-1);
  const [customerName, setCustomerName] = useState("");
  const [isInvoice, setIsInvoice] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState<{ method: string; amount: number }[]>([]);
  const [showTopMenu, setShowTopMenu] = useState(false);

  const router = useRouter();
  const {
    currentUser,
    activeSession,
    floors,
    products,
    categories,
    paymentMethods,
    customers,
    addOrder,
    closeSession,
    updateOrder,
    loaded,
    loadData,
  } = useStore();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !loaded) loadData();
  }, [mounted, loaded, loadData]);

  useEffect(() => {
    if (mounted && (!currentUser || !activeSession)) {
      router.push("/backend");
    }
  }, [mounted, currentUser, activeSession, router]);

  if (!mounted || !currentUser || !activeSession) return null;

  const floor = floors[0];
  const tables = floor?.tables.filter((t) => t.active) || [];

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTax = cart.reduce(
    (sum, item) => sum + (item.price * item.quantity * item.tax) / 100,
    0
  );
  const cartFinalTotal = cartTotal + cartTax;
  const cartQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const existing = cart.findIndex((c) => c.productId === productId);
    if (existing >= 0) {
      const updated = [...cart];
      updated[existing].quantity += 1;
      setCart(updated);
      setSelectedCartIndex(existing);
    } else {
      setCart([
        ...cart,
        {
          productId,
          name: product.name,
          price: product.price,
          quantity: 1,
          tax: product.tax,
          unit: product.unit,
          notes: "",
        },
      ]);
      setSelectedCartIndex(cart.length);
    }
  };

  const updateCartQty = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
      setSelectedCartIndex(-1);
    }
    setCart(updated);
  };

  const removeCartItem = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
    setSelectedCartIndex(-1);
  };

  const handleNumpadPress = (val: string) => {
    if (selectedCartIndex < 0 || selectedCartIndex >= cart.length) return;
    const updated = [...cart];
    if (activeNumpad === "qty") {
      if (val === "+/-") {
        updated[selectedCartIndex].quantity = -updated[selectedCartIndex].quantity;
      } else {
        const num = parseInt(val);
        if (!isNaN(num)) updated[selectedCartIndex].quantity = num;
      }
    }
    setCart(updated);
  };

  const handleSendToKitchen = () => {
    if (cart.length === 0) return;
    const orderId = Math.random().toString(36).substring(2, 10);
    const orderNo = String(Math.floor(Math.random() * 9000) + 1000);
    const order = {
      id: orderId,
      orderNo,
      sessionId: activeSession.id,
      date: new Date().toISOString(),
      tableId: selectedTable || "",
      tableNumber: selectedTableNum,
      lines: cart.map((item) => ({
        id: Math.random().toString(36).substring(2, 10),
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        tax: item.tax,
        unit: item.unit,
        subtotal: item.price * item.quantity,
        notes: item.notes,
      })),
      total: cartTotal,
      tax: cartTax,
      finalTotal: cartFinalTotal,
      status: "draft" as const,
      customerId: "",
      customerName,
      payments: [],
      kitchenStatus: "to_cook" as const,
    };
    addOrder(order);
  };

  const handlePayment = () => {
    if (cart.length === 0) return;
    setScreen("payment");
    setPaymentAmounts([]);
  };

  const addPaymentMethod = (method: string) => {
    const existing = paymentAmounts.find((p) => p.method === method);
    if (existing) return;
    const remaining =
      cartFinalTotal - paymentAmounts.reduce((s, p) => s + p.amount, 0);
    setPaymentAmounts([...paymentAmounts, { method, amount: Math.max(0, remaining) }]);
  };

  const removePaymentMethod = (index: number) => {
    setPaymentAmounts(paymentAmounts.filter((_, i) => i !== index));
  };

  const handleValidatePayment = () => {
    const upiPayment = paymentAmounts.find((p) => p.method === "upi");
    if (upiPayment && paymentAmounts.length === 1) {
      setScreen("upi-qr");
      return;
    }
    completePayment();
  };

  const completePayment = () => {
    const orderId = Math.random().toString(36).substring(2, 10);
    const orderNo = String(Math.floor(Math.random() * 9000) + 1000);
    const order = {
      id: orderId,
      orderNo,
      sessionId: activeSession.id,
      date: new Date().toISOString(),
      tableId: selectedTable || "",
      tableNumber: selectedTableNum,
      lines: cart.map((item) => ({
        id: Math.random().toString(36).substring(2, 10),
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        tax: item.tax,
        unit: item.unit,
        subtotal: item.price * item.quantity,
        notes: item.notes,
      })),
      total: cartTotal,
      tax: cartTax,
      finalTotal: cartFinalTotal,
      status: "paid" as const,
      customerId: "",
      customerName,
      payments: paymentAmounts.map((p) => ({
        id: Math.random().toString(36).substring(2, 10),
        method: p.method as "cash" | "digital" | "upi",
        amount: p.amount,
        date: new Date().toISOString(),
      })),
      kitchenStatus: "to_cook" as const,
    };
    addOrder(order);
    setScreen("confirmed");
  };

  const resetOrder = () => {
    setCart([]);
    setSelectedTable(null);
    setSelectedTableNum(0);
    setCustomerName("");
    setIsInvoice(false);
    setPaymentAmounts([]);
    setSelectedCartIndex(-1);
    setScreen("floor");
  };

  const handleCloseRegister = () => {
    closeSession();
    router.push("/backend");
  };

  // ========== FLOOR VIEW ==========
  if (screen === "floor") {
    return (
      <div className="min-h-screen bg-cream-dark flex flex-col">
        {/* Top Bar */}
        <div className="bg-espresso text-cream h-12 flex items-center px-4 justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setScreen("floor")}
              className="text-sm font-medium px-3 py-1 bg-coffee rounded text-cream"
            >
              Table
            </button>
            <button
              onClick={() => {
                if (selectedTable) setScreen("order");
              }}
              className="text-sm font-medium px-3 py-1 rounded text-cream/60 hover:text-cream"
            >
              Register
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-latte" />
            <span className="font-bold text-sm">SipSync</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowTopMenu(!showTopMenu)}
              className="flex flex-col gap-0.5 p-2"
            >
              <span className="w-1 h-1 bg-cream rounded-full" />
              <span className="w-1 h-1 bg-cream rounded-full" />
              <span className="w-1 h-1 bg-cream rounded-full" />
            </button>
            {showTopMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTopMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-cream border border-cream-medium rounded-lg shadow-lg py-1 w-48 z-50">
                  <button
                    onClick={() => { setShowTopMenu(false); window.location.reload(); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-coffee-light hover:bg-cream-dark"
                  >
                    <RotateCw className="w-4 h-4" /> Reload Data
                  </button>
                  <button
                    onClick={() => { setShowTopMenu(false); router.push("/backend"); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-coffee-light hover:bg-cream-dark"
                  >
                    <Settings className="w-4 h-4" /> Go to Back-end
                  </button>
                  <button
                    onClick={handleCloseRegister}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger hover:bg-cream-dark"
                  >
                    <X className="w-4 h-4" /> Close Register
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Floor Title */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-espresso">{floor?.name || "Floor View"}</h2>
        </div>

        {/* Tables Grid */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => {
                  setSelectedTable(table.id);
                  setSelectedTableNum(table.number);
                  setScreen("order");
                }}
                className="aspect-square bg-cream border-2 border-cream-medium rounded-xl flex flex-col items-center justify-center hover:border-coffee hover:bg-cream-dark transition group shadow-sm"
              >
                <span className="text-2xl font-bold text-coffee group-hover:text-coffee-dark">
                  {table.number}
                </span>
                <span className="text-xs text-coffee-light mt-1">
                  {table.seats} seats
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========== CONFIRMED SCREEN ==========
  if (screen === "confirmed") {
    return (
      <div
        className="min-h-screen bg-espresso/80 flex items-center justify-center cursor-pointer"
        onClick={resetOrder}
      >
        <div className="bg-cream rounded-2xl p-10 text-center shadow-2xl max-w-sm">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-espresso mb-2">Payment Confirmed</h2>
          <p className="text-coffee-light text-sm mb-4">
            Amount Paid: <span className="font-bold text-espresso">${cartFinalTotal.toFixed(2)}</span>
          </p>
          <div className="flex gap-3 justify-center">
            <button className="px-4 py-2 bg-cream-dark text-coffee rounded-lg text-sm hover:bg-cream-medium transition">
              Email Receipt
            </button>
            <button
              onClick={resetOrder}
              className="px-4 py-2 bg-coffee text-cream rounded-lg text-sm hover:bg-coffee-dark transition"
            >
              Continue
            </button>
          </div>
          <p className="text-xs text-coffee-light mt-4">Click anywhere to dismiss</p>
        </div>
      </div>
    );
  }

  // ========== UPI QR SCREEN ==========
  if (screen === "upi-qr") {
    return (
      <div className="min-h-screen bg-cream-dark flex items-center justify-center">
        <div className="bg-cream rounded-2xl p-8 text-center shadow-xl max-w-sm w-full">
          <h2 className="text-lg font-bold text-espresso mb-1">UPI QR</h2>
          <p className="text-coffee-light text-sm mb-6">
            Amount: <span className="font-bold text-espresso">${cartFinalTotal.toFixed(2)}</span>
          </p>
          <div className="w-48 h-48 bg-cream-dark border-2 border-cream-medium rounded-xl mx-auto mb-6 flex items-center justify-center">
            <div className="text-center">
              <div className="grid grid-cols-5 gap-1 p-2">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-sm ${
                      Math.random() > 0.4 ? "bg-espresso" : "bg-cream"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={completePayment}
              className="flex-1 py-2.5 bg-coffee text-cream rounded-lg text-sm font-semibold hover:bg-coffee-dark transition"
            >
              Confirmed
            </button>
            <button
              onClick={() => setScreen("payment")}
              className="flex-1 py-2.5 bg-cream-dark text-coffee rounded-lg text-sm font-semibold hover:bg-cream-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== PAYMENT SCREEN ==========
  if (screen === "payment") {
    const totalPaid = paymentAmounts.reduce((s, p) => s + p.amount, 0);
    const remaining = cartFinalTotal - totalPaid;

    return (
      <div className="min-h-screen bg-cream-dark flex flex-col">
        {/* Top Bar */}
        <div className="bg-espresso text-cream h-12 flex items-center px-4 justify-between">
          <button
            onClick={() => setScreen("order")}
            className="flex items-center gap-2 text-sm text-cream/80 hover:text-cream"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Order
          </button>
          <span className="font-bold text-sm">Payment</span>
          <div />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left - Payment Methods */}
          <div className="flex-1 p-6">
            <h3 className="text-lg font-bold text-espresso mb-4">
              Total: <span className="text-coffee">${cartFinalTotal.toFixed(2)}</span>
            </h3>

            {/* Added payment methods */}
            <div className="space-y-3 mb-6">
              {paymentAmounts.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-cream p-3 rounded-lg border border-cream-medium"
                >
                  <span className="text-sm font-medium text-espresso capitalize">
                    {p.method === "digital" ? "Card" : p.method}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-espresso">
                      ${p.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removePaymentMethod(i)}
                      className="text-danger hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment method buttons */}
            <div className="space-y-2">
              {paymentMethods.cash && (
                <button
                  onClick={() => addPaymentMethod("cash")}
                  className="w-full text-left p-3 bg-cream border border-cream-medium rounded-lg hover:border-coffee transition text-sm font-medium text-espresso"
                >
                  Cash
                </button>
              )}
              {paymentMethods.digital && (
                <button
                  onClick={() => addPaymentMethod("digital")}
                  className="w-full text-left p-3 bg-cream border border-cream-medium rounded-lg hover:border-coffee transition text-sm font-medium text-espresso"
                >
                  Digital (Bank, Card)
                </button>
              )}
              {paymentMethods.upi && (
                <button
                  onClick={() => addPaymentMethod("upi")}
                  className="w-full text-left p-3 bg-cream border border-cream-medium rounded-lg hover:border-coffee transition text-sm font-medium text-espresso"
                >
                  UPI
                </button>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-coffee-light">
              <input
                type="checkbox"
                checked={isInvoice}
                onChange={(e) => setIsInvoice(e.target.checked)}
                className="accent-coffee"
              />
              Is Invoice
            </div>

            <button
              onClick={handleValidatePayment}
              disabled={paymentAmounts.length === 0}
              className="w-full mt-6 py-3 bg-coffee text-cream rounded-lg font-semibold text-sm hover:bg-coffee-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Validate
            </button>
          </div>

          {/* Right - Order Summary */}
          <div className="w-full lg:w-80 bg-cream border-l border-cream-medium p-4">
            <h4 className="text-sm font-bold text-espresso mb-3">Order Summary</h4>
            <div className="space-y-2 text-xs">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-coffee-light">
                  <span>
                    {item.quantity} x {item.name}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-cream-medium pt-2 mt-2">
                <div className="flex justify-between text-coffee-light">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-coffee-light">
                  <span>Tax</span>
                  <span>${cartTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-espresso text-sm mt-1">
                  <span>Total</span>
                  <span>${cartFinalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== ORDER SCREEN ==========
  return (
    <div className="min-h-screen bg-cream-dark flex flex-col">
      {/* Top Bar */}
      <div className="bg-espresso text-cream h-12 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen("floor")}
            className="text-sm font-medium px-3 py-1 rounded text-cream/60 hover:text-cream"
          >
            Table
          </button>
          <button className="text-sm font-medium px-3 py-1 bg-coffee rounded text-cream">
            Register
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-cream/60">Table {selectedTableNum}</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowTopMenu(!showTopMenu)}
            className="flex flex-col gap-0.5 p-2"
          >
            <span className="w-1 h-1 bg-cream rounded-full" />
            <span className="w-1 h-1 bg-cream rounded-full" />
            <span className="w-1 h-1 bg-cream rounded-full" />
          </button>
          {showTopMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowTopMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-cream border border-cream-medium rounded-lg shadow-lg py-1 w-48 z-50">
                <button
                  onClick={() => { setShowTopMenu(false); window.location.reload(); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-coffee-light hover:bg-cream-dark"
                >
                  <RotateCw className="w-4 h-4" /> Reload Data
                </button>
                <button
                  onClick={() => { setShowTopMenu(false); router.push("/backend"); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-coffee-light hover:bg-cream-dark"
                >
                  <Settings className="w-4 h-4" /> Go to Back-end
                </button>
                <button
                  onClick={handleCloseRegister}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger hover:bg-cream-dark"
                >
                  <X className="w-4 h-4" /> Close Register
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT - Products */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category Tabs */}
          <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                !selectedCategory
                  ? "bg-coffee text-cream"
                  : "bg-cream text-coffee-light hover:bg-cream border border-cream-medium"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? "text-cream"
                    : "bg-cream text-coffee-light hover:bg-cream border border-cream-medium"
                }`}
                style={
                  selectedCategory === cat.id
                    ? { backgroundColor: cat.color || "#6F4E37" }
                    : {}
                }
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredProducts.map((product) => {
                const cat = categories.find((c) => c.id === product.category);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product.id)}
                    className="bg-cream border border-cream-medium rounded-xl p-3 text-center hover:border-coffee hover:shadow-md transition group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                      style={{ backgroundColor: (cat?.color || "#6F4E37") + "20" }}
                    >
                      <Coffee
                        className="w-5 h-5"
                        style={{ color: cat?.color || "#6F4E37" }}
                      />
                    </div>
                    <p className="text-sm font-medium text-espresso truncate">
                      {product.name}
                    </p>
                    <p className="text-sm font-bold text-coffee mt-0.5">
                      ${product.price}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT - Cart */}
        <div className="w-full lg:w-80 bg-cream border-l border-cream-medium flex flex-col">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3">
            {cart.length === 0 ? (
              <div className="text-center text-coffee-light text-sm py-10">
                No items in cart
              </div>
            ) : (
              <div className="space-y-1">
                {cart.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedCartIndex(i)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-sm ${
                      selectedCartIndex === i
                        ? "bg-coffee/10 border border-coffee/30"
                        : "hover:bg-cream-dark"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-espresso truncate">
                        {item.quantity} x {item.name}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-coffee-light italic">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="font-bold text-espresso text-sm">
                        ${(item.price * item.quantity).toFixed(0)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCartItem(i);
                        }}
                        className="text-coffee-light hover:text-danger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Numpad + Actions */}
          <div className="border-t border-cream-medium p-3 space-y-2">
            {/* Qty/Price/Disc tabs */}
            <div className="flex gap-1">
              {(["qty", "price", "disc"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveNumpad(tab)}
                  className={`flex-1 py-1 text-xs font-medium rounded ${
                    activeNumpad === tab
                      ? "bg-coffee text-cream"
                      : "bg-cream-dark text-coffee-light"
                  }`}
                >
                  {tab === "qty" ? "Qty" : tab === "price" ? "Price" : "Disc."}
                </button>
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-1">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "+/-", "0", "."].map(
                (key) => (
                  <button
                    key={key}
                    onClick={() => handleNumpadPress(key)}
                    className="py-2 bg-cream-dark rounded text-sm font-medium text-espresso hover:bg-cream-medium transition"
                  >
                    {key}
                  </button>
                )
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1">
              <button
                onClick={() => setShowCustomerModal(true)}
                className="flex-1 py-1.5 text-xs bg-cream-dark rounded text-coffee-light hover:bg-cream-medium flex items-center justify-center gap-1"
              >
                <User className="w-3 h-3" /> Customer
              </button>
              <button
                onClick={() => {
                  if (selectedCartIndex >= 0) setShowNoteModal(true);
                }}
                className="flex-1 py-1.5 text-xs bg-cream-dark rounded text-coffee-light hover:bg-cream-medium flex items-center justify-center gap-1"
              >
                <StickyNote className="w-3 h-3" /> Notes
              </button>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-2 border-t border-cream-medium">
              <span className="text-sm font-bold text-espresso">Total</span>
              <span className="text-lg font-bold text-coffee">
                ${cartFinalTotal.toFixed(2)}
              </span>
            </div>

            {/* Send + Payment */}
            <div className="flex gap-2">
              <button
                onClick={handleSendToKitchen}
                disabled={cart.length === 0}
                className="flex-1 py-2.5 bg-latte text-espresso rounded-lg font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Send
                {cartQty > 0 && (
                  <span className="text-xs bg-espresso/20 px-1.5 py-0.5 rounded ml-1">
                    Qty: {cartQty}
                  </span>
                )}
              </button>
              <button
                onClick={handlePayment}
                disabled={cart.length === 0}
                className="flex-1 py-2.5 bg-coffee text-cream rounded-lg font-semibold text-sm hover:bg-coffee-dark transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" /> Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && selectedCartIndex >= 0 && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-cream rounded-xl p-5 w-80 shadow-xl">
            <h3 className="font-bold text-espresso mb-3">Add Note</h3>
            <textarea
              value={cart[selectedCartIndex]?.notes || ""}
              onChange={(e) => {
                const updated = [...cart];
                updated[selectedCartIndex].notes = e.target.value;
                setCart(updated);
              }}
              placeholder="e.g: Less Sugar"
              className="w-full border border-cream-medium rounded-lg p-2 text-sm h-20 outline-none focus:ring-2 focus:ring-coffee bg-cream"
            />
            <button
              onClick={() => setShowNoteModal(false)}
              className="w-full mt-3 py-2 bg-coffee text-cream rounded-lg text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-cream rounded-xl p-5 w-80 shadow-xl">
            <h3 className="font-bold text-espresso mb-3">Select Customer</h3>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name..."
              className="w-full border border-cream-medium rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-coffee bg-cream mb-2"
            />
            <div className="max-h-32 overflow-y-auto space-y-1">
              {customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCustomerName(c.name);
                    setShowCustomerModal(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-espresso hover:bg-cream-dark rounded"
                >
                  {c.name} - {c.email}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCustomerModal(false)}
              className="w-full mt-3 py-2 bg-coffee text-cream rounded-lg text-sm font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
