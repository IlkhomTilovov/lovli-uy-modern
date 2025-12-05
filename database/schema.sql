-- =============================================
-- COMPLETE DATABASE SCHEMA - Do'kon E-Commerce
-- Oxirgi yangilanish: 2024
-- Bu fayl barcha jadvallar va RLS siyosatlarini o'z ichiga oladi
-- =============================================

-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- =============================================
-- 2. JADVALLAR (TABLES)
-- =============================================

-- 2.1 CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    sort_order INTEGER NOT NULL DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    retail_price NUMERIC NOT NULL DEFAULT 0,
    wholesale_price NUMERIC NOT NULL DEFAULT 0,
    discount_price NUMERIC,
    discount_active BOOLEAN NOT NULL DEFAULT false,
    sku TEXT NOT NULL UNIQUE,
    stock INTEGER NOT NULL DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active',
    rating NUMERIC DEFAULT 0,
    weight NUMERIC,
    size TEXT,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 USER ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- 2.4 ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    region TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    comment TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    total_price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.5 ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_moment NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    contact_person TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.7 WAREHOUSE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.warehouse_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_unit NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    batch_number TEXT,
    expiry_date TEXT,
    note TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.8 INVENTORY AUDITS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    expected_stock INTEGER NOT NULL,
    actual_stock INTEGER NOT NULL,
    difference INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    approved_by TEXT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.9 SITE CONTENT TABLE
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL UNIQUE,
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 3. HELPER FUNCTIONS
-- =============================================

-- 3.1 has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- 3.2 update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- =============================================
-- 4. TRIGGERS
-- =============================================

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_audits_updated_at
    BEFORE UPDATE ON public.inventory_audits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at
    BEFORE UPDATE ON public.site_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. RLS POLICIES
-- =============================================

-- 6.1 CATEGORIES POLICIES
CREATE POLICY "Anyone can view categories"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert categories"
    ON public.categories FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update categories"
    ON public.categories FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete categories"
    ON public.categories FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));

-- 6.2 PRODUCTS POLICIES
CREATE POLICY "Anyone can view products"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert products"
    ON public.products FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update products"
    ON public.products FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete products"
    ON public.products FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));

-- 6.3 USER ROLES POLICIES
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6.4 ORDERS POLICIES
CREATE POLICY "Anyone can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Only admins can view orders"
    ON public.orders FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update orders"
    ON public.orders FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete orders"
    ON public.orders FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));

-- 6.5 ORDER ITEMS POLICIES
CREATE POLICY "Anyone can create order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Only admins can view order items"
    ON public.order_items FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update order items"
    ON public.order_items FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete order items"
    ON public.order_items FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));

-- 6.6 SUPPLIERS POLICIES (Admin only - all operations)
CREATE POLICY "Only admins can view suppliers"
    ON public.suppliers FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert suppliers"
    ON public.suppliers FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update suppliers"
    ON public.suppliers FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete suppliers"
    ON public.suppliers FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));

-- 6.7 WAREHOUSE LOGS POLICIES (Admin only)
CREATE POLICY "Only admins can view warehouse logs"
    ON public.warehouse_logs FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert warehouse logs"
    ON public.warehouse_logs FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update warehouse logs"
    ON public.warehouse_logs FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete warehouse logs"
    ON public.warehouse_logs FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));

-- 6.8 INVENTORY AUDITS POLICIES (Admin only)
CREATE POLICY "Only admins can view inventory audits"
    ON public.inventory_audits FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert inventory audits"
    ON public.inventory_audits FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update inventory audits"
    ON public.inventory_audits FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete inventory audits"
    ON public.inventory_audits FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));

-- 6.9 SITE CONTENT POLICIES
CREATE POLICY "Anyone can view site content"
    ON public.site_content FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert site content"
    ON public.site_content FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update site content"
    ON public.site_content FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete site content"
    ON public.site_content FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 7. STORAGE
-- =============================================

-- 7.1 Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 7.2 Storage policies
CREATE POLICY "Public read access for product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- =============================================
-- ISHLATISH:
-- 1. Yangi Supabase loyihasi yarating
-- 2. SQL Editor'ga o'ting
-- 3. Bu faylni nusxalang va ishga tushiring
-- 4. Keyin seed.sql faylini ishga tushiring
-- =============================================
