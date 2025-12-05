import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, Product, Order, OrderItem, WarehouseLog, SiteContent, User, UserRole, Supplier, InventoryAudit } from '@/types/erp';
import { mockCategories, mockProducts, mockOrders, mockOrderItems, mockWarehouseLogs, mockSiteContent, mockUsers, mockSuppliers, mockInventoryAudits } from '@/data/mockErpData';

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
  
  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // Warehouse
  warehouseLogs: WarehouseLog[];
  addWarehouseLog: (log: Omit<WarehouseLog, 'id' | 'createdAt' | 'total'>) => void;
  
  // Inventory Audits
  inventoryAudits: InventoryAudit[];
  addInventoryAudit: (audit: Omit<InventoryAudit, 'id' | 'createdAt'>) => void;
  updateInventoryAudit: (id: string, audit: Partial<InventoryAudit>) => void;
  approveInventoryAudit: (id: string, approvedBy: string) => void;
  
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
  suppliers: Supplier[];
  inventoryAudits: InventoryAudit[];
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
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [inventoryAudits, setInventoryAudits] = useState<InventoryAudit[]>(mockInventoryAudits);

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
      setSuppliers(data.suppliers || mockSuppliers);
      setInventoryAudits(data.inventoryAudits || mockInventoryAudits);
    }
    
    // Check for logged in user
    const loggedUser = localStorage.getItem('erp_current_user');
    if (loggedUser) {
      setCurrentUser(JSON.parse(loggedUser));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data: StoredData = { categories, products, orders, orderItems, warehouseLogs, siteContent, users, suppliers, inventoryAudits };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [categories, products, orders, orderItems, warehouseLogs, siteContent, users, suppliers, inventoryAudits]);

  // Auth - Note: This is a simplified mock auth for demo purposes only.
  // In production, use Supabase Auth (AuthContext) for all authentication.
  const login = (email: string, password: string): boolean => {
    // Find user by email AND verify password exists (basic validation)
    const user = users.find(u => u.email === email);
    if (user && password && password.length >= 6) {
      setCurrentUser(user);
      localStorage.setItem('erp_current_user', JSON.stringify(user));
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

  // Suppliers
  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = { ...supplier, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, supplier: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...supplier } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // Orders
  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>, items: Omit<OrderItem, 'id' | 'orderId' | 'createdAt'>[]) => {
    const orderId = crypto.randomUUID();
    const newOrder: Order = { ...order, id: orderId, createdAt: new Date().toISOString() };
    setOrders(prev => [...prev, newOrder]);

    const newItems: OrderItem[] = items.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      orderId,
      createdAt: new Date().toISOString()
    }));
    setOrderItems(prev => [...prev, ...newItems]);

    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
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

    const product = products.find(p => p.id === log.productId);
    if (product) {
      let newStock = product.stock;
      if (log.type === 'incoming' || log.type === 'return') {
        newStock = product.stock + log.quantity;
      } else if (log.type === 'outgoing') {
        newStock = product.stock - log.quantity;
      } else if (log.type === 'adjustment') {
        // Adjustment can be positive or negative based on quantity sign
        newStock = product.stock + log.quantity;
      }
      updateProduct(log.productId, { stock: Math.max(0, newStock) });
    }
  };

  // Inventory Audits
  const addInventoryAudit = (audit: Omit<InventoryAudit, 'id' | 'createdAt'>) => {
    const newAudit: InventoryAudit = { ...audit, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setInventoryAudits(prev => [...prev, newAudit]);
  };

  const updateInventoryAudit = (id: string, audit: Partial<InventoryAudit>) => {
    setInventoryAudits(prev => prev.map(a => a.id === id ? { ...a, ...audit } : a));
  };

  const approveInventoryAudit = (id: string, approvedBy: string) => {
    const audit = inventoryAudits.find(a => a.id === id);
    if (audit && audit.status === 'pending') {
      // Update audit status
      setInventoryAudits(prev => prev.map(a => 
        a.id === id 
          ? { ...a, status: 'approved', approvedAt: new Date().toISOString(), approvedBy } 
          : a
      ));
      
      // If there's a difference, create adjustment log and update stock
      if (audit.difference !== 0) {
        const product = products.find(p => p.id === audit.productId);
        if (product) {
          const adjustmentLog: WarehouseLog = {
            id: crypto.randomUUID(),
            productId: audit.productId,
            type: 'adjustment',
            quantity: audit.difference,
            pricePerUnit: 0,
            total: 0,
            note: `Inventarizatsiya tuzatish: ${audit.note}`,
            createdAt: new Date().toISOString()
          };
          setWarehouseLogs(prev => [...prev, adjustmentLog]);
          updateProduct(audit.productId, { stock: audit.actualStock });
        }
      }
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
      suppliers,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      warehouseLogs,
      addWarehouseLog,
      inventoryAudits,
      addInventoryAudit,
      updateInventoryAudit,
      approveInventoryAudit,
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
