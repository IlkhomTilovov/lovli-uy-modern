import { Category, Product, Order, OrderItem, WarehouseLog, SiteContent, User } from '@/types/erp';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

// Mock Categories
export const mockCategories: Category[] = [
  { id: '1', name: 'Tozalash vositalari', description: 'Uy tozalash uchun', status: 'active', createdAt: new Date().toISOString() },
  { id: '2', name: 'Gigiena', description: 'Shaxsiy gigiena', status: 'active', createdAt: new Date().toISOString() },
  { id: '3', name: 'Kir yuvish', description: 'Kir yuvish vositalari', status: 'active', createdAt: new Date().toISOString() },
  { id: '4', name: 'Uy-ro\'zg\'or', description: 'Uy-ro\'zg\'or buyumlari', status: 'active', createdAt: new Date().toISOString() },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Supurgi Professional',
    description: 'Yuqori sifatli professional supurgi',
    categoryId: '1',
    retailPrice: 45000,
    wholesalePrice: 35000,
    discountPrice: 38000,
    discountActive: true,
    sku: 'SPR-001',
    stock: 150,
    images: ['/placeholder.svg'],
    status: 'active',
    metaTitle: 'Professional Supurgi',
    metaDescription: 'Eng yaxshi supurgi',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Cho\'tka Universal',
    description: 'Ko\'p maqsadli cho\'tka',
    categoryId: '1',
    retailPrice: 25000,
    wholesalePrice: 18000,
    discountPrice: null,
    discountActive: false,
    sku: 'CHT-001',
    stock: 200,
    images: ['/placeholder.svg'],
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Valler Premium',
    description: 'Premium sifatli valler',
    categoryId: '4',
    retailPrice: 85000,
    wholesalePrice: 70000,
    discountPrice: 75000,
    discountActive: true,
    sku: 'VLR-001',
    stock: 75,
    images: ['/placeholder.svg'],
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Pichoq Set',
    description: 'Oshxona pichoqlari to\'plami',
    categoryId: '4',
    retailPrice: 120000,
    wholesalePrice: 95000,
    discountPrice: null,
    discountActive: false,
    sku: 'PCH-001',
    stock: 50,
    images: ['/placeholder.svg'],
    status: 'active',
    createdAt: new Date().toISOString()
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: '1',
    customerName: 'Alisher Navoiy',
    phone: '+998901234567',
    address: 'Toshkent, Chilonzor tumani',
    totalPrice: 158000,
    status: 'new',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    customerName: 'Bobur Mirzo',
    phone: '+998907654321',
    address: 'Samarqand, Registon ko\'chasi',
    totalPrice: 245000,
    status: 'preparing',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Mock Order Items
export const mockOrderItems: OrderItem[] = [
  { id: '1', orderId: '1', productId: '1', quantity: 2, priceAtMoment: 38000, subtotal: 76000, createdAt: new Date().toISOString() },
  { id: '2', orderId: '1', productId: '2', quantity: 1, priceAtMoment: 25000, subtotal: 25000, createdAt: new Date().toISOString() },
  { id: '3', orderId: '2', productId: '3', quantity: 2, priceAtMoment: 75000, subtotal: 150000, createdAt: new Date().toISOString() },
];

// Mock Warehouse Logs
export const mockWarehouseLogs: WarehouseLog[] = [
  { id: '1', productId: '1', type: 'incoming', quantity: 100, pricePerUnit: 30000, total: 3000000, note: 'Boshlang\'ich kirim', createdAt: new Date().toISOString() },
  { id: '2', productId: '2', type: 'incoming', quantity: 200, pricePerUnit: 15000, total: 3000000, note: 'Yangi partiya', createdAt: new Date().toISOString() },
  { id: '3', productId: '1', type: 'outgoing', quantity: 2, pricePerUnit: 38000, total: 76000, note: 'Buyurtma #1', createdAt: new Date().toISOString() },
];

// Mock Site Content
export const mockSiteContent: SiteContent[] = [
  {
    id: '1',
    section: 'home_banner',
    data: {
      title: 'Maishiy kimyo mahsulotlari ishlab chiqaruvchisi',
      subtitle: 'Vallerlar, cho\'tkalar, pichoqlar, supurgilar va har kuni kerak bo\'ladigan sifatli uskunalar.',
      buttonText: 'Katalogni ko\'rish'
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    section: 'about_text',
    data: {
      title: 'Biz haqimizda',
      content: 'Kompaniyamiz 2010 yildan beri sifatli maishiy mahsulotlar ishlab chiqaradi.'
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    section: 'contact_info',
    data: {
      phone: '+998 71 123 45 67',
      email: 'info@example.com',
      address: 'Toshkent shahri, Yunusobod tumani'
    },
    updatedAt: new Date().toISOString()
  }
];
