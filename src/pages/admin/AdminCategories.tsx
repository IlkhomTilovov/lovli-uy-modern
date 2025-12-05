import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Upload, X, Image as ImageIcon, GripVertical, AlertTriangle } from 'lucide-react';
import { useCategories, useAddCategory, useUpdateCategory, useDeleteCategory, DbCategory } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';

const AdminCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useCategories();
  const { data: products = [] } = useProducts();
  const addCategoryMutation = useAddCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DbCategory | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<DbCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'active',
    sort_order: 0,
    meta_title: '',
    meta_description: '',
  });

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      image: '', 
      status: 'active', 
      sort_order: 0,
      meta_title: '',
      meta_description: ''
    });
    setEditingCategory(null);
  };

  const openEdit = (category: DbCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      status: category.status || 'active',
      sort_order: category.sort_order || 0,
      meta_title: category.meta_title || '',
      meta_description: category.meta_description || '',
    });
    setIsOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `category-${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image: publicUrl });
      toast({ title: 'Muvaffaqiyatli!', description: 'Rasm yuklandi' });
    } catch (error: any) {
      toast({ title: 'Xato', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      updateCategoryMutation.mutate({ 
        id: editingCategory.id, 
        name: formData.name,
        description: formData.description,
        image: formData.image,
        status: formData.status,
        sort_order: formData.sort_order,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
      });
    } else {
      addCategoryMutation.mutate({
        name: formData.name,
        description: formData.description,
        image: formData.image,
        status: formData.status,
        sort_order: formData.sort_order,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
      });
    }

    setIsOpen(false);
    resetForm();
  };

  const handleDeleteClick = (category: DbCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const getCategoryProducts = (categoryId: string) => {
    return products.filter(p => p.category_id === categoryId);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!categoryToDelete) return;
    
    const categoryProducts = getCategoryProducts(categoryToDelete.id);
    setIsDeleting(true);

    try {
      // Delete all products in this category first
      if (categoryProducts.length > 0) {
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('category_id', categoryToDelete.id);
          
        if (deleteError) throw deleteError;
      }

      // Now delete the category
      const { error: catError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id);
        
      if (catError) throw catError;
      
      toast({ 
        title: 'Muvaffaqiyatli!', 
        description: 'Kategoriya o\'chirildi.'
      });
      
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast({ 
        title: 'Xatolik!', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = (category: DbCategory) => {
    updateCategoryMutation.mutate({
      id: category.id,
      status: category.status === 'active' ? 'inactive' : 'active'
    });
  };

  const getProductCount = (categoryId: string) => {
    return products.filter(p => p.category_id === categoryId).length;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Kategoriyalar</h1>
            <p className="text-muted-foreground">Jami: {categories.length} ta kategoriya</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Yangi kategoriya
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  {editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya qo\'shish'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">Asosiy</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="space-y-4 mt-4">
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Rasm</Label>
                      <div className="flex items-start gap-4">
                        {formData.image ? (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                            <img 
                              src={formData.image} 
                              alt="Category" 
                              className="w-full h-full object-cover" 
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image: '' })}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="hidden"
                            id="category-image"
                          />
                          <Label htmlFor="category-image" className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors w-fit">
                              {uploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              <span>{uploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
                            </div>
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG (max 2MB)</p>
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Nomi *</Label>
                      <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required 
                        placeholder="Kategoriya nomini kiriting"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tavsif</Label>
                      <Textarea 
                        value={formData.description} 
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="Kategoriya haqida qisqacha ma'lumot"
                      />
                    </div>

                    {/* Status & Sort Order */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="flex items-center gap-2 h-10">
                          <Switch
                            checked={formData.status === 'active'}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
                            }
                          />
                          <span className="text-sm">
                            {formData.status === 'active' ? 'Aktiv' : 'Noaktiv'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tartib raqami</Label>
                        <Input 
                          type="number"
                          value={formData.sort_order} 
                          onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                          min={0}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Meta Title</Label>
                      <Input 
                        value={formData.meta_title} 
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                        placeholder="SEO sarlavha (60 belgigacha)"
                        maxLength={60}
                      />
                      <p className="text-xs text-muted-foreground">{formData.meta_title.length}/60</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Meta Description</Label>
                      <Textarea 
                        value={formData.meta_description} 
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        rows={3}
                        placeholder="SEO tavsif (160 belgigacha)"
                        maxLength={160}
                      />
                      <p className="text-xs text-muted-foreground">{formData.meta_description.length}/160</p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                  >
                    Bekor qilish
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addCategoryMutation.isPending || updateCategoryMutation.isPending}
                  >
                    {(addCategoryMutation.isPending || updateCategoryMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingCategory ? 'Saqlash' : 'Qo\'shish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-16">Rasm</TableHead>
                <TableHead>Nomi</TableHead>
                <TableHead>Tavsif</TableHead>
                <TableHead className="w-24">Mahsulotlar</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="text-right w-24">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <GripVertical className="w-4 h-4" />
                      {category.sort_order}
                    </div>
                  </TableCell>
                  <TableCell>
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {category.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getProductCount(category.id)} ta</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={category.status === 'active'}
                      onCheckedChange={() => toggleStatus(category)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(category)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive" 
                        onClick={() => handleDeleteClick(category)}
                        disabled={deleteCategoryMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Kategoriyani o'chirish
              </AlertDialogTitle>
              <AlertDialogDescription>
                <strong>"{categoryToDelete?.name}"</strong> kategoriyasini o'chirishni xohlaysizmi?
                {categoryToDelete && getCategoryProducts(categoryToDelete.id).length > 0 && (
                  <span className="block mt-2 text-destructive">
                    Diqqat: Bu kategoriyada {getCategoryProducts(categoryToDelete.id).length} ta mahsulot bor. Ular ham o'chiriladi.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    O'chirilmoqda...
                  </>
                ) : (
                  "O'chirish"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
