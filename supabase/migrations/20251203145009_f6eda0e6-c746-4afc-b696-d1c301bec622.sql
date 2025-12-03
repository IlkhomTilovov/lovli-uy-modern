-- Add new columns to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text;