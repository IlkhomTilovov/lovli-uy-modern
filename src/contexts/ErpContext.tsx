import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, Product, Order, OrderItem, WarehouseLog, SiteContent, User, UserRole } from '@/types/erp';
import { mockCategories, mockProducts, mockOrders, mockOrderItems, mockWarehouseLogs, mockSiteContent, mockUsers } from '@/data/mockErpData';

interface ErpContextType {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Orders
  orders: Order[];
  orderItems: OrderItem[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>, items: Omit<OrderItem, 'id' | 'orderId' | 'createdAt'>[]) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  
  // Warehouse
  warehouseLogs: WarehouseLog[];
  addWarehouseLog: (log: Omit<WarehouseLog, 'id' | 'createdAt' | 'total'>) => void;
  
  // Site Content
  siteContent: SiteContent[];
  updateSiteContent: (section: string, data: Record<string, any>) => void;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

const ErpContext = createContext<ErpContextType | undefined>(undefined);

const STORAGE_KEY = 'erp_data';

interface StoredData {
  categories: Category[];
  products: Product[];
  orders: Order[];
  orderItems: OrderItem[];
  warehouseLogs: WarehouseLog[];
  siteContent: SiteContent[];
  users: User[];
}

export const ErpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(mockOrderItems);
  const [warehouseLogs, setWarehouseLogs] = useState<WarehouseLog[]>(mockWarehouseLogs);
  const [siteContent, setSiteContent] = useState<SiteContent[]>(mockSiteContent);
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: StoredData = JSON.parse(stored);
      setCategories(data.categories || mockCategories);
      setProducts(data.products || mockProducts);
      setOrders(data.orders || mockOrders);
      setOrderItems(data.orderItems || mockOrderItems);
      setWarehouseLogs(data.warehouseLogs || mockWarehouseLogs);
      setSiteContent(data.siteContent || mockSiteContent);
      setUsers(data.users || mockUsers);
    }
    
    // Check for logged in user
    const loggedUser = localStorage.getItem('erp_current_user');
    if (loggedUser) {
      setCurrentUser(JSON.parse(loggedUser));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data: StoredData = { categories, products, orders, orderItems, warehouseLogs, siteContent, users };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [categories, products, orders, orderItems, warehouseLogs, siteContent, users]);

  // Auth
  const login = (email: string, password: string): boolean => {
    // Demo login - admin@example.com with any password
    const user = users.find(u => u.email === email);
    if (user || email === 'admin@example.com') {
      const loggedUser = user || { id: '1', email, name: 'Admin', role: 'admin' as UserRole, createdAt: new Date().toISOString() };
      setCurrentUser(loggedUser);
      localStorage.setItem('erp_current_user', JSON.stringify(loggedUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('erp_current_user');
  };

  // Categories
  const addCategory = (category: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = { ...category, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...category } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Products
  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = { ...product, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...product } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Orders
  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>, items: Omit<OrderItem, 'id' | 'orderId' | 'createdAt'>[]) => {
    const orderId = crypto.randomUUID();
    const newOrder: Order = { ...order, id: orderId, createdAt: new Date().toISOString() };
    setOrders(prev => [...prev, newOrder]);

    // Add order items
    const newItems: OrderItem[] = items.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      orderId,
      createdAt: new Date().toISOString()
    }));
    setOrderItems(prev => [...prev, ...newItems]);

    // Create warehouse outgoing logs and update stock
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        // Add warehouse log
        const log: WarehouseLog = {
          id: crypto.randomUUID(),
          productId: item.productId,
          type: 'outgoing',
          quantity: item.quantity,
          pricePerUnit: item.priceAtMoment,
          total: item.quantity * item.priceAtMoment,
          note: `Buyurtma #${orderId.slice(0, 8)}`,
          createdAt: new Date().toISOString()
        };
        setWarehouseLogs(prev => [...prev, log]);

        // Update product stock
        updateProduct(item.productId, { stock: product.stock - item.quantity });
      }
    });
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  // Warehouse
  const addWarehouseLog = (log: Omit<WarehouseLog, 'id' | 'createdAt' | 'total'>) => {
    const total = log.quantity * log.pricePerUnit;
    const newLog: WarehouseLog = { ...log, total, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setWarehouseLogs(prev => [...prev, newLog]);

    // Update product stock
    const product = products.find(p => p.id === log.productId);
    if (product) {
      const newStock = log.type === 'incoming' 
        ? product.stock + log.quantity 
        : product.stock - log.quantity;
      updateProduct(log.productId, { stock: Math.max(0, newStock) });
    }
  };

  // Site Content
  const updateSiteContent = (section: string, data: Record<string, any>) => {
    setSiteContent(prev => {
      const existing = prev.find(c => c.section === section);
      if (existing) {
        return prev.map(c => c.section === section ? { ...c, data, updatedAt: new Date().toISOString() } : c);
      }
      return [...prev, { id: crypto.randomUUID(), section, data, updatedAt: new Date().toISOString() }];
    });
  };

  // Users
  const addUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = { ...user, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, user: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...user } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <ErpContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      login,
      logout,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      orders,
      orderItems,
      addOrder,
      updateOrderStatus,
      warehouseLogs,
      addWarehouseLog,
      siteContent,
      updateSiteContent,
      users,
      addUser,
      updateUser,
      deleteUser,
    }}>
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within ErpProvider');
  }
  return context;
};
