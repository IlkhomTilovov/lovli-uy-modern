-- Fix: Supplier Business Data Publicly Accessible
-- Drop the public SELECT policy and create admin-only policy

DROP POLICY IF EXISTS "Anyone can view suppliers" ON public.suppliers;

CREATE POLICY "Only admins can view suppliers" ON public.suppliers
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));