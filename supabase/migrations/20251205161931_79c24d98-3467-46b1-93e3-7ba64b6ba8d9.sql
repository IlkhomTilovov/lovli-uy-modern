-- Fix orders table RLS: Remove public read access, restrict to admins only
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;

CREATE POLICY "Only admins can view orders" 
ON public.orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix order_items table RLS: Remove public read access, restrict to admins only  
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;

CREATE POLICY "Only admins can view order items" 
ON public.order_items 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));