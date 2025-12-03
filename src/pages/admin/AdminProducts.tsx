import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Product } from '@/types/erp';

const AdminProducts = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useErp();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
    images: [''],
    status: 'active' as 'active' | 'inactive',
    metaTitle: '',
    metaDescription: '',
  });

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

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
      images: [''],
      status: 'active',
      metaTitle: '',
      metaDescription: '',
    });
    setEditingProduct(null);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      categoryId: product.categoryId,
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      discountPrice: product.discountPrice || 0,
      discountActive: product.discountActive,
      sku: product.sku,
      stock: product.stock,
      images: product.images.length > 0 ? product.images : [''],
      status: product.status,
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      discountPrice: formData.discountActive ? formData.discountPrice : null,
      images: formData.images.filter(img => img.trim() !== ''),
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast({ title: 'Muvaffaqiyatli!', description: 'Mahsulot yangilandi' });
    } else {
      addProduct(productData);
      toast({ title: 'Muvaffaqiyatli!', description: 'Mahsulot qo\'shildi' });
    }

    setIsOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Rostdan ham o\'chirmoqchimisiz?')) {
      deleteProduct(id);
      toast({ title: 'O\'chirildi', description: 'Mahsulot o\'chirildi' });
    }
  };

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || '-';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mahsulotlar</h1>
            <p className="text-muted-foreground">Jami: {products.length} ta mahsulot</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Yangi mahsulot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nomi</Label>
                    <Input 
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <Input 
                      value={formData.sku} 
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kategoriya</Label>
                    <Select 
                      value={formData.categoryId} 
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Faol</SelectItem>
                        <SelectItem value="inactive">Nofaol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Chakana narx</Label>
                    <Input 
                      type="number"
                      value={formData.retailPrice} 
                      onChange={(e) => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ulgurji narx</Label>
                    <Input 
                      type="number"
                      value={formData.wholesalePrice} 
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chegirma narxi</Label>
                    <Input 
                      type="number"
                      value={formData.discountPrice} 
                      onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
                      disabled={!formData.discountActive}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={formData.discountActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, discountActive: checked })}
                  />
                  <Label>Chegirma faol</Label>
                </div>

                <div className="space-y-2">
                  <Label>Rasm URL (har bir qatorda bitta)</Label>
                  <Textarea 
                    value={formData.images.join('\n')} 
                    onChange={(e) => setFormData({ ...formData, images: e.target.value.split('\n') })}
                    placeholder="/placeholder.svg"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meta Title (SEO)</Label>
                    <Input 
                      value={formData.metaTitle} 
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Description (SEO)</Label>
                    <Input 
                      value={formData.metaDescription} 
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Bekor qilish</Button>
                  <Button type="submit">{editingProduct ? 'Saqlash' : 'Qo\'shish'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Qidirish..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 max-w-sm"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rasm</TableHead>
                <TableHead>Nomi</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Kategoriya</TableHead>
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
                    <img 
                      src={product.images[0] || '/placeholder.svg'} 
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                  <TableCell>
                    {product.discountActive ? (
                      <div>
                        <span className="line-through text-muted-foreground text-sm">
                          {product.retailPrice.toLocaleString()}
                        </span>
                        <br />
                        <span className="font-semibold text-green-600">
                          {product.discountPrice?.toLocaleString()} so'm
                        </span>
                      </div>
                    ) : (
                      <span>{product.retailPrice.toLocaleString()} so'm</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stock < 20 ? 'destructive' : 'secondary'}>
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
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(product.id)}>
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
