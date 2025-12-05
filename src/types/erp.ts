// ERP System Types

export type UserRole = 'admin' | 'manager' | 'warehouse';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  retailPrice: number;
  wholesalePrice: number;
  discountPrice: number | null;
  discountActive: boolean;
  sku: string;
  stock: number;
  minStock: number; // Minimal zaxira
  images: string[];
  status: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface WarehouseLog {
  id: string;
  productId: string;
  type: 'incoming' | 'outgoing' | 'return' | 'adjustment';
  quantity: number;
  pricePerUnit: number;
  total: number;
  note: string;
  supplierId?: string; // Yetkazib beruvchi
  batchNumber?: string; // Partiya raqami
  expiryDate?: string; // Yaroqlilik muddati
  createdAt: string;
}

export interface InventoryAudit {
  id: string;
  productId: string;
  expectedStock: number;
  actualStock: number;
  difference: number;
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export type OrderStatus = 'new' | 'accepted' | 'preparing' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtMoment: number;
  subtotal: number;
  createdAt: string;
}

export interface SiteContent {
  id: string;
  section: string;
  data: Record<string, any>;
  updatedAt: string;
}
