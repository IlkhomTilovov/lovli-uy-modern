-- =============================================
-- DATABASE SEED FILE - Do'kon E-Commerce
-- Loyihani boshqa serverga o'tkazishda ishlatiladi
-- =============================================

-- 1. KATEGORIYALAR
INSERT INTO public.categories (name, slug, description, image, status, sort_order) VALUES
('Tozalash vositalari', 'tozalash', 'Uy tozalash uchun barcha kerakli vositalar', NULL, 'active', 1),
('Kir yuvish', 'kir-yuvish', 'Kir yuvish vositalari va aksessuarlari', NULL, 'active', 2),
('Oshxona jihozlari', 'oshxona', 'Oshxona uchun foydali jihozlar', NULL, 'active', 3),
('Shaxsiy gigiena', 'gigiena', 'Shaxsiy gigiena vositalari', NULL, 'active', 4)
ON CONFLICT (slug) DO NOTHING;

-- 2. MAHSULOTLAR (kategoriya id larini olish uchun subquery ishlatamiz)
INSERT INTO public.products (title, description, category_id, retail_price, wholesale_price, discount_price, discount_active, sku, stock, images, status) 
SELECT 
    'Premium Supurgi',
    'Yuqori sifatli plastik supurgi',
    c.id,
    35000,
    28000,
    30000,
    true,
    'SUP-001',
    100,
    ARRAY[]::TEXT[],
    'active'
FROM public.categories c WHERE c.slug = 'tozalash'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (title, description, category_id, retail_price, wholesale_price, discount_price, discount_active, sku, stock, images, status) 
SELECT 
    'Pol yuvish shvabra',
    'Mikrofiber boshli shvabra',
    c.id,
    55000,
    45000,
    NULL,
    false,
    'SHV-001',
    75,
    ARRAY[]::TEXT[],
    'active'
FROM public.categories c WHERE c.slug = 'tozalash'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (title, description, category_id, retail_price, wholesale_price, discount_price, discount_active, sku, stock, images, status) 
SELECT 
    'Kir yuvish kukuni 3kg',
    'Avtomatik mashinalar uchun',
    c.id,
    85000,
    70000,
    75000,
    true,
    'KYK-001',
    200,
    ARRAY[]::TEXT[],
    'active'
FROM public.categories c WHERE c.slug = 'kir-yuvish'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (title, description, category_id, retail_price, wholesale_price, discount_price, discount_active, sku, stock, images, status) 
SELECT 
    'Idish yuvish vositasi 1L',
    'Limon hidli idish yuvish geli',
    c.id,
    25000,
    20000,
    NULL,
    false,
    'IDY-001',
    150,
    ARRAY[]::TEXT[],
    'active'
FROM public.categories c WHERE c.slug = 'oshxona'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (title, description, category_id, retail_price, wholesale_price, discount_price, discount_active, sku, stock, images, status) 
SELECT 
    'Cho''tka to''plami',
    '5 dona turli xil cho''tkalar',
    c.id,
    45000,
    38000,
    40000,
    true,
    'CHT-001',
    80,
    ARRAY[]::TEXT[],
    'active'
FROM public.categories c WHERE c.slug = 'tozalash'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.products (title, description, category_id, retail_price, wholesale_price, discount_price, discount_active, sku, stock, images, status) 
SELECT 
    'Sochiq 3 dona',
    'Paxta sochiqlar to''plami',
    c.id,
    35000,
    28000,
    NULL,
    false,
    'SCH-001',
    120,
    ARRAY[]::TEXT[],
    'active'
FROM public.categories c WHERE c.slug = 'gigiena'
ON CONFLICT (sku) DO NOTHING;

-- 3. SITE CONTENT (Hero va boshqa kontentlar)
INSERT INTO public.site_content (section, data) VALUES
('hero', '{
    "title": "Uy uchun barcha narsalar",
    "subtitle": "Sifatli mahsulotlar arzon narxlarda",
    "buttonText": "Xarid qilish",
    "buttonLink": "/catalog"
}'::jsonb),
('contact', '{
    "phone": "+998 90 123 45 67",
    "email": "info@dokon.uz",
    "address": "Toshkent shahri, Chilonzor tumani",
    "workingHours": "09:00 - 18:00"
}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- =============================================
-- 4. ADMIN ROLINI QO'SHISH
-- Eslatma: Bu qatorni o'zingizning foydalanuvchi ID ga o'zgartiring
-- =============================================
-- Avval auth.users jadvalida foydalanuvchi yarating (Supabase Auth orqali)
-- Keyin quyidagi so'rovni ishga tushiring:
-- INSERT INTO public.user_roles (user_id, role) VALUES ('your-user-uuid-here', 'admin');

-- =============================================
-- ISHLATISH:
-- 1. Avval schema.sql ni ishga tushiring
-- 2. Keyin bu faylni ishga tushiring
-- 3. Admin foydalanuvchi yaratib, user_roles ga qo'shing
-- =============================================
