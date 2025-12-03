import { useState, useRef } from 'react';
import { useErp } from '@/contexts/ErpContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search, Package, DollarSign, Image as ImageIcon, Tag, FileText, Settings, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct, DbProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';

const AdminProducts = () => {
  const { toast } = useToast();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const addProductMutation = useAddProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    retailPrice: 0,
    wholesalePrice: 0,
    discountPrice: 0,
    discountActive: false,
    sku: '',
    stock: 0,
    images: [] as string[],
    status: 'active' as 'active' | 'inactive',
    metaTitle: '',
    metaDescription: '',
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);
        
        if (error) {
          console.error('Upload error:', error);
          toast({ title: 'Xato', description: `Rasm yuklashda xato: ${file.name}`, variant: 'destructive' });
          continue;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrl);
      }
      
      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
        toast({ title: 'Muvaffaqiyatli!', description: `${uploadedUrls.length} ta rasm yuklandi` });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Xato', description: 'Rasm yuklashda xato yuz berdi', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      categoryId: '',
      retailPrice: 0,
      wholesalePrice: 0,
      discountPrice: 0,
      discountActive: false,
      sku: '',
      stock: 0,
      images: [],
      status: 'active',
      metaTitle: '',
      metaDescription: '',
    });
    setEditingProduct(null);
  };

  const openEdit = (product: DbProduct) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      categoryId: product.category_id || '',
      retailPrice: product.retail_price,
      wholesalePrice: product.wholesale_price,
      discountPrice: product.discount_price || 0,
      discountActive: product.discount_active,
      sku: product.sku,
      stock: product.stock,
      images: product.images || [],
      status: product.status as 'active' | 'inactive',
      metaTitle: product.meta_title || '',
      metaDescription: product.meta_description || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      title: formData.title,
      description: formData.description || undefined,
      category_id: formData.categoryId || undefined,
      retail_price: formData.retailPrice,
      wholesale_price: formData.wholesalePrice,
      discount_price: formData.discountActive ? formData.discountPrice : null,
      discount_active: formData.discountActive,
      sku: formData.sku,
      stock: formData.stock,
      images: formData.images,
      status: formData.status,
      meta_title: formData.metaTitle || undefined,
      meta_description: formData.metaDescription || undefined,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...productData });
    } else {
      addProductMutation.mutate(productData);
    }

    setIsOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Rostdan ham o\'chirmoqchimisiz?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return '-';
    return categories.find(c => c.id === id)?.name || '-';
  };

  if (productsLoading) {
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mahsulotlar</h1>
            <p className="text-muted-foreground">Jami: {products.length} ta mahsulot</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg">
                <Plus className="w-4 h-4" />
                Yangi mahsulot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
              <DialogHeader className="p-6 pb-2 border-b bg-muted/30">
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info Section */}
                <Card className="border-primary/20">
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Tag className="w-4 h-4" />
                      <span className="font-semibold text-sm">Asosiy ma'lumotlar</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Mahsulot nomi *</Label>
                        <Input 
                          value={formData.title} 
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Masalan: Premium kir yuvish kukuni"
                          className="h-11"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">SKU (mahsulot kodi) *</Label>
                        <Input 
                          value={formData.sku} 
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="Masalan: PRD-001"
                          className="h-11"
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">Tavsif</Label>
                      <Textarea 
                        value={formData.description} 
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Mahsulot haqida batafsil ma'lumot..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Kategoriya</Label>
                        <Select 
                          value={formData.categoryId} 
                          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                        >
                          <SelectTrigger className="h-11 bg-background">
                            <SelectValue placeholder="Kategoriyani tanlang" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Status</Label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="h-11 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="active">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Faol
                              </span>
                            </SelectItem>
                            <SelectItem value="inactive">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                Nofaol
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing Section */}
                <Card className="border-green-500/20">
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-sm">Narxlar</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Chakana narx *</Label>
                        <div className="relative">
                          <Input 
                            type="number"
                            value={formData.retailPrice} 
                            onChange={(e) => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
                            className="h-11 pr-14"
                            required 
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">so'm</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Ulgurji narx *</Label>
                        <div className="relative">
                          <Input 
                            type="number"
                            value={formData.wholesalePrice} 
                            onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                            className="h-11 pr-14"
                            required 
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">so'm</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Chegirma narxi</Label>
                        <div className="relative">
                          <Input 
                            type="number"
                            value={formData.discountPrice} 
                            onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
                            className="h-11 pr-14"
                            disabled={!formData.discountActive}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">so'm</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Switch 
                        checked={formData.discountActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, discountActive: checked })}
                      />
                      <div>
                        <Label className="cursor-pointer">Chegirma faol</Label>
                        <p className="text-xs text-muted-foreground">Chegirma narxini faollashtirish</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stock Section */}
                <Card className="border-orange-500/20">
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <Settings className="w-4 h-4" />
                      <span className="font-semibold text-sm">Ombor</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">Zaxiradagi miqdori</Label>
                      <div className="relative max-w-xs">
                        <Input 
                          type="number"
                          value={formData.stock} 
                          onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                          className="h-11 pr-14"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">dona</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Images Section */}
                <Card className="border-purple-500/20">
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <ImageIcon className="w-4 h-4" />
                      <span className="font-semibold text-sm">Rasmlar</span>
                    </div>
                    
                    <div className="space-y-4">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && uploadImages(e.target.files)}
                      />
                      
                      <div 
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-colors"
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-purple-500" />
                            <p className="text-sm font-medium">Rasmlarni yuklash uchun bosing</p>
                            <p className="text-xs text-muted-foreground">Bir nechta rasm tanlash mumkin</p>
                          </div>
                        )}
                      </div>

                      {formData.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                          {formData.images.map((img, index) => (
                            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                              <img src={img} alt={`Rasm ${index + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Section */}
                <Card className="border-blue-500/20">
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-semibold text-sm">SEO (Qidiruv uchun)</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Meta sarlavha</Label>
                        <Input 
                          value={formData.metaTitle} 
                          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                          placeholder="Qidiruv tizimlarida ko'rinadigan sarlavha"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-sm">Meta tavsif</Label>
                        <Textarea 
                          value={formData.metaDescription} 
                          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                          placeholder="Qidiruv tizimlarida ko'rinadigan qisqa tavsif"
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Bekor qilish</Button>
                  <Button type="submit" disabled={addProductMutation.isPending || updateProductMutation.isPending}>
                    {(addProductMutation.isPending || updateProductMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingProduct ? 'Saqlash' : 'Qo\'shish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Qidirish..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rasm</TableHead>
                <TableHead>Nomi</TableHead>
                <TableHead>Kategoriya</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Narx</TableHead>
                <TableHead>Zaxira</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell className="text-muted-foreground">{getCategoryName(product.category_id)}</TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{product.retail_price.toLocaleString()} so'm</div>
                      {product.discount_active && product.discount_price && (
                        <div className="text-xs text-green-600">Chegirma: {product.discount_price.toLocaleString()} so'm</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
                      {product.stock} dona
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'default' : 'outline'}>
                      {product.status === 'active' ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(product)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive" 
                        onClick={() => handleDelete(product.id)}
                        disabled={deleteProductMutation.isPending}
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
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
