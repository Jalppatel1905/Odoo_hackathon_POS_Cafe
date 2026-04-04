// ============ AUTH ============
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "staff";
  createdAt: string;
}

// ============ PRODUCTS ============
export interface ProductCategory {
  id: string;
  name: string;
  color: string;
  sequence: number;
}

export interface ProductVariant {
  id: string;
  attribute: string;
  value: string;
  unit: string;
  extraPrice: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  tax: number;
  description: string;
  variants: ProductVariant[];
  image?: string;
}

// ============ PAYMENT METHODS ============
export interface PaymentMethodConfig {
  cash: boolean;
  digital: boolean;
  upi: boolean;
  upiId: string;
}

// ============ FLOOR & TABLES ============
export interface Floor {
  id: string;
  name: string;
  posTerminal: string;
  tables: Table[];
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  active: boolean;
  floorId: string;
}

// ============ ORDERS ============
export interface OrderLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  tax: number;
  unit: string;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  sessionId: string;
  date: string;
  tableId: string;
  tableNumber: number;
  lines: OrderLine[];
  total: number;
  tax: number;
  finalTotal: number;
  status: "draft" | "paid";
  customerId?: string;
  customerName?: string;
  payments: OrderPayment[];
  kitchenStatus: "to_cook" | "preparing" | "completed";
}

export interface OrderPayment {
  id: string;
  method: "cash" | "digital" | "upi";
  amount: number;
  date: string;
}

// ============ CUSTOMERS ============
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street1: string;
    street2: string;
    city: string;
    state: string;
    country: string;
  };
  totalSales: number;
}

// ============ POS SESSION ============
export interface POSSession {
  id: string;
  name: string;
  openedAt: string;
  closedAt?: string;
  openingAmount: number;
  closingAmount: number;
  responsible: string;
  isOpen: boolean;
}
