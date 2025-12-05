-- =============================================
-- DATABASE OPTIMIZATION FOR 25,000+ RECORDS
-- Qidiruv va filtrlarni tezlashtirish uchun indexlar
-- =============================================

-- 1. PRODUCTS TABLE INDEXES

-- Kategoriya va status bo'yicha filtr (eng ko'p ishlatiladigan)
CREATE INDEX IF NOT EXISTS idx_products_category_status 
ON public.products(category_id, status);

-- Narx bo'yicha saralash
CREATE INDEX IF NOT EXISTS idx_products_retail_price 
ON public.products(retail_price);

-- Chegirma mahsulotlarni topish
CREATE INDEX IF NOT EXISTS idx_products_discount 
ON public.products(discount_active, discount_price) 
WHERE discount_active = true;

-- SKU bo'yicha qidiruv (unique allaqachon bor, lekin tezlashtirish uchun)
CREATE INDEX IF NOT EXISTS idx_products_sku_search 
ON public.products(sku text_pattern_ops);

-- Stock bo'yicha filtr (kam qolgan mahsulotlar)
CREATE INDEX IF NOT EXISTS idx_products_stock 
ON public.products(stock) 
WHERE stock < 10;

-- Yangi mahsulotlar (created_at bo'yicha)
CREATE INDEX IF NOT EXISTS idx_products_created 
ON public.products(created_at DESC);

-- Full-text search uchun (nomi bo'yicha qidiruv)
CREATE INDEX IF NOT EXISTS idx_products_title_search 
ON public.products USING gin(to_tsvector('simple', title));

-- 2. ORDERS TABLE INDEXES

-- Status bo'yicha filtr
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON public.orders(status);

-- Sana bo'yicha saralash
CREATE INDEX IF NOT EXISTS idx_orders_created 
ON public.orders(created_at DESC);

-- Telefon bo'yicha qidiruv
CREATE INDEX IF NOT EXISTS idx_orders_phone 
ON public.orders(phone);

-- Status + sana kombinatsiyasi
CREATE INDEX IF NOT EXISTS idx_orders_status_date 
ON public.orders(status, created_at DESC);

-- 3. ORDER ITEMS TABLE INDEXES

-- Order ID bo'yicha (foreign key)
CREATE INDEX IF NOT EXISTS idx_order_items_order 
ON public.order_items(order_id);

-- Product ID bo'yicha
CREATE INDEX IF NOT EXISTS idx_order_items_product 
ON public.order_items(product_id);

-- 4. CATEGORIES TABLE INDEXES

-- Status bo'yicha aktiv kategoriyalar
CREATE INDEX IF NOT EXISTS idx_categories_status 
ON public.categories(status) 
WHERE status = 'active';

-- Sort order bo'yicha
CREATE INDEX IF NOT EXISTS idx_categories_sort 
ON public.categories(sort_order);

-- 5. WAREHOUSE LOGS INDEXES

-- Mahsulot bo'yicha
CREATE INDEX IF NOT EXISTS idx_warehouse_product 
ON public.warehouse_logs(product_id);

-- Sana bo'yicha
CREATE INDEX IF NOT EXISTS idx_warehouse_created 
ON public.warehouse_logs(created_at DESC);

-- Type bo'yicha (kirim/chiqim)
CREATE INDEX IF NOT EXISTS idx_warehouse_type 
ON public.warehouse_logs(type);

-- 6. SUPPLIERS TABLE INDEX

-- Status bo'yicha
CREATE INDEX IF NOT EXISTS idx_suppliers_status 
ON public.suppliers(status);

-- =============================================
-- ANALYZE - statistikani yangilash
-- =============================================
ANALYZE public.products;
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.categories;
ANALYZE public.warehouse_logs;
ANALYZE public.suppliers;