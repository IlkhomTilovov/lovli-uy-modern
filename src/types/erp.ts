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
  images: string[];
  status: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

export interface WarehouseLog {
  id: string;
  productId: string;
  type: 'incoming' | 'outgoing';
  quantity: number;
  pricePerUnit: number;
  total: number;
  note: string;
  createdAt: string;
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
