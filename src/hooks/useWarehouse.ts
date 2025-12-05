import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types
export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  contact_person: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface WarehouseLog {
  id: string;
  product_id: string | null;
  type: 'incoming' | 'outgoing' | 'return' | 'adjustment';
  quantity: number;
  price_per_unit: number;
  total: number;
  note: string | null;
  supplier_id: string | null;
  batch_number: string | null;
  expiry_date: string | null;
  created_by: string | null;
  created_at: string;
}

export interface InventoryAudit {
  id: string;
  product_id: string | null;
  expected_stock: number;
  actual_stock: number;
  difference: number;
  note: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

// Suppliers hooks
export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Supplier[];
    },
  });
};

export const useAddSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: 'Muvaffaqiyatli!', description: 'Yetkazib beruvchi qo\'shildi' });
    },
    onError: (error) => {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Supplier> & { id: string }) => {
      const { error } = await supabase
        .from('suppliers')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: 'Muvaffaqiyatli!', description: 'Yetkazib beruvchi yangilandi' });
    },
    onError: (error) => {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: 'Muvaffaqiyatli!', description: 'Yetkazib beruvchi o\'chirildi' });
    },
    onError: (error) => {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    },
  });
};

// Warehouse logs hooks
export const useWarehouseLogs = () => {
  return useQuery({
    queryKey: ['warehouse_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WarehouseLog[];
    },
  });
};

export const useAddWarehouseLog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (log: Omit<WarehouseLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('warehouse_logs')
        .insert(log)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse_logs'] });
      toast({ title: 'Muvaffaqiyatli!', description: 'Operatsiya qo\'shildi' });
    },
    onError: (error) => {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    },
  });
};

// Inventory audits hooks
export const useInventoryAudits = () => {
  return useQuery({
    queryKey: ['inventory_audits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_audits')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as InventoryAudit[];
    },
  });
};

export const useAddInventoryAudit = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (audit: Omit<InventoryAudit, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('inventory_audits')
        .insert(audit)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_audits'] });
      toast({ title: 'Muvaffaqiyatli!', description: 'Inventarizatsiya yaratildi' });
    },
    onError: (error) => {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateInventoryAudit = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InventoryAudit> & { id: string }) => {
      const { error } = await supabase
        .from('inventory_audits')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_audits'] });
    },
    onError: (error) => {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    },
  });
};
