import { useState } from 'react';
import { useErp } from '@/contexts/ErpContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Shield, User as UserIcon, Warehouse } from 'lucide-react';
import { User, UserRole } from '@/types/erp';

const roleLabels: Record<UserRole, { label: string; icon: React.ElementType; color: string }> = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-red-500' },
  manager: { label: 'Menejer', icon: UserIcon, color: 'bg-blue-500' },
  warehouse: { label: 'Omborchi', icon: Warehouse, color: 'bg-green-500' },
};

const AdminUsers = () => {
  const { users, currentUser, addUser, updateUser, deleteUser } = useErp();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'manager' as UserRole,
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'manager' });
    setEditingUser(null);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      updateUser(editingUser.id, formData);
      toast({ title: 'Muvaffaqiyatli!', description: 'Foydalanuvchi yangilandi' });
    } else {
      addUser(formData);
      toast({ title: 'Muvaffaqiyatli!', description: 'Foydalanuvchi qo\'shildi' });
    }

    setIsOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) {
      toast({ 
        title: 'Xatolik!', 
        description: 'O\'zingizni o\'chira olmaysiz',
        variant: 'destructive'
      });
      return;
    }
    if (confirm('Rostdan ham o\'chirmoqchimisiz?')) {
      deleteUser(id);
      toast({ title: 'O\'chirildi', description: 'Foydalanuvchi o\'chirildi' });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Foydalanuvchilar</h1>
            <p className="text-muted-foreground">Jami: {users.length} ta foydalanuvchi</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Yangi foydalanuvchi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi qo\'shish'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Ism</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <value.icon className="w-4 h-4" />
                            {value.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-accent/50 rounded-lg text-sm">
                  <p className="font-medium mb-2">Rol huquqlari:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li><strong>Admin:</strong> Barcha huquqlar</li>
                    <li><strong>Menejer:</strong> Mahsulotlar, buyurtmalar, kontent</li>
                    <li><strong>Omborchi:</strong> Faqat ombor operatsiyalari</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Bekor qilish</Button>
                  <Button type="submit">{editingUser ? 'Saqlash' : 'Qo\'shish'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ism</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Qo'shilgan</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const role = roleLabels[user.role];
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="ml-2">Siz</Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={role.color}>
                        <role.icon className="w-3 h-3 mr-1" />
                        {role.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(user)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-destructive" 
                          onClick={() => handleDelete(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
