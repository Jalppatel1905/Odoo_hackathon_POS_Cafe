"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User,
  Product,
  ProductCategory,
  PaymentMethodConfig,
  Floor,
  Order,
  Customer,
  POSSession,
} from "@/types";

// Helper for API calls
const api = async (url: string, method = "GET", body?: unknown) => {
  const opts: RequestInit = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
};

interface AppState {
  // Auth
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Data loading
  loaded: boolean;
  loadData: () => Promise<void>;

  // Products
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProducts: (ids: string[]) => Promise<void>;

  // Categories
  categories: ProductCategory[];
  addCategory: (category: ProductCategory) => Promise<void>;
  updateCategory: (id: string, category: Partial<ProductCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categories: ProductCategory[]) => Promise<void>;

  // Payment Methods
  paymentMethods: PaymentMethodConfig;
  updatePaymentMethods: (config: Partial<PaymentMethodConfig>) => Promise<void>;

  // Floors & Tables
  floors: Floor[];
  addFloor: (floor: Floor) => Promise<void>;
  updateFloor: (id: string, floor: Partial<Floor>) => Promise<void>;
  deleteFloor: (id: string) => Promise<void>;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  deleteOrders: (ids: string[]) => Promise<void>;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;

  // POS Sessions
  sessions: POSSession[];
  activeSession: POSSession | null;
  openSession: () => Promise<void>;
  closeSession: () => Promise<void>;
}

const defaultPaymentMethods: PaymentMethodConfig = {
  cash: true,
  digital: true,
  upi: false,
  upiId: "",
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      users: [],
      login: async (email, password) => {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) return false;
          const user = await res.json();
          set({ currentUser: user });
          return true;
        } catch {
          return false;
        }
      },
      signup: async (name, email, password) => {
        try {
          const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });
          if (!res.ok) return false;
          const user = await res.json();
          set({ currentUser: user });
          return true;
        } catch {
          return false;
        }
      },
      logout: () => set({ currentUser: null, activeSession: null }),

      // Data loading from DB
      loaded: false,
      loadData: async () => {
        try {
          const [products, categories, paymentMethods, floors, orders, customers, sessions] =
            await Promise.all([
              api("/api/products"),
              api("/api/categories"),
              api("/api/payment-methods"),
              api("/api/floors"),
              api("/api/orders"),
              api("/api/customers"),
              api("/api/sessions"),
            ]);

          // Map DB products to app format
          const mappedProducts: Product[] = (products || []).map((p: Record<string, unknown>) => ({
            id: p.id,
            name: p.name,
            category: p.categoryId,
            price: p.price,
            unit: p.unit,
            tax: p.tax,
            description: p.description,
            variants: (p.variants as Record<string, unknown>[]) || [],
            image: p.image || "",
          }));

          // Map DB floors to app format
          const mappedFloors: Floor[] = (floors || []).map((f: Record<string, unknown>) => ({
            id: f.id,
            name: f.name,
            posTerminal: f.posTerminal,
            tables: ((f.tables as Record<string, unknown>[]) || []).map((t: Record<string, unknown>) => ({
              id: t.id,
              number: t.number,
              seats: t.seats,
              active: t.active,
              floorId: t.floorId,
            })),
          }));

          // Map DB orders to app format
          const mappedOrders: Order[] = (orders || []).map((o: Record<string, unknown>) => ({
            id: o.id,
            orderNo: o.orderNo,
            sessionId: o.sessionId,
            date: o.date,
            tableId: o.tableId,
            tableNumber: o.tableNumber,
            lines: (o.lines as Record<string, unknown>[]) || [],
            total: o.total,
            tax: o.tax,
            finalTotal: o.finalTotal,
            status: o.status,
            customerId: o.customerId,
            customerName: o.customerName,
            payments: (o.payments as Record<string, unknown>[]) || [],
            kitchenStatus: o.kitchenStatus,
          }));

          // Map customers
          const mappedCustomers: Customer[] = (customers || []).map((c: Record<string, unknown>) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            address: {
              street1: c.street1 || "",
              street2: c.street2 || "",
              city: c.city || "",
              state: c.state || "",
              country: c.country || "",
            },
            totalSales: c.totalSales,
          }));

          set({
            products: mappedProducts,
            categories: categories || [],
            paymentMethods: paymentMethods || defaultPaymentMethods,
            floors: mappedFloors,
            orders: mappedOrders,
            customers: mappedCustomers,
            sessions: sessions || [],
            loaded: true,
          });
        } catch (e) {
          console.error("Failed to load data:", e);
          set({ loaded: true });
        }
      },

      // Products
      products: [],
      addProduct: async (product) => {
        const dbProduct = {
          name: product.name,
          categoryId: product.category,
          price: product.price,
          unit: product.unit,
          tax: product.tax,
          description: product.description,
          image: product.image,
          variants: product.variants,
        };
        const created = await api("/api/products", "POST", dbProduct);
        const mapped: Product = {
          id: created.id,
          name: created.name,
          category: created.categoryId,
          price: created.price,
          unit: created.unit,
          tax: created.tax,
          description: created.description,
          variants: created.variants || [],
          image: created.image || "",
        };
        set((s) => ({ products: [...s.products, mapped] }));
      },
      updateProduct: async (id, data) => {
        const dbData: Record<string, unknown> = { id };
        if (data.name !== undefined) dbData.name = data.name;
        if (data.category !== undefined) dbData.categoryId = data.category;
        if (data.price !== undefined) dbData.price = data.price;
        if (data.unit !== undefined) dbData.unit = data.unit;
        if (data.tax !== undefined) dbData.tax = data.tax;
        if (data.description !== undefined) dbData.description = data.description;
        if (data.variants !== undefined) dbData.variants = data.variants;
        await api("/api/products", "PUT", dbData);
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }));
      },
      deleteProducts: async (ids) => {
        await api("/api/products", "DELETE", { ids });
        set((s) => ({ products: s.products.filter((p) => !ids.includes(p.id)) }));
      },

      // Categories
      categories: [],
      addCategory: async (category) => {
        await api("/api/categories", "POST", category);
        set((s) => ({ categories: [...s.categories, category] }));
      },
      updateCategory: async (id, data) => {
        await api("/api/categories", "PUT", { id, ...data });
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
      },
      deleteCategory: async (id) => {
        await api("/api/categories", "DELETE", { id });
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
      },
      reorderCategories: async (categories) => {
        await api("/api/categories", "PUT", categories);
        set({ categories });
      },

      // Payment Methods
      paymentMethods: defaultPaymentMethods,
      updatePaymentMethods: async (config) => {
        await api("/api/payment-methods", "PUT", config);
        set((s) => ({ paymentMethods: { ...s.paymentMethods, ...config } }));
      },

      // Floors & Tables
      floors: [],
      addFloor: async (floor) => {
        const created = await api("/api/floors", "POST", {
          id: floor.id,
          name: floor.name,
          posTerminal: floor.posTerminal,
          tables: floor.tables,
        });
        set((s) => ({ floors: [...s.floors, { ...floor, id: created.id }] }));
      },
      updateFloor: async (id, data) => {
        await api("/api/floors", "PUT", { id, ...data });
        set((s) => ({
          floors: s.floors.map((f) => (f.id === id ? { ...f, ...data } : f)),
        }));
      },
      deleteFloor: async (id) => {
        await api("/api/floors", "DELETE", { id });
        set((s) => ({ floors: s.floors.filter((f) => f.id !== id) }));
      },

      // Orders
      orders: [],
      addOrder: async (order) => {
        const dbOrder = {
          orderNo: order.orderNo,
          sessionId: order.sessionId || null,
          tableId: order.tableId,
          tableNumber: order.tableNumber,
          total: order.total,
          tax: order.tax,
          finalTotal: order.finalTotal,
          status: order.status,
          customerId: order.customerId || null,
          customerName: order.customerName,
          kitchenStatus: order.kitchenStatus,
          lines: order.lines.map((l) => ({
            productId: l.productId,
            productName: l.productName,
            quantity: l.quantity,
            price: l.price,
            tax: l.tax,
            unit: l.unit,
            subtotal: l.subtotal,
            notes: l.notes || "",
          })),
          payments: order.payments.map((p) => ({
            method: p.method,
            amount: p.amount,
          })),
        };
        const created = await api("/api/orders", "POST", dbOrder);
        set((s) => ({ orders: [...s.orders, { ...order, id: created.id }] }));
      },
      updateOrder: async (id, data) => {
        await api("/api/orders", "PUT", { id, ...data });
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
        }));
      },
      deleteOrders: async (ids) => {
        await api("/api/orders", "DELETE", { ids });
        set((s) => ({ orders: s.orders.filter((o) => !ids.includes(o.id)) }));
      },

      // Customers
      customers: [],
      addCustomer: async (customer) => {
        const dbCustomer = {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          street1: customer.address.street1,
          street2: customer.address.street2,
          city: customer.address.city,
          state: customer.address.state,
          country: customer.address.country,
          totalSales: customer.totalSales,
        };
        const created = await api("/api/customers", "POST", dbCustomer);
        set((s) => ({ customers: [...s.customers, { ...customer, id: created.id }] }));
      },
      updateCustomer: async (id, data) => {
        const dbData: Record<string, unknown> = { id };
        if (data.name !== undefined) dbData.name = data.name;
        if (data.email !== undefined) dbData.email = data.email;
        if (data.phone !== undefined) dbData.phone = data.phone;
        if (data.address) {
          dbData.street1 = data.address.street1;
          dbData.street2 = data.address.street2;
          dbData.city = data.address.city;
          dbData.state = data.address.state;
          dbData.country = data.address.country;
        }
        await api("/api/customers", "PUT", dbData);
        set((s) => ({
          customers: s.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
      },

      // POS Sessions
      sessions: [],
      activeSession: null,
      openSession: async () => {
        const user = get().currentUser;
        if (!user) return;
        const sessionData = {
          name: `Session ${get().sessions.length + 1}`,
          responsibleId: user.id,
          openingAmount: 0,
          isOpen: true,
        };
        const session = await api("/api/sessions", "POST", sessionData);
        const mapped: POSSession = {
          id: session.id,
          name: session.name,
          openedAt: session.openedAt,
          openingAmount: session.openingAmount,
          closingAmount: 0,
          responsible: user.name,
          isOpen: true,
        };
        set((s) => ({
          sessions: [...s.sessions, mapped],
          activeSession: mapped,
        }));
      },
      closeSession: async () => {
        const session = get().activeSession;
        if (!session) return;
        const sessionOrders = get().orders.filter((o) => o.sessionId === session.id);
        const closingAmount = sessionOrders.reduce((sum, o) => sum + o.finalTotal, 0);
        await api("/api/sessions", "PUT", {
          id: session.id,
          isOpen: false,
          closedAt: new Date().toISOString(),
          closingAmount,
        });
        set((s) => ({
          activeSession: null,
          sessions: s.sessions.map((ses) =>
            ses.id === session.id
              ? { ...ses, isOpen: false, closedAt: new Date().toISOString(), closingAmount }
              : ses
          ),
        }));
      },
    }),
    {
      name: "odoo-pos-cafe-store",
      partialize: (state) => ({
        currentUser: state.currentUser,
        activeSession: state.activeSession,
      }),
    }
  )
);
