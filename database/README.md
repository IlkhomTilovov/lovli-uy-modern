# Database Setup Guide / Ma'lumotlar Bazasi Sozlamalari

## 🇺🇿 O'zbekcha

### Yangi serverga o'tkazish uchun qadamlar:

#### 1. Supabase loyihasi yarating
- [supabase.com](https://supabase.com) ga kiring
- Yangi loyiha yarating
- Project URL va anon key ni saqlang

#### 2. Database schema yarating
`supabase/migrations/` papkasidagi barcha SQL fayllarini ketma-ket ishga tushiring:
```bash
# Supabase CLI orqali
supabase db push

# Yoki qo'lda SQL Editor orqali
```

#### 3. Boshlang'ich ma'lumotlarni yuklang
```bash
# seed.sql faylini SQL Editor da ishga tushiring
```

#### 4. Environment variables sozlang
Hosting platformasida quyidagi o'zgaruvchilarni qo'shing:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

#### 5. Storage bucket yarating
SQL Editor da:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
```

---

## 🇬🇧 English

### Steps to deploy to a new server:

#### 1. Create Supabase project
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Save the Project URL and anon key

#### 2. Create database schema
Run all SQL files in `supabase/migrations/` folder in order:
```bash
# Using Supabase CLI
supabase db push

# Or manually via SQL Editor
```

#### 3. Load seed data
```bash
# Run seed.sql in SQL Editor
```

#### 4. Configure environment variables
Add these variables to your hosting platform:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

#### 5. Create storage bucket
In SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
```

---

## File Structure / Fayl tuzilishi

```
database/
├── README.md          # Bu fayl
├── seed.sql           # Boshlang'ich ma'lumotlar
└── schema.sql         # Database strukturasi (optional)

supabase/
├── config.toml        # Supabase konfiguratsiyasi
└── migrations/        # Database migratsiyalari
    └── *.sql          # Schema o'zgarishlari
```

## Important Notes / Muhim eslatmalar

- ⚠️ `auth.users` jadvalidagi foydalanuvchilar avtomatik ko'chirilmaydi
- ⚠️ Storage'dagi fayllar (rasmlar) alohida ko'chirilishi kerak
- ⚠️ RLS siyosatlari migratsiya fayllarida mavjud
