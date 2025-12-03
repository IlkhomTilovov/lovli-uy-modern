import { useState } from 'react';
import { useErp } from '@/contexts/ErpContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Category } from '@/types/erp';

const AdminCategories = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useErp();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', status: 'active' });
    setEditingCategory(null);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      toast({ title: 'Muvaffaqiyatli!', description: 'Kategoriya yangilandi' });
    } else {
      addCategory(formData);
      toast({ title: 'Muvaffaqiyatli!', description: 'Kategoriya qo\'shildi' });
    }

    setIsOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const hasProducts = products.some(p => p.categoryId === id);
    if (hasProducts) {
      toast({ 
        title: 'Xatolik!', 
        description: 'Bu kategoriyada mahsulotlar bor. Avval mahsulotlarni o\'chiring.',
        variant: 'destructive'
      });
      return;
    }
    if (confirm('Rostdan ham o\'chirmoqchimisiz?')) {
      deleteCategory(id);
      toast({ title: 'O\'chirildi', description: 'Kategoriya o\'chirildi' });
    }
  };

  const getProductCount = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya qo\'shish'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nomi</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
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

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Bekor qilish</Button>
                  <Button type="submit">{editingCategory ? 'Saqlash' : 'Qo\'shish'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomi</TableHead>
                <TableHead>Tavsif</TableHead>
                <TableHead>Mahsulotlar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {category.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getProductCount(category.id)} ta</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.status === 'active' ? 'default' : 'outline'}>
                      {category.status === 'active' ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(category)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(category.id)}>
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

export default AdminCategories;
