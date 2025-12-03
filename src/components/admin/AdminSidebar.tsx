import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useErp } from '@/contexts/ErpContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  FileText,
  Users,
  FolderTree,
  LogOut,
  Settings,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Mahsulotlar', path: '/admin/products' },
  { icon: FolderTree, label: 'Kategoriyalar', path: '/admin/categories' },
  { icon: ShoppingCart, label: 'Buyurtmalar', path: '/admin/orders' },
  { icon: Warehouse, label: 'Ombor', path: '/admin/warehouse' },
  { icon: FileText, label: 'Kontent', path: '/admin/content' },
  { icon: Users, label: 'Foydalanuvchilar', path: '/admin/users' },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { currentUser, logout } = useErp();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">{currentUser?.name}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Link to="/">
          <Button variant="outline" className="w-full justify-start gap-3">
            <Home className="w-4 h-4" />
            Saytga o'tish
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
