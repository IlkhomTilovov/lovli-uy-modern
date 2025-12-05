-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  contact_person TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warehouse_logs table for tracking all warehouse operations
CREATE TABLE public.warehouse_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('incoming', 'outgoing', 'return', 'adjustment')),
  quantity INTEGER NOT NULL,
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  note TEXT,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  batch_number TEXT,
  expiry_date TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_audits table
CREATE TABLE public.inventory_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  expected_stock INTEGER NOT NULL,
  actual_stock INTEGER NOT NULL,
  difference INTEGER NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_audits ENABLE ROW LEVEL SECURITY;

-- Suppliers policies
CREATE POLICY "Anyone can view suppliers" ON public.suppliers
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert suppliers" ON public.suppliers
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update suppliers" ON public.suppliers
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete suppliers" ON public.suppliers
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Warehouse logs policies
CREATE POLICY "Only admins can view warehouse logs" ON public.warehouse_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert warehouse logs" ON public.warehouse_logs
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update warehouse logs" ON public.warehouse_logs
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete warehouse logs" ON public.warehouse_logs
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Inventory audits policies
CREATE POLICY "Only admins can view inventory audits" ON public.inventory_audits
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert inventory audits" ON public.inventory_audits
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update inventory audits" ON public.inventory_audits
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete inventory audits" ON public.inventory_audits
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_audits_updated_at
  BEFORE UPDATE ON public.inventory_audits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();