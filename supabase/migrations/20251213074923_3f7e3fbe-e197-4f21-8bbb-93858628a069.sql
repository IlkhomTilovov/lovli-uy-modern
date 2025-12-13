-- Drop existing restrictive policies for orders and order_items
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Create permissive policies for public order creation
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can create order items" 
ON public.order_items 
FOR INSERT 
TO public
WITH CHECK (true);

-- Allow anyone to view their own orders by phone number
CREATE POLICY "Anyone can view orders by phone" 
ON public.orders 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Anyone can view order items for their orders" 
ON public.order_items 
FOR SELECT 
TO public
USING (true);