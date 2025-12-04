-- Add rating, weight, and size columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS weight numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS size text DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.products.rating IS 'Product rating from 0 to 5';
COMMENT ON COLUMN public.products.weight IS 'Product weight in grams';
COMMENT ON COLUMN public.products.size IS 'Product size (S, M, L, XL, etc.)';