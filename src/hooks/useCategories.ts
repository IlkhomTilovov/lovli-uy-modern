import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: string;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  status?: string;
  sort_order?: number;
  meta_title?: string;
  meta_description?: string;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as DbCategory[];
    },
  });
};

export const useAddCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (category: CategoryInput) => {
      const slug = category.slug || generateSlug(category.name);
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          slug,
          description: category.description || null,
          image: category.image || null,
          status: category.status || 'active',
          sort_order: category.sort_order || 0,
          meta_title: category.meta_title || null,
          meta_description: category.meta_description || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Muvaffaqiyatli!', description: 'Kategoriya qo\'shildi' });
    },
    onError: (error) => {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...category }: Partial<CategoryInput> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (category.name !== undefined) {
        updateData.name = category.name;
        updateData.slug = category.slug || generateSlug(category.name);
      }
      if (category.description !== undefined) updateData.description = category.description;
      if (category.image !== undefined) updateData.image = category.image;
      if (category.status !== undefined) updateData.status = category.status;
      if (category.sort_order !== undefined) updateData.sort_order = category.sort_order;
      if (category.meta_title !== undefined) updateData.meta_title = category.meta_title;
      if (category.meta_description !== undefined) updateData.meta_description = category.meta_description;

      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Muvaffaqiyatli!', description: 'Kategoriya yangilandi' });
    },
    onError: (error) => {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'O\'chirildi', description: 'Kategoriya o\'chirildi' });
    },
    onError: (error) => {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    },
  });
};
