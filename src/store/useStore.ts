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

interface AppState {
  // Auth
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;

  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProducts: (ids: string[]) => void;

  // Categories
  categories: ProductCategory[];
  addCategory: (category: ProductCategory) => void;
  updateCategory: (id: string, category: Partial<ProductCategory>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: ProductCategory[]) => void;

  // Payment Methods
  paymentMethods: PaymentMethodConfig;
  updatePaymentMethods: (config: Partial<PaymentMethodConfig>) => void;

  // Floors & Tables
  floors: Floor[];
  addFloor: (floor: Floor) => void;
  updateFloor: (id: string, floor: Partial<Floor>) => void;
  deleteFloor: (id: string) => void;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrders: (ids: string[]) => void;

  // Customers
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;

  // POS Sessions
  sessions: POSSession[];
  activeSession: POSSession | null;
  openSession: () => void;
  closeSession: () => void;
}

const defaultPaymentMethods: PaymentMethodConfig = {
  cash: true,
  digital: true,
  upi: false,
  upiId: "",
};

const defaultCategories: ProductCategory[] = [
  { id: "cat-1", name: "Quick Bites", color: "#ffd43b", sequence: 1 },
  { id: "cat-2", name: "Drinks", color: "#74c0fc", sequence: 2 },
  { id: "cat-3", name: "Desert", color: "#f783ac", sequence: 3 },
  { id: "cat-4", name: "Food", color: "#69db7c", sequence: 4 },
];

const defaultProducts: Product[] = [
  { id: "p1", name: "Burger", category: "cat-1", price: 15, unit: "Unit", tax: 5, description: "Classic beef burger", variants: [], image: "" },
  { id: "p2", name: "Pizza", category: "cat-4", price: 250, unit: "Unit", tax: 5, description: "Cheese pizza", variants: [], image: "" },
  { id: "p3", name: "Maggie", category: "cat-1", price: 70, unit: "Unit", tax: 5, description: "Instant noodles", variants: [], image: "" },
  { id: "p4", name: "Fries", category: "cat-1", price: 120, unit: "Unit", tax: 5, description: "French fries", variants: [], image: "" },
  { id: "p5", name: "Sandwich", category: "cat-1", price: 150, unit: "Unit", tax: 5, description: "Club sandwich", variants: [], image: "" },
  { id: "p6", name: "Coffee", category: "cat-2", price: 50, unit: "Unit", tax: 5, description: "Hot coffee", variants: [], image: "" },
  { id: "p7", name: "Tea", category: "cat-2", price: 35, unit: "Unit", tax: 5, description: "Masala tea", variants: [], image: "" },
  { id: "p8", name: "Diet Coke", category: "cat-2", price: 70, unit: "Unit", tax: 5, description: "Diet coke can", variants: [], image: "" },
  { id: "p9", name: "Fanta", category: "cat-2", price: 60, unit: "Unit", tax: 5, description: "Fanta orange", variants: [], image: "" },
  { id: "p10", name: "Milkshake", category: "cat-2", price: 140, unit: "Unit", tax: 5, description: "Chocolate milkshake", variants: [], image: "" },
  { id: "p11", name: "Pasta", category: "cat-4", price: 200, unit: "Unit", tax: 5, description: "Penne pasta", variants: [], image: "" },
  { id: "p12", name: "Green Tea", category: "cat-2", price: 65, unit: "Unit", tax: 5, description: "Japanese green tea", variants: [], image: "" },
  { id: "p13", name: "Water", category: "cat-2", price: 30, unit: "Unit", tax: 5, description: "Mineral water", variants: [], image: "" },
];

const defaultFloors: Floor[] = [
  {
    id: "floor-1",
    name: "Ground Floor",
    posTerminal: "SipSync",
    tables: [
      { id: "t1", number: 1, seats: 4, active: true, floorId: "floor-1" },
      { id: "t2", number: 2, seats: 2, active: true, floorId: "floor-1" },
      { id: "t3", number: 3, seats: 6, active: true, floorId: "floor-1" },
      { id: "t4", number: 4, seats: 4, active: true, floorId: "floor-1" },
      { id: "t5", number: 5, seats: 8, active: true, floorId: "floor-1" },
    ],
  },
];

const generateId = () => Math.random().toString(36).substring(2, 10);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      users: [],
      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },
      signup: (name, email, password) => {
        const exists = get().users.find((u) => u.email === email);
        if (exists) return false;
        const user: User = {
          id: generateId(),
          name,
          email,
          password,
          role: "admin",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ users: [...s.users, user], currentUser: user }));
        return true;
      },
      logout: () => set({ currentUser: null, activeSession: null }),

      // Products
      products: defaultProducts,
      addProduct: (product) =>
        set((s) => ({ products: [...s.products, product] })),
      updateProduct: (id, data) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),
      deleteProducts: (ids) =>
        set((s) => ({
          products: s.products.filter((p) => !ids.includes(p.id)),
        })),

      // Categories
      categories: defaultCategories,
      addCategory: (category) =>
        set((s) => ({ categories: [...s.categories, category] })),
      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),
      reorderCategories: (categories) => set({ categories }),

      // Payment Methods
      paymentMethods: defaultPaymentMethods,
      updatePaymentMethods: (config) =>
        set((s) => ({
          paymentMethods: { ...s.paymentMethods, ...config },
        })),

      // Floors & Tables
      floors: defaultFloors,
      addFloor: (floor) => set((s) => ({ floors: [...s.floors, floor] })),
      updateFloor: (id, data) =>
        set((s) => ({
          floors: s.floors.map((f) =>
            f.id === id ? { ...f, ...data } : f
          ),
        })),
      deleteFloor: (id) =>
        set((s) => ({ floors: s.floors.filter((f) => f.id !== id) })),

      // Orders
      orders: [],
      addOrder: (order) => set((s) => ({ orders: [...s.orders, order] })),
      updateOrder: (id, data) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, ...data } : o
          ),
        })),
      deleteOrders: (ids) =>
        set((s) => ({
          orders: s.orders.filter((o) => !ids.includes(o.id)),
        })),

      // Customers
      customers: [
        {
          id: "cust-1",
          name: "Eric",
          email: "eric@odoo.com",
          phone: "+91 9898989898",
          address: { street1: "", street2: "", city: "", state: "", country: "" },
          totalSales: 2000,
        },
        {
          id: "cust-2",
          name: "Smith",
          email: "smith@odoo.com",
          phone: "+91 8787878787",
          address: { street1: "", street2: "", city: "", state: "", country: "" },
          totalSales: 1500,
        },
      ],
      addCustomer: (customer) =>
        set((s) => ({ customers: [...s.customers, customer] })),
      updateCustomer: (id, data) =>
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      // POS Sessions
      sessions: [],
      activeSession: null,
      openSession: () => {
        const user = get().currentUser;
        if (!user) return;
        const session: POSSession = {
          id: generateId(),
          name: `Session ${get().sessions.length + 1}`,
          openedAt: new Date().toISOString(),
          openingAmount: 0,
          closingAmount: 0,
          responsible: user.name,
          isOpen: true,
        };
        set((s) => ({
          sessions: [...s.sessions, session],
          activeSession: session,
        }));
      },
      closeSession: () => {
        const session = get().activeSession;
        if (!session) return;
        const sessionOrders = get().orders.filter(
          (o) => o.sessionId === session.id
        );
        const closingAmount = sessionOrders.reduce(
          (sum, o) => sum + o.finalTotal,
          0
        );
        set((s) => ({
          activeSession: null,
          sessions: s.sessions.map((ses) =>
            ses.id === session.id
              ? {
                  ...ses,
                  isOpen: false,
                  closedAt: new Date().toISOString(),
                  closingAmount,
                }
              : ses
          ),
        }));
      },
    }),
    {
      name: "odoo-pos-cafe-store",
    }
  )
);
