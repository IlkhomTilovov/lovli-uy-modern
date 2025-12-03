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
import { Plus, Pencil, Trash2, Shield, User as UserIcon, Warehouse, Eye, EyeOff } from 'lucide-react';
import { User, UserRole } from '@/types/erp';
import { supabase } from '@/integrations/supabase/client';

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
    password: '',
    role: 'manager' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'manager' });
    setEditingUser(null);
    setShowPassword(false);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingUser) {
        updateUser(editingUser.id, { name: formData.name, email: formData.email, role: formData.role });
        toast({ title: 'Muvaffaqiyatli!', description: 'Foydalanuvchi yangilandi' });
      } else {
        // Yangi foydalanuvchi yaratish - Supabase Auth orqali
        if (formData.password.length < 6) {
          toast({ 
            title: 'Xatolik!', 
            description: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: formData.name,
            }
          }
        });

        if (error) {
          toast({ 
            title: 'Xatolik!', 
            description: error.message,
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }

        if (data.user) {
          // Rol qo'shish
          const appRole = formData.role === 'admin' ? 'admin' : formData.role === 'manager' ? 'moderator' : 'user';
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role: appRole as 'admin' | 'moderator' | 'user' });

          if (roleError) {
            console.error('Role error:', roleError);
          }

          // Local state ga qo'shish
          addUser({
            name: formData.name,
            email: formData.email,
            role: formData.role,
          });
        }

        toast({ title: 'Muvaffaqiyatli!', description: 'Foydalanuvchi qo\'shildi' });
      }

      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast({ 
        title: 'Xatolik!', 
        description: 'Nimadir xato ketdi',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
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
                    disabled={!!editingUser}
                  />
                </div>

                {!editingUser && (
                  <div className="space-y-2">
                    <Label>Parol</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password} 
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                        placeholder="Kamida 6 ta belgi"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

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
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                    Bekor qilish
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Yuklanmoqda...' : (editingUser ? 'Saqlash' : 'Qo\'shish')}
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
