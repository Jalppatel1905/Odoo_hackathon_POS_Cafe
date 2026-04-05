"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  Calendar,
  User,
  Package,
  X,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  BarChart3,
  Layers,
  Loader2,
} from "lucide-react";

type Period = "today" | "week" | "month" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  all: "All Time",
};

const PIE_COLORS = [
  "#6F4E37",
  "#D4A574",
  "#8B5E3C",
  "#C09A7D",
  "#3C2415",
  "#E8D0B3",
  "#5C3D2E",
  "#ffc107",
];

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val);
}

export default function ReportingPage() {
  const [mounted, setMounted] = useState(false);
  const { orders, products, categories, sessions, loaded, loadData } =
    useStore();

  // Filters
  const [period, setPeriod] = useState<Period>("all");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedResponsible, setSelectedResponsible] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  // Dropdown open state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loaded) {
      loadData();
    }
  }, [mounted, loaded, loadData]);

  // Derived data
  const uniqueResponsibles = useMemo(
    () => [...new Set(sessions.map((s) => s.responsible).filter(Boolean))],
    [sessions]
  );

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => (map[c.id] = c.name));
    return map;
  }, [categories]);

  const productCategoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    products.forEach((p) => (map[p.id] = p.category));
    return map;
  }, [products]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = orders.filter((o) => o.status === "paid");

    // Period filter
    const now = new Date();
    if (period === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      result = result.filter((o) => new Date(o.date) >= start);
    } else if (period === "week") {
      const dayOfWeek = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      result = result.filter((o) => new Date(o.date) >= start);
    } else if (period === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter((o) => new Date(o.date) >= start);
    }

    // Session filter
    if (selectedSession) {
      result = result.filter((o) => o.sessionId === selectedSession);
    }

    // Responsible filter (filter by sessions of that responsible)
    if (selectedResponsible) {
      const sessionIds = sessions
        .filter((s) => s.responsible === selectedResponsible)
        .map((s) => s.id);
      result = result.filter((o) => sessionIds.includes(o.sessionId));
    }

    // Product filter
    if (selectedProduct) {
      result = result.filter((o) =>
        o.lines.some((l) => l.productId === selectedProduct)
      );
    }

    return result;
  }, [orders, period, selectedSession, selectedResponsible, selectedProduct, sessions]);

  // Previous period orders for % change
  const prevPeriodOrders = useMemo(() => {
    let result = orders.filter((o) => o.status === "paid");
    const now = new Date();

    if (period === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      result = result.filter((o) => {
        const d = new Date(o.date);
        return d >= start && d < end;
      });
    } else if (period === "week") {
      const dayOfWeek = now.getDay();
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - dayOfWeek);
      thisWeekStart.setHours(0, 0, 0, 0);
      const prevWeekStart = new Date(thisWeekStart);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      result = result.filter((o) => {
        const d = new Date(o.date);
        return d >= prevWeekStart && d < thisWeekStart;
      });
    } else if (period === "month") {
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      result = result.filter((o) => {
        const d = new Date(o.date);
        return d >= prevMonthStart && d < thisMonthStart;
      });
    } else {
      return [];
    }

    return result;
  }, [orders, period]);

  // KPI calculations
  const totalOrders = filteredOrders.length;
  const revenue = filteredOrders.reduce((s, o) => s + o.finalTotal, 0);
  const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;

  const prevTotalOrders = prevPeriodOrders.length;
  const prevRevenue = prevPeriodOrders.reduce((s, o) => s + o.finalTotal, 0);
  const prevAvg = prevTotalOrders > 0 ? prevRevenue / prevTotalOrders : 0;

  const pctChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const ordersChange = pctChange(totalOrders, prevTotalOrders);
  const revenueChange = pctChange(revenue, prevRevenue);
  const avgChange = pctChange(avgOrderValue, prevAvg);

  // Sales chart data
  const salesChartData = useMemo(() => {
    if (filteredOrders.length === 0) return [];

    const buckets: Record<string, number> = {};

    if (period === "today") {
      for (let h = 0; h < 24; h++) {
        buckets[`${h.toString().padStart(2, "0")}:00`] = 0;
      }
      filteredOrders.forEach((o) => {
        const h = new Date(o.date).getHours();
        const key = `${h.toString().padStart(2, "0")}:00`;
        buckets[key] = (buckets[key] || 0) + o.finalTotal;
      });
    } else if (period === "week") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      days.forEach((d) => (buckets[d] = 0));
      filteredOrders.forEach((o) => {
        const d = new Date(o.date).getDay();
        buckets[days[d]] = (buckets[days[d]] || 0) + o.finalTotal;
      });
    } else if (period === "month") {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        buckets[`${d}`] = 0;
      }
      filteredOrders.forEach((o) => {
        const d = new Date(o.date).getDate();
        buckets[`${d}`] = (buckets[`${d}`] || 0) + o.finalTotal;
      });
    } else {
      // All time - group by month
      filteredOrders.forEach((o) => {
        const d = new Date(o.date);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        buckets[key] = (buckets[key] || 0) + o.finalTotal;
      });
    }

    return Object.entries(buckets)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([label, value]) => ({ label, revenue: Math.round(value * 100) / 100 }));
  }, [filteredOrders, period]);

  // Top selling categories
  const categorySales = useMemo(() => {
    const sales: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      o.lines.forEach((l) => {
        const catId = productCategoryMap[l.productId] || "unknown";
        const catName = categoryMap[catId] || "Uncategorized";
        sales[catName] = (sales[catName] || 0) + l.subtotal;
      });
    });
    const totalSales = Object.values(sales).reduce((s, v) => s + v, 0);
    return Object.entries(sales)
      .map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
        percentage: totalSales > 0 ? Math.round((value / totalSales) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOrders, productCategoryMap, categoryMap]);

  // Top products
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredOrders.forEach((o) => {
      o.lines.forEach((l) => {
        if (!productSales[l.productId]) {
          productSales[l.productId] = { name: l.productName, qty: 0, revenue: 0 };
        }
        productSales[l.productId].qty += l.quantity;
        productSales[l.productId].revenue += l.subtotal;
      });
    });
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders]);

  // Active filter pills
  const activeFilters = useMemo(() => {
    const pills: { key: string; label: string; onRemove: () => void }[] = [];
    if (period !== "all") {
      pills.push({
        key: "period",
        label: `Period: ${PERIOD_LABELS[period]}`,
        onRemove: () => setPeriod("all"),
      });
    }
    if (selectedSession) {
      const sess = sessions.find((s) => s.id === selectedSession);
      pills.push({
        key: "session",
        label: `Session: ${sess?.name || selectedSession}`,
        onRemove: () => setSelectedSession(""),
      });
    }
    if (selectedResponsible) {
      pills.push({
        key: "responsible",
        label: `Responsible: ${selectedResponsible}`,
        onRemove: () => setSelectedResponsible(""),
      });
    }
    if (selectedProduct) {
      const prod = products.find((p) => p.id === selectedProduct);
      pills.push({
        key: "product",
        label: `Product: ${prod?.name || selectedProduct}`,
        onRemove: () => setSelectedProduct(""),
      });
    }
    return pills;
  }, [period, selectedSession, selectedResponsible, selectedProduct, sessions, products]);

  const exportPDF = () => {
    const doc = new jsPDF();

    // Fallback currency formatter for jsPDF (standard fonts don't support ₹ securely without custom fonts)
    const pdfCurrency = (val: number) => `Rs. ${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Header Background
    doc.setFillColor(111, 78, 55); // SipSync Coffee color #6F4E37
    doc.rect(0, 0, 210, 40, "F");

    // Header Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text("SipSync", 14, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(230, 230, 230);
    doc.text("Reporting Dashboard", 14, 30);

    // Meta Info Background Box
    doc.setFillColor(248, 245, 242);
    doc.rect(14, 46, 182, 22, "F");

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 54);
    doc.text(`Period: ${PERIOD_LABELS[period]}`, 20, 62);

    // KPIs / Summary as a neat styled table block
    autoTable(doc, {
      startY: 75,
      head: [["Total Orders", "Total Revenue", "Avg Order Value"]],
      body: [[totalOrders.toString(), pdfCurrency(revenue), pdfCurrency(avgOrderValue)]],
      theme: "grid",
      headStyles: { fillColor: [60, 36, 21], halign: "center", fontSize: 11, cellPadding: 4 },
      bodyStyles: { halign: "center", fontSize: 14, fontStyle: "bold", textColor: [111, 78, 55], cellPadding: 6 },
      margin: { left: 14, right: 14 },
    });

    // Sub-Header Helper
    const addSectionHeader = (title: string, yPos: number) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(title, 14, yPos);
    };

    // Detailed Orders Table
    let currentY = (doc as any).lastAutoTable?.finalY + 15 || 105;
    addSectionHeader("Detailed Orders", currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [["Date & Time", "Order No", "Table", "Total"]],
      body: filteredOrders.map(o => [
        new Date(o.date).toLocaleString(),
        o.orderNo,
        o.tableNumber || "-",
        pdfCurrency(o.finalTotal)
      ]),
      theme: "striped",
      headStyles: { fillColor: [111, 78, 55] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Top Products Table
    currentY = (doc as any).lastAutoTable?.finalY + 15;
    // Check for page break
    if (currentY > 260) { doc.addPage(); currentY = 20; }
    addSectionHeader("Top Products", currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [["Product Name", "Qty Sold", "Revenue"]],
      body: topProducts.map(p => [p.name, p.qty, pdfCurrency(p.revenue)]),
      theme: "striped",
      headStyles: { fillColor: [111, 78, 55] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Top Categories Table
    currentY = (doc as any).lastAutoTable?.finalY + 15;
    if (currentY > 260) { doc.addPage(); currentY = 20; }
    addSectionHeader("Category Breakdown", currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [["Category", "Share", "Revenue"]],
      body: categorySales.map(c => [c.name, `${c.percentage}%`, pdfCurrency(c.value)]),
      theme: "striped",
      headStyles: { fillColor: [111, 78, 55] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Footer with Page Numbers
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150);
      doc.text(
        `SipSync POS System - Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    doc.save(`SipSync_Report_${new Date().getTime()}.pdf`);
  };

  const exportXLS = async () => {
    const workbook = new ExcelJS.Workbook();

    // 1. Summary Sheet
    const wsSummary = workbook.addWorksheet("Summary");

    wsSummary.getCell('A1').value = "SipSync";
    wsSummary.getCell('A1').font = { size: 24, bold: true, color: { argb: "FF6F4E37" } };

    wsSummary.getCell('A2').value = "Reporting Dashboard";
    wsSummary.getCell('A2').font = { size: 14, bold: true };

    wsSummary.getCell('A4').value = `Generated on: ${new Date().toLocaleString()}`;
    wsSummary.getCell('A5').value = `Period: ${PERIOD_LABELS[period]}`;

    wsSummary.getCell('A7').value = "Summary Metrics";
    wsSummary.getCell('A7').font = { bold: true };

    wsSummary.getCell('A8').value = "Total Orders";
    wsSummary.getCell('B8').value = totalOrders;

    wsSummary.getCell('A9').value = "Total Revenue";
    wsSummary.getCell('B9').value = revenue;
    wsSummary.getCell('B9').numFmt = '₹#,##0.00';

    wsSummary.getCell('A10').value = "Average Order Value";
    wsSummary.getCell('B10').value = avgOrderValue;
    wsSummary.getCell('B10').numFmt = '₹#,##0.00';

    wsSummary.getColumn('A').width = 25;
    wsSummary.getColumn('B').width = 20;

    // 2. Detailed Orders Sheet
    const wsOrders = workbook.addWorksheet("Detailed Orders");
    wsOrders.columns = [
      { header: "Date & Time", key: "date", width: 25 },
      { header: "Order No.", key: "orderNo", width: 15 },
      { header: "Table", key: "table", width: 10 },
      { header: "Customer", key: "customer", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Subtotal", key: "subtotal", width: 15 },
      { header: "Tax", key: "tax", width: 15 },
      { header: "Total", key: "total", width: 15 }
    ];

    wsOrders.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    wsOrders.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6F4E37" } };

    filteredOrders.forEach(o => {
      wsOrders.addRow({
        date: new Date(o.date).toLocaleString(),
        orderNo: o.orderNo,
        table: o.tableNumber || "-",
        customer: o.customerName || "-",
        status: o.status === "paid" ? "Paid" : o.status,
        subtotal: o.total,
        tax: o.tax,
        total: o.finalTotal
      });
    });

    ["subtotal", "tax", "total"].forEach(col => {
      wsOrders.getColumn(col).numFmt = '₹#,##0.00';
    });

    // 3. Top Products
    const wsProducts = workbook.addWorksheet("Top Products");
    wsProducts.columns = [
      { header: "Product Name", key: "name", width: 30 },
      { header: "Quantity Sold", key: "qty", width: 15 },
      { header: "Revenue Generator", key: "revenue", width: 20 }
    ];
    wsProducts.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    wsProducts.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6F4E37" } };

    topProducts.forEach(p => {
      wsProducts.addRow({ name: p.name, qty: p.qty, revenue: p.revenue });
    });
    wsProducts.getColumn("revenue").numFmt = '₹#,##0.00';

    // 4. Categories
    const wsCategories = workbook.addWorksheet("Categories");
    wsCategories.columns = [
      { header: "Category", key: "name", width: 25 },
      { header: "Share (%)", key: "share", width: 15 },
      { header: "Revenue", key: "revenue", width: 20 }
    ];
    wsCategories.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    wsCategories.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6F4E37" } };

    categorySales.forEach(c => {
      wsCategories.addRow({ name: c.name, share: c.percentage, revenue: c.value });
    });
    wsCategories.getColumn("share").numFmt = '0.0"%"';
    wsCategories.getColumn("revenue").numFmt = '₹#,##0.00';

    // Save
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `SipSync_Report_${new Date().getTime()}.xlsx`);
  };

  const handleExport = (type: string) => {
    if (typeof window !== "undefined") {
      if (type === "PDF") exportPDF();
      else if (type === "XLS") exportXLS();
    }
  };

  if (!mounted) return null;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-coffee animate-spin" />
        <span className="ml-3 text-coffee-light">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-espresso">Reporting Dashboard</h1>
          <p className="text-coffee-light text-sm mt-1">
            Overview of your sales performance and analytics
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-cream rounded-xl border border-cream-dark p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Period */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "period" ? null : "period")}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-cream-dark rounded-lg text-sm text-espresso hover:border-coffee-light transition-colors"
            >
              <Calendar className="w-4 h-4 text-coffee-light" />
              {PERIOD_LABELS[period]}
              <ChevronDown className="w-3 h-3 text-coffee-light" />
            </button>
            {openDropdown === "period" && (
              <div className="absolute z-20 top-full mt-1 left-0 bg-white border border-cream-dark rounded-lg shadow-lg min-w-[160px]">
                {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p);
                      setOpenDropdown(null);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-cream-dark transition-colors first:rounded-t-lg last:rounded-b-lg ${period === p ? "bg-cream-dark text-espresso font-medium" : "text-coffee"
                      }`}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Session */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "session" ? null : "session")}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-cream-dark rounded-lg text-sm text-espresso hover:border-coffee-light transition-colors"
            >
              <Layers className="w-4 h-4 text-coffee-light" />
              {selectedSession
                ? sessions.find((s) => s.id === selectedSession)?.name || "Session"
                : "Session"}
              <ChevronDown className="w-3 h-3 text-coffee-light" />
            </button>
            {openDropdown === "session" && (
              <div className="absolute z-20 top-full mt-1 left-0 bg-white border border-cream-dark rounded-lg shadow-lg min-w-[200px] max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedSession("");
                    setOpenDropdown(null);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-cream-dark transition-colors rounded-t-lg ${!selectedSession ? "bg-cream-dark font-medium" : ""
                    } text-coffee`}
                >
                  All Sessions
                </button>
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSession(s.id);
                      setOpenDropdown(null);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-cream-dark transition-colors last:rounded-b-lg ${selectedSession === s.id ? "bg-cream-dark text-espresso font-medium" : "text-coffee"
                      }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Responsible */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "responsible" ? null : "responsible")}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-cream-dark rounded-lg text-sm text-espresso hover:border-coffee-light transition-colors"
            >
              <User className="w-4 h-4 text-coffee-light" />
              {selectedResponsible || "Responsible"}
              <ChevronDown className="w-3 h-3 text-coffee-light" />
            </button>
            {openDropdown === "responsible" && (
              <div className="absolute z-20 top-full mt-1 left-0 bg-white border border-cream-dark rounded-lg shadow-lg min-w-[180px] max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedResponsible("");
                    setOpenDropdown(null);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-cream-dark transition-colors rounded-t-lg ${!selectedResponsible ? "bg-cream-dark font-medium" : ""
                    } text-coffee`}
                >
                  All
                </button>
                {uniqueResponsibles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setSelectedResponsible(r);
                      setOpenDropdown(null);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-cream-dark transition-colors last:rounded-b-lg ${selectedResponsible === r ? "bg-cream-dark text-espresso font-medium" : "text-coffee"
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === "product" ? null : "product")}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-cream-dark rounded-lg text-sm text-espresso hover:border-coffee-light transition-colors"
            >
              <Package className="w-4 h-4 text-coffee-light" />
              {selectedProduct
                ? products.find((p) => p.id === selectedProduct)?.name || "Product"
                : "Product"}
              <ChevronDown className="w-3 h-3 text-coffee-light" />
            </button>
            {openDropdown === "product" && (
              <div className="absolute z-20 top-full mt-1 left-0 bg-white border border-cream-dark rounded-lg shadow-lg min-w-[200px] max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedProduct("");
                    setOpenDropdown(null);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-cream-dark transition-colors rounded-t-lg ${!selectedProduct ? "bg-cream-dark font-medium" : ""
                    } text-coffee`}
                >
                  All Products
                </button>
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p.id);
                      setOpenDropdown(null);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-cream-dark transition-colors last:rounded-b-lg ${selectedProduct === p.id ? "bg-cream-dark text-espresso font-medium" : "text-coffee"
                      }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Buttons */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => handleExport("PDF")}
              className="flex items-center gap-1.5 px-3 py-2 bg-coffee text-cream rounded-lg text-sm hover:bg-coffee-dark transition-colors"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={() => handleExport("XLS")}
              className="flex items-center gap-1.5 px-3 py-2 bg-success text-white rounded-lg text-sm hover:opacity-90 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              XLS
            </button>
          </div>
        </div>

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-coffee/10 text-coffee rounded-full text-xs font-medium"
              >
                {f.label}
                <button
                  onClick={f.onRemove}
                  className="hover:text-danger transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Total Orders"
          value={totalOrders.toString()}
          change={ordersChange}
          icon={<ShoppingCart className="w-5 h-5 text-coffee" />}
          period={period}
        />
        <KPICard
          title="Revenue"
          value={formatCurrency(revenue)}
          change={revenueChange}
          icon={<IndianRupee className="w-5 h-5 text-success" />}
          period={period}
        />
        <KPICard
          title="Average Order Value"
          value={formatCurrency(avgOrderValue)}
          change={avgChange}
          icon={<TrendingUp className="w-5 h-5 text-info" />}
          period={period}
        />
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl border border-cream-dark p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-coffee" />
          <h2 className="text-lg font-semibold text-espresso">Sales Overview</h2>
        </div>
        {salesChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDD9C4" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#8B6F5E" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#8B6F5E" }}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                contentStyle={{
                  backgroundColor: "#FFF8F0",
                  borderColor: "#EDD9C4",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="revenue" fill="#6F4E37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-coffee-light text-sm">
            No sales data for the selected period
          </div>
        )}
      </div>

      {/* Bottom Grid: Category Pie + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Categories - Pie Chart */}
        <div className="bg-white rounded-xl border border-cream-dark p-5">
          <h2 className="text-lg font-semibold text-espresso mb-4">
            Top Selling Categories
          </h2>
          {categorySales.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categorySales}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    paddingAngle={2}
                    label={(props) => `${props.name || ""} (${((props.percent || 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                    style={{ fontSize: "11px" }}
                  >
                    {categorySales.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#FFF8F0",
                      borderColor: "#EDD9C4",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-coffee-light text-sm">
              No category data available
            </div>
          )}
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-xl border border-cream-dark p-5">
          <h2 className="text-lg font-semibold text-espresso mb-4">Top Products</h2>
          {topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cream-dark">
                    <th className="text-left py-2 px-3 text-coffee-light font-medium">
                      Product
                    </th>
                    <th className="text-right py-2 px-3 text-coffee-light font-medium">
                      Qty Sold
                    </th>
                    <th className="text-right py-2 px-3 text-coffee-light font-medium">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr
                      key={i}
                      className="border-b border-cream-dark/50 hover:bg-cream/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-espresso font-medium">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3 text-right text-coffee">
                        {p.qty}
                      </td>
                      <td className="py-2.5 px-3 text-right text-espresso font-medium">
                        {formatCurrency(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-coffee-light text-sm">
              No product data available
            </div>
          )}
        </div>
      </div>

      {/* Top Categories Table */}
      <div className="bg-white rounded-xl border border-cream-dark p-5">
        <h2 className="text-lg font-semibold text-espresso mb-4">
          Categories Revenue Breakdown
        </h2>
        {categorySales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark">
                  <th className="text-left py-2 px-3 text-coffee-light font-medium">
                    Category
                  </th>
                  <th className="text-right py-2 px-3 text-coffee-light font-medium">
                    Share
                  </th>
                  <th className="text-right py-2 px-3 text-coffee-light font-medium">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {categorySales.map((c, i) => (
                  <tr
                    key={i}
                    className="border-b border-cream-dark/50 hover:bg-cream/50 transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{
                            backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-espresso font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-coffee">
                      {c.percentage}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-espresso font-medium">
                      {formatCurrency(c.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-coffee-light text-sm">
            No category data available
          </div>
        )}
      </div>

      {/* Close dropdowns on outside click */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}

/* KPI Card Component */
function KPICard({
  title,
  value,
  change,
  icon,
  period,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  period: Period;
}) {
  const isPositive = change >= 0;
  const showChange = period !== "all";

  return (
    <div className="bg-white rounded-xl border border-cream-dark p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-coffee-light font-medium">{title}</span>
        <div className="w-9 h-9 rounded-lg bg-cream flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-espresso">{value}</div>
      {showChange ? (
        <p className={`text-xs mt-1 ${isPositive ? "text-success" : "text-danger"}`}>
          {isPositive ? "+" : ""}
          {change.toFixed(1)}% Since last period
        </p>
      ) : (
        <p className="text-xs mt-1 text-coffee-light">All time</p>
      )}
    </div>
  );
}
