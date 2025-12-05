import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, TrendingUp, FolderTree, Loader2, DollarSign, AlertTriangle, BarChart3 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const isLoading = productsLoading || categoriesLoading;

  // Calculate stats
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockProducts = products.filter(p => p.stock < 20);
  const totalValue = products.reduce((sum, p) => sum + (p.retail_price * p.stock), 0);

  // Category distribution data for pie chart
  const categoryData = categories.map(cat => ({
    name: cat.name,
    value: products.filter(p => p.category_id === cat.id).length,
  })).filter(c => c.value > 0);

  // Stock distribution by category
  const stockByCategory = categories.map(cat => ({
    name: cat.name.length > 10 ? cat.name.substring(0, 10) + '...' : cat.name,
    stock: products.filter(p => p.category_id === cat.id).reduce((sum, p) => sum + p.stock, 0),
    products: products.filter(p => p.category_id === cat.id).length,
  })).filter(c => c.stock > 0);

  // Price range distribution
  const priceRanges = [
    { range: '0-50K', count: products.filter(p => p.retail_price < 50000).length },
    { range: '50-100K', count: products.filter(p => p.retail_price >= 50000 && p.retail_price < 100000).length },
    { range: '100-200K', count: products.filter(p => p.retail_price >= 100000 && p.retail_price < 200000).length },
    { range: '200K+', count: products.filter(p => p.retail_price >= 200000).length },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const stats = [
    {
      title: 'Jami Mahsulotlar',
      value: totalProducts,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-500/10 to-blue-600/10',
    },
    {
      title: 'Kategoriyalar',
      value: totalCategories,
      icon: FolderTree,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-500/10 to-purple-600/10',
    },
    {
      title: 'Faol Mahsulotlar',
      value: activeProducts,
      icon: ShoppingCart,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-500/10 to-emerald-600/10',
    },
    {
      title: 'Umumiy Zaxira',
      value: totalStock.toLocaleString(),
      suffix: 'dona',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-500/10 to-teal-600/10',
    },
    {
      title: 'Zaxira Qiymati',
      value: (totalValue / 1000000).toFixed(1),
      suffix: 'M so\'m',
      icon: DollarSign,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-500/10 to-orange-600/10',
    },
    {
      title: 'Kam Qolgan',
      value: lowStockProducts.length,
      suffix: 'mahsulot',
      icon: AlertTriangle,
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-500/10 to-rose-600/10',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
      <motion.div 
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Tizim statistikasi va analitikasi</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${stat.bgGradient}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-[0.03]`} />
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    {stat.suffix && (
                      <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock by Category Chart */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  Kategoriyalar bo'yicha zaxira
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stockByCategory.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Ma'lumot yo'q
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stockByCategory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="stock" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Distribution Pie Chart */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                    <FolderTree className="w-5 h-5 text-purple-500" />
                  </div>
                  Mahsulotlar taqsimoti
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Ma'lumot yo'q
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {/* Legend */}
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {categoryData.map((cat, index) => (
                    <div key={cat.name} className="flex items-center gap-1.5">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs text-muted-foreground">{cat.name} ({cat.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price Distribution */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5">
                    <DollarSign className="w-5 h-5 text-amber-500" />
                  </div>
                  Narx taqsimoti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {priceRanges.map((range, index) => (
                    <div key={range.range} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{range.range}</span>
                        <span className="font-medium">{range.count} mahsulot</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: totalProducts ? `${(range.count / totalProducts) * 100}%` : '0%' }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Low Stock Products */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/5">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  Kam qolgan mahsulotlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Barcha mahsulotlar yetarli</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {lowStockProducts.slice(0, 5).map((product) => (
                      <div 
                        key={product.id} 
                        className="flex justify-between items-center p-3 bg-gradient-to-r from-red-500/5 to-red-500/10 rounded-xl border border-red-500/10"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{product.title}</p>
                          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <div className="ml-2 px-2 py-1 bg-red-500/20 rounded-lg">
                          <span className="text-sm font-bold text-red-600 dark:text-red-400">{product.stock}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Categories Overview */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    <FolderTree className="w-5 h-5 text-primary" />
                  </div>
                  Kategoriyalar
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Kategoriyalar yo'q</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {categories.slice(0, 5).map((category, index) => {
                      const productCount = products.filter(p => p.category_id === category.id).length;
                      return (
                        <div 
                          key={category.id} 
                          className="flex justify-between items-center p-3 rounded-xl border transition-colors hover:bg-accent/50"
                          style={{ 
                            backgroundColor: `${COLORS[index % COLORS.length]}10`,
                            borderColor: `${COLORS[index % COLORS.length]}20`
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{category.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {category.description || 'Tavsif yo\'q'}
                            </p>
                          </div>
                          <div 
                            className="ml-2 px-3 py-1 rounded-lg text-white text-sm font-medium"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          >
                            {productCount}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
