"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import toast, { Toaster } from "react-hot-toast";
import QRCode from "react-qrcode-logo";
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
  discount: number; // percentage 0-100
  tax: number;
  unit: string;
  notes: string;
}

export default function POSTerminal() {
  const [mounted, setMounted] = useState(false);
  const [screen, setScreen] = useState<Screen>("floor");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedTableNum, setSelectedTableNum] = useState<number>(0);
  const [tableCarts, setTableCarts] = useState<Record<string, CartItem[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("pos-table-carts");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeNumpad, setActiveNumpad] = useState<"qty" | "disc">("qty");
  const [selectedCartIndex, setSelectedCartIndex] = useState<number>(-1);
  const [customerName, setCustomerName] = useState("");
  const [isInvoice, setIsInvoice] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState<{ method: string; amount: number }[]>([]);
  const [showTopMenu, setShowTopMenu] = useState(false);
  const [confirmedOrderNo, setConfirmedOrderNo] = useState("");
  const [numpadBuffer, setNumpadBuffer] = useState("");

  // Get cart for currently selected table
  const cart = selectedTable ? (tableCarts[selectedTable] || []) : [];
  const setCart = (newCart: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    if (!selectedTable) return;
    setTableCarts((prev) => ({
      ...prev,
      [selectedTable]: typeof newCart === "function" ? newCart(prev[selectedTable] || []) : newCart,
    }));
  };

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
    addCustomer,
    closeSession,
    updateOrder,
    orders,
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

  // Reset numpad buffer when switching mode or selecting different item
  useEffect(() => {
    setNumpadBuffer("");
  }, [activeNumpad, selectedCartIndex]);

  // Persist tableCarts to sessionStorage
  useEffect(() => {
    if (mounted) {
      sessionStorage.setItem("pos-table-carts", JSON.stringify(tableCarts));
    }
  }, [mounted, tableCarts]);

  if (!mounted || !currentUser || !activeSession) return null;

  const allFloors = floors.filter((f) => f.tables && f.tables.length > 0);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const getItemTotal = (item: CartItem) => {
    const base = item.price * item.quantity;
    const discounted = base - (base * item.discount) / 100;
    return discounted;
  };
  const cartTotal = cart.reduce((sum, item) => sum + getItemTotal(item), 0);
  const cartDiscount = cart.reduce((sum, item) => sum + (item.price * item.quantity * item.discount) / 100, 0);
  const cartTax = cart.reduce(
    (sum, item) => sum + (getItemTotal(item) * item.tax) / 100,
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
          discount: 0,
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

    if (val === "C") {
      setNumpadBuffer("");
      if (activeNumpad === "qty") updated[selectedCartIndex].quantity = 1;
      else updated[selectedCartIndex].discount = 0;
      setCart(updated);
      return;
    }

    if (val === "backspace") {
      const newBuf = numpadBuffer.slice(0, -1);
      setNumpadBuffer(newBuf);
      const num = parseFloat(newBuf) || 0;
      if (activeNumpad === "qty") updated[selectedCartIndex].quantity = Math.max(1, Math.floor(num));
      else updated[selectedCartIndex].discount = Math.min(100, Math.max(0, num));
      setCart(updated);
      return;
    }

    const newBuffer = numpadBuffer + val;
    const num = parseFloat(newBuffer);
    if (isNaN(num)) return;

    setNumpadBuffer(newBuffer);
    if (activeNumpad === "qty") updated[selectedCartIndex].quantity = Math.max(1, Math.floor(num));
    else updated[selectedCartIndex].discount = Math.min(100, Math.max(0, num));
    setCart(updated);
  };


  const handleSendToKitchen = async () => {
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
        subtotal: getItemTotal(item),
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
    await addOrder(order);
    toast.success(`Order #${orderNo} sent to kitchen! (Table ${selectedTableNum})`, { duration: 3000 });
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
        subtotal: getItemTotal(item),
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
    setConfirmedOrderNo(orderNo);
    setScreen("confirmed");
  };

  const resetOrder = () => {
    // Clear only the current table's cart
    if (selectedTable) {
      setTableCarts((prev) => {
        const updated = { ...prev };
        delete updated[selectedTable];
        return updated;
      });
    }
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
            <img src="/logo.png" alt="SipSync" className="w-6 h-6 rounded object-contain" />
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

        {/* Legend */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-espresso">Floor View</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cream border-2 border-cream-medium" />
              Free
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-coffee" />
              Occupied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-success" />
              Paid
            </span>
          </div>
        </div>

        {/* All Floors with Tables */}
        <div className="flex-1 p-6 overflow-y-auto space-y-8">
          {allFloors.length === 0 ? (
            <div className="text-center py-20 text-coffee-light">No floors or tables configured</div>
          ) : (
            allFloors.map((floor) => (
              <div key={floor.id}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-coffee" />
                  <h3 className="text-sm font-bold text-espresso uppercase tracking-wider">{floor.name}</h3>
                  <span className="text-xs text-coffee-light">({floor.tables.filter((t) => t.active).length} tables)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {floor.tables.filter((t) => t.active).map((table) => {
                    const tableCart = tableCarts[table.id] || [];
                    const hasCartItems = tableCart.length > 0;
                    const cartItemCount = tableCart.reduce((s, i) => s + i.quantity, 0);

                    const draftOrder = orders.find(
                      (o) => o.tableId === table.id && o.status === "draft"
                    );
                    const paidOrder = orders.find(
                      (o) => o.tableId === table.id && o.status === "paid" &&
                        new Date(o.date).toDateString() === new Date().toDateString()
                    );

                    const isOccupied = hasCartItems || !!draftOrder;
                    const isPaid = !isOccupied && !!paidOrder;
                    const itemCount = cartItemCount || (draftOrder?.lines.length || 0);
                    const orderTotal = draftOrder?.finalTotal || 0;

                    return (
                      <button
                        key={table.id}
                        onClick={() => {
                          setSelectedTable(table.id);
                          setSelectedTableNum(table.number);
                          setSelectedCartIndex(-1);
                          setScreen("order");
                        }}
                        className="group relative"
                      >
                        {/* Chair dots - top */}
                        <div className="flex justify-center gap-2 mb-1.5">
                          {Array.from({ length: Math.min(Math.ceil(table.seats / 2), 3) }).map((_, i) => (
                            <div key={`top-${i}`} className={`w-4 h-2.5 rounded-t-full transition ${
                              isOccupied ? "bg-coffee" : isPaid ? "bg-success/60" : "bg-cream-medium group-hover:bg-latte"
                            }`} />
                          ))}
                        </div>

                        {/* Table body */}
                        <div className={`rounded-2xl p-4 transition-all relative overflow-hidden ${
                          isOccupied
                            ? "bg-coffee shadow-lg shadow-coffee/20"
                            : isPaid
                            ? "bg-success/10 border-2 border-success/30"
                            : "bg-cream border-2 border-cream-medium group-hover:border-latte group-hover:shadow-md"
                        }`}>
                          <div className="text-center">
                            <span className={`text-3xl font-bold ${
                              isOccupied ? "text-cream" : isPaid ? "text-success" : "text-coffee group-hover:text-coffee-dark"
                            }`}>
                              {table.number}
                            </span>
                            <p className={`text-[10px] mt-0.5 uppercase tracking-wider font-medium ${
                              isOccupied ? "text-cream/60" : isPaid ? "text-success/70" : "text-coffee-light"
                            }`}>
                              Table
                            </p>
                          </div>

                          <div className="mt-2 text-center">
                            {isOccupied ? (
                              <>
                                <p className="text-xs text-cream/80 font-medium">{itemCount} items</p>
                                {orderTotal > 0 && (
                                  <p className="text-xs text-latte font-bold">₹{orderTotal.toFixed(0)}</p>
                                )}
                              </>
                            ) : isPaid ? (
                              <p className="text-xs text-success font-medium">Completed</p>
                            ) : (
                              <p className="text-xs text-coffee-light">{table.seats} seats</p>
                            )}
                          </div>

                          {isOccupied && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-latte animate-pulse" />
                          )}
                        </div>

                        {/* Chair dots - bottom */}
                        <div className="flex justify-center gap-2 mt-1.5">
                          {Array.from({ length: Math.min(Math.floor(table.seats / 2), 3) }).map((_, i) => (
                            <div key={`bot-${i}`} className={`w-4 h-2.5 rounded-b-full transition ${
                              isOccupied ? "bg-coffee" : isPaid ? "bg-success/60" : "bg-cream-medium group-hover:bg-latte"
                            }`} />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ========== CONFIRMED SCREEN ==========
  if (screen === "confirmed") {
    return (
      <div className="min-h-screen bg-espresso/80 flex items-center justify-center print:bg-white print:items-start print:pt-10">
        <div className="bg-cream rounded-2xl p-10 text-center shadow-2xl max-w-sm w-full print:shadow-none print:bg-white print:p-0 print:max-w-xs print:mx-auto">
          
          {/* Print-only Header */}
          <div className="hidden print:flex flex-col items-center justify-center mb-6 pt-4 border-b border-dashed border-gray-400 pb-4">
            <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center mb-2">
              <Coffee className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-black uppercase tracking-wider">SipSync</h1>
            <p className="text-xs text-gray-600 mt-1">Cafe & Coffee Shop</p>
            <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
          </div>

          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4 print:hidden">
            <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-espresso mb-2 print:text-black print:mb-4">Payment Confirmed</h2>

          <div className="bg-cream-dark rounded-lg p-4 mb-4 text-sm space-y-2 print:bg-transparent print:border print:border-gray-300 print:text-black">
            <div className="flex justify-between text-coffee-light print:text-black">
              <span>Order No.</span>
              <span className="font-bold text-espresso print:text-black">#{confirmedOrderNo}</span>
            </div>
            <div className="flex justify-between text-coffee-light print:text-black">
              <span>Table</span>
              <span className="font-bold text-espresso print:text-black">{selectedTableNum}</span>
            </div>
            <div className="flex justify-between text-coffee-light print:text-black">
              <span>Items</span>
              <span className="font-bold text-espresso print:text-black">{cartQty}</span>
            </div>
            
            {/* Added details for print view to show cart items */}
            <div className="hidden print:block border-t border-dashed border-gray-400 pt-2 mt-2">
              <div className="text-left font-bold mb-2">Order Items:</div>
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-xs mb-1">
                  <span>{item.quantity} x {item.name}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-medium print:border-solid print:border-gray-800 pt-2 flex justify-between">
              <span className="font-bold text-espresso print:text-black">Total Paid</span>
              <span className="font-bold text-coffee text-base print:text-black">₹{cartFinalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="hidden print:block text-center mt-6">
            <p className="text-xs font-bold font-mono">*** THANK YOU ***</p>
            <p className="text-[10px] mt-1 text-gray-500">Powered by SipSync POS</p>
          </div>

          <div className="flex gap-3 justify-center flex-wrap print:hidden">
            <button className="px-4 py-2 bg-cream-dark text-coffee rounded-lg text-sm hover:bg-cream-medium transition">
              Email Receipt
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-cream-dark text-coffee rounded-lg text-sm hover:bg-cream-medium transition"
            >
              Print Receipt
            </button>
            <button
              onClick={resetOrder}
              className="px-4 py-2 bg-coffee text-cream rounded-lg text-sm hover:bg-coffee-dark transition"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== UPI QR SCREEN ==========
  if (screen === "upi-qr") {
    const upiQrValue = paymentMethods.upiId
      ? `upi://pay?pa=${paymentMethods.upiId}&am=${cartFinalTotal}`
      : String(cartFinalTotal);

    return (
      <div className="min-h-screen bg-cream-dark flex items-center justify-center">
        <div className="bg-cream rounded-2xl p-8 text-center shadow-xl max-w-sm w-full">
          <h2 className="text-lg font-bold text-espresso mb-1">Scan to Pay</h2>
          <p className="text-coffee-light text-sm mb-6">
            Amount: <span className="font-bold text-espresso text-lg">₹{cartFinalTotal.toFixed(2)}</span>
          </p>
          <div className="bg-white rounded-xl p-4 mx-auto mb-4 inline-block">
            <QRCode
              value={upiQrValue}
              size={192}
              bgColor="#ffffff"
              fgColor="#2C1A0E"
              qrStyle="squares"
              eyeRadius={4}
            />
          </div>
          {paymentMethods.upiId && (
            <p className="text-xs text-coffee-light mb-4">
              UPI ID: <span className="font-medium text-espresso">{paymentMethods.upiId}</span>
            </p>
          )}
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
              Total: <span className="text-coffee">₹{cartFinalTotal.toFixed(2)}</span>
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
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-cream-medium pt-2 mt-2">
                <div className="flex justify-between text-coffee-light">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-coffee-light">
                  <span>Tax</span>
                  <span>₹{cartTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-espresso text-sm mt-1">
                  <span>Total</span>
                  <span>₹{cartFinalTotal.toFixed(2)}</span>
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
      <Toaster position="top-center" />
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
                      ₹{product.price}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT - Cart */}
        <div className="w-full lg:w-80 bg-cream border-l border-cream-medium flex flex-col">
          {/* Cart Items - Table View */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center text-coffee-light text-sm py-10">
                No items in cart
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-cream-dark">
                  <tr className="text-coffee-light font-semibold">
                    <th className="text-left py-2 px-2">Item</th>
                    <th className="text-center py-2 px-1 w-20">Qty</th>
                    <th className="text-right py-2 px-1 w-14">Price</th>
                    <th className="text-right py-2 px-1 w-12">Disc</th>
                    <th className="text-right py-2 px-2 w-16">Total</th>
                    <th className="w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, i) => (
                    <tr
                      key={i}
                      onClick={() => setSelectedCartIndex(i)}
                      className={`cursor-pointer transition border-b border-cream-dark ${
                        selectedCartIndex === i
                          ? "bg-coffee/10"
                          : "hover:bg-cream-dark"
                      }`}
                    >
                      <td className="py-2 px-2">
                        <p className="font-medium text-espresso truncate max-w-[100px]">{item.name}</p>
                        {item.notes && (
                          <p className="text-[10px] text-coffee-light italic truncate">{item.notes}</p>
                        )}
                      </td>
                      <td className="py-1 px-1">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateCartQty(i, -1); }}
                            className="w-5 h-5 rounded bg-cream-dark flex items-center justify-center text-coffee hover:bg-cream-medium"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="font-bold text-espresso w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateCartQty(i, 1); }}
                            className="w-5 h-5 rounded bg-cream-dark flex items-center justify-center text-coffee hover:bg-cream-medium"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-1 text-right text-coffee-light">₹{item.price}</td>
                      <td className="py-2 px-1 text-right">
                        {item.discount > 0 ? (
                          <span className="text-danger font-medium">{item.discount}%</span>
                        ) : (
                          <span className="text-coffee-light/40">-</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-espresso">₹{getItemTotal(item).toFixed(0)}</td>
                      <td className="py-2 pr-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); removeCartItem(i); }}
                          className="text-coffee-light/30 hover:text-danger transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Numpad + Actions */}
          <div className="border-t border-cream-medium p-3 space-y-2">
            {/* Qty / Discount toggle */}
            <div className="flex gap-1 bg-cream-dark rounded-lg p-0.5">
              {(["qty", "disc"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveNumpad(tab)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                    activeNumpad === tab
                      ? "bg-coffee text-cream shadow-sm"
                      : "text-coffee-light hover:text-coffee"
                  }`}
                >
                  {tab === "qty" ? "Quantity" : "Discount %"}
                </button>
              ))}
            </div>

            {/* Editable value input */}
            {selectedCartIndex >= 0 && selectedCartIndex < cart.length && (
              <div className="flex items-center justify-center gap-2 py-1">
                <span className="text-xs text-coffee-light font-medium">
                  {activeNumpad === "qty" ? "Qty:" : "Disc:"}
                </span>
                <input
                  type="number"
                  min={activeNumpad === "qty" ? 1 : 0}
                  max={activeNumpad === "disc" ? 100 : 9999}
                  value={
                    activeNumpad === "qty"
                      ? cart[selectedCartIndex].quantity
                      : cart[selectedCartIndex].discount
                  }
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const updated = [...cart];
                    if (activeNumpad === "qty") {
                      updated[selectedCartIndex].quantity = Math.max(1, Math.floor(val));
                    } else {
                      updated[selectedCartIndex].discount = Math.min(100, Math.max(0, val));
                    }
                    setCart(updated);
                  }}
                  className="w-20 text-center text-sm font-bold text-espresso bg-cream-dark border border-cream-medium rounded-lg py-1.5 outline-none focus:ring-2 focus:ring-coffee/30 focus:border-coffee"
                />
                {activeNumpad === "disc" && <span className="text-xs text-coffee-light">%</span>}
              </div>
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-1">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "backspace"].map(
                (key) => (
                  <button
                    key={key}
                    onClick={() => handleNumpadPress(key)}
                    className={`py-2.5 rounded-lg text-sm font-medium transition ${
                      key === "C"
                        ? "bg-danger/10 text-danger hover:bg-danger/20"
                        : key === "backspace"
                        ? "bg-cream-dark text-coffee-light hover:bg-cream-medium"
                        : "bg-cream-dark text-espresso hover:bg-cream-medium"
                    }`}
                  >
                    {key === "backspace" ? "⌫" : key}
                  </button>
                )
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-1">
              <button
                onClick={() => setShowCustomerModal(true)}
                className="flex-1 py-2 text-xs bg-cream-dark rounded-lg text-coffee-light hover:bg-cream-medium flex items-center justify-center gap-1 font-medium"
              >
                <User className="w-3.5 h-3.5" /> Customer
              </button>
              <button
                onClick={() => {
                  if (selectedCartIndex >= 0) setShowNoteModal(true);
                }}
                className="flex-1 py-2 text-xs bg-cream-dark rounded-lg text-coffee-light hover:bg-cream-medium flex items-center justify-center gap-1 font-medium"
              >
                <StickyNote className="w-3.5 h-3.5" /> Notes
              </button>
            </div>

            {/* Totals */}
            <div className="border-t border-cream-medium pt-2 space-y-1">
              {cartDiscount > 0 && (
                <div className="flex justify-between text-xs text-coffee-light">
                  <span>Discount</span>
                  <span className="text-danger">-${cartDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-coffee-light">
                <span>Tax</span>
                <span>₹{cartTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-bold text-espresso">Total</span>
                <span className="text-lg font-bold text-coffee">
                  ${cartFinalTotal.toFixed(2)}
                </span>
              </div>
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
                    {cartQty}
                  </span>
                )}
              </button>
              <button
                onClick={handlePayment}
                disabled={cart.length === 0}
                className="flex-1 py-2.5 bg-coffee text-cream rounded-lg font-semibold text-sm hover:bg-coffee-dark transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" /> Pay
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
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-cream-medium">
              <h3 className="font-bold text-espresso">Customer</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-cream-dark flex items-center justify-center"
              >
                <X className="w-4 h-4 text-coffee-light" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-cream-medium">
              <button
                id="cust-tab-search"
                onClick={() => {
                  document.getElementById("cust-panel-search")!.classList.remove("hidden");
                  document.getElementById("cust-panel-add")!.classList.add("hidden");
                  document.getElementById("cust-tab-search")!.classList.add("border-coffee", "text-coffee");
                  document.getElementById("cust-tab-search")!.classList.remove("text-coffee-light");
                  document.getElementById("cust-tab-add")!.classList.remove("border-coffee", "text-coffee");
                  document.getElementById("cust-tab-add")!.classList.add("text-coffee-light");
                }}
                className="flex-1 py-2.5 text-sm font-medium border-b-2 border-coffee text-coffee transition"
              >
                Select Existing
              </button>
              <button
                id="cust-tab-add"
                onClick={() => {
                  document.getElementById("cust-panel-add")!.classList.remove("hidden");
                  document.getElementById("cust-panel-search")!.classList.add("hidden");
                  document.getElementById("cust-tab-add")!.classList.add("border-coffee", "text-coffee");
                  document.getElementById("cust-tab-add")!.classList.remove("text-coffee-light");
                  document.getElementById("cust-tab-search")!.classList.remove("border-coffee", "text-coffee");
                  document.getElementById("cust-tab-search")!.classList.add("text-coffee-light");
                }}
                className="flex-1 py-2.5 text-sm font-medium border-b-2 border-transparent text-coffee-light transition"
              >
                Add New
              </button>
            </div>

            {/* Panel: Search Existing */}
            <div id="cust-panel-search" className="p-4">
              <div className="relative mb-3">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Search by name or phone..."
                  className="w-full border border-cream-medium rounded-lg p-2.5 pl-9 text-sm outline-none focus:ring-2 focus:ring-coffee/30 bg-cream"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-light" />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {customers
                  .filter((c) => !customerName || c.name.toLowerCase().includes(customerName.toLowerCase()) || c.phone.includes(customerName))
                  .length === 0 ? (
                  <p className="text-xs text-coffee-light text-center py-6">No customers found</p>
                ) : (
                  customers
                    .filter((c) => !customerName || c.name.toLowerCase().includes(customerName.toLowerCase()) || c.phone.includes(customerName))
                    .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCustomerName(c.name);
                        setShowCustomerModal(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-cream-dark rounded-lg flex items-center justify-between border border-transparent hover:border-cream-medium transition"
                    >
                      <div>
                        <p className="font-medium text-espresso">{c.name}</p>
                        <p className="text-xs text-coffee-light">{c.phone || c.email || "No contact"}</p>
                      </div>
                      <span className="text-xs text-coffee-light bg-cream-dark px-2 py-0.5 rounded-full">Select</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Panel: Add New */}
            <div id="cust-panel-add" className="p-4 hidden">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-espresso mb-1">Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    id="new-cust-name"
                    placeholder="Customer name"
                    className="w-full border border-cream-medium rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-coffee/30 bg-cream"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-espresso mb-1">Phone</label>
                  <input
                    type="tel"
                    id="new-cust-phone"
                    placeholder="+91 9876543210"
                    className="w-full border border-cream-medium rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-coffee/30 bg-cream"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-espresso mb-1">Email</label>
                  <input
                    type="email"
                    id="new-cust-email"
                    placeholder="email@example.com"
                    className="w-full border border-cream-medium rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-coffee/30 bg-cream"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nameEl = document.getElementById("new-cust-name") as HTMLInputElement;
                    const phoneEl = document.getElementById("new-cust-phone") as HTMLInputElement;
                    const emailEl = document.getElementById("new-cust-email") as HTMLInputElement;
                    const name = nameEl?.value?.trim();
                    if (!name) { toast.error("Name is required"); return; }
                    const id = Math.random().toString(36).substring(2, 10);
                    addCustomer({
                      id,
                      name,
                      email: emailEl?.value?.trim() || "",
                      phone: phoneEl?.value?.trim() || "",
                      address: { street1: "", street2: "", city: "", state: "", country: "" },
                      totalSales: 0,
                    });
                    setCustomerName(name);
                    setShowCustomerModal(false);
                    toast.success(`Customer "₹{name}" added`);
                  }}
                  className="w-full py-2.5 bg-coffee text-cream rounded-lg text-sm font-semibold hover:bg-coffee-dark transition"
                >
                  Add & Select Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
