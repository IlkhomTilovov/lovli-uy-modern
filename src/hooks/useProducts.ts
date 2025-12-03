import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DbProduct {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  retail_price: number;
  wholesale_price: number;
  discount_price: number | null;
  discount_active: boolean;
  sku: string;
  stock: number;
  images: string[] | null;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  title: string;
  description?: string;
  category_id?: string;
  retail_price: number;
  wholesale_price: number;
  discount_price?: number | null;
  discount_active?: boolean;
  sku: string;
  stock?: number;
  images?: string[];
  status?: string;
  meta_title?: string;
  meta_description?: string;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DbProduct[];
    },
  });
};

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (product: ProductInput) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: product.title,
          description: product.description || null,
          category_id: product.category_id || null,
          retail_price: product.retail_price,
          wholesale_price: product.wholesale_price,
          discount_price: product.discount_price || null,
          discount_active: product.discount_active || false,
          sku: product.sku,
          stock: product.stock || 0,
          images: product.images || [],
          status: product.status || 'active',
          meta_title: product.meta_title || null,
          meta_description: product.meta_description || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Muvaffaqiyatli!', description: 'Mahsulot qo\'shildi' });
    },
    onError: (error) => {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<ProductInput> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (product.title !== undefined) updateData.title = product.title;
      if (product.description !== undefined) updateData.description = product.description;
      if (product.category_id !== undefined) updateData.category_id = product.category_id || null;
      if (product.retail_price !== undefined) updateData.retail_price = product.retail_price;
      if (product.wholesale_price !== undefined) updateData.wholesale_price = product.wholesale_price;
      if (product.discount_price !== undefined) updateData.discount_price = product.discount_price;
      if (product.discount_active !== undefined) updateData.discount_active = product.discount_active;
      if (product.sku !== undefined) updateData.sku = product.sku;
      if (product.stock !== undefined) updateData.stock = product.stock;
      if (product.images !== undefined) updateData.images = product.images;
      if (product.status !== undefined) updateData.status = product.status;
      if (product.meta_title !== undefined) updateData.meta_title = product.meta_title;
      if (product.meta_description !== undefined) updateData.meta_description = product.meta_description;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Muvaffaqiyatli!', description: 'Mahsulot yangilandi' });
    },
    onError: (error) => {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'O\'chirildi', description: 'Mahsulot o\'chirildi' });
    },
    onError: (error) => {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    },
  });
};
