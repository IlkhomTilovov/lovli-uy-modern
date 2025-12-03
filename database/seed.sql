-- =============================================
-- DATABASE SEED FILE
-- Loyihani boshqa serverga o'tkazishda ishlatiladi
-- =============================================

-- 1. KATEGORIYALAR
INSERT INTO public.categories (id, name, slug, description, image) VALUES
('cat-001', 'Tozalash vositalari', 'tozalash', 'Uy tozalash uchun barcha kerakli vositalar', '/placeholder.svg'),
('cat-002', 'Kir yuvish', 'kir-yuvish', 'Kir yuvish vositalari va aksessuarlari', '/placeholder.svg'),
('cat-003', 'Oshxona jihozlari', 'oshxona', 'Oshxona uchun foydali jihozlar', '/placeholder.svg'),
('cat-004', 'Shaxsiy gigiena', 'gigiena', 'Shaxsiy gigiena vositalari', '/placeholder.svg')
ON CONFLICT (id) DO NOTHING;

-- 2. MAHSULOTLAR
INSERT INTO public.products (id, title, description, category_id, retail_price, wholesale_price, discount_price, discount_active, sku, stock, images, status) VALUES
('prod-001', 'Premium Supurgi', 'Yuqori sifatli plastik supurgi', 'cat-001', 35000, 28000, 30000, true, 'SUP-001', 100, ARRAY['/placeholder.svg'], 'active'),
('prod-002', 'Pol yuvish shvabra', 'Mikrofiber boshli shvabra', 'cat-001', 55000, 45000, NULL, false, 'SHV-001', 75, ARRAY['/placeholder.svg'], 'active'),
('prod-003', 'Kir yuvish kukuni 3kg', 'Avtomatik mashinalar uchun', 'cat-002', 85000, 70000, 75000, true, 'KYK-001', 200, ARRAY['/placeholder.svg'], 'active'),
('prod-004', 'Idish yuvish vositasi 1L', 'Limon hidli idish yuvish geli', 'cat-003', 25000, 20000, NULL, false, 'IDY-001', 150, ARRAY['/placeholder.svg'], 'active'),
('prod-005', 'Cho''tka to''plami', '5 dona turli xil cho''tkalar', 'cat-001', 45000, 38000, 40000, true, 'CHT-001', 80, ARRAY['/placeholder.svg'], 'active'),
('prod-006', 'Sochiq 3 dona', 'Paxta sochiqlar to''plami', 'cat-004', 35000, 28000, NULL, false, 'SCH-001', 120, ARRAY['/placeholder.svg'], 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. ADMIN ROLINI QO'SHISH (foydalanuvchi allaqachon ro'yxatdan o'tgan bo'lishi kerak)
-- Eslatma: user_id ni o'zingizning foydalanuvchi ID ga o'zgartiring
-- INSERT INTO public.user_roles (user_id, role) VALUES ('your-user-id-here', 'admin');

-- =============================================
-- ISHLATISH:
-- 1. Supabase dashboard > SQL Editor
-- 2. Bu faylni nusxalang va ishga tushiring
-- 3. Yoki psql orqali: psql -h your-host -U postgres -d postgres -f seed.sql
-- =============================================
