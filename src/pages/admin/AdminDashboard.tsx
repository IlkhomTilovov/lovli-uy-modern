import { useErp } from '@/contexts/ErpContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Warehouse, TrendingUp, Users, FolderTree } from 'lucide-react';

const AdminDashboard = () => {
  const { products, orders, warehouseLogs, categories, users } = useErp();

  const stats = [
    {
      title: 'Jami Mahsulotlar',
      value: products.length,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Kategoriyalar',
      value: categories.length,
      icon: FolderTree,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Buyurtmalar',
      value: orders.length,
      icon: ShoppingCart,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Ombor operatsiyalari',
      value: warehouseLogs.length,
      icon: Warehouse,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Foydalanuvchilar',
      value: users.length,
      icon: Users,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
    {
      title: 'Umumiy savdo',
      value: orders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString() + ' so\'m',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
  ];

  const newOrders = orders.filter(o => o.status === 'new');
  const lowStockProducts = products.filter(p => p.stock < 20);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Tizim statistikasi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Yangi buyurtmalar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {newOrders.length === 0 ? (
                <p className="text-muted-foreground">Yangi buyurtmalar yo'q</p>
              ) : (
                <div className="space-y-3">
                  {newOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{order.totalPrice.toLocaleString()} so'm</p>
                        <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded">Yangi</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-destructive" />
                Kam qolgan mahsulotlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="text-muted-foreground">Barcha mahsulotlar yetarli</p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-destructive">{product.stock} dona</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
