import { useState, useMemo } from 'react';
import { useErp } from '@/contexts/ErpContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Eye, Package, Search, FileSpreadsheet, FileText, Plus,
  ShoppingCart, DollarSign, TrendingUp, Users, Calendar, CalendarIcon
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/erp';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { startOfDay, endOfDay, isAfter, isBefore, format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
  new: { label: 'Yangi', color: 'bg-yellow-500' },
  accepted: { label: 'Qabul qilindi', color: 'bg-blue-500' },
  preparing: { label: 'Tayyorlanmoqda', color: 'bg-purple-500' },
  delivered: { label: 'Yetkazildi', color: 'bg-green-500' },
  cancelled: { label: 'Bekor qilindi', color: 'bg-red-500' },
};

const AdminOrders = () => {
  const { orders, orderItems, products, updateOrderStatus, addOrder } = useErp();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    phone: '',
    address: '',
    totalPrice: 0
  });

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];
    
    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(o => o.status === filterStatus);
    }
    
    // Date range filter
    if (dateRange?.from) {
      const startDate = startOfDay(dateRange.from);
      result = result.filter(o => isAfter(new Date(o.createdAt), startDate) || new Date(o.createdAt).getTime() === startDate.getTime());
    }
    if (dateRange?.to) {
      const endDate = endOfDay(dateRange.to);
      result = result.filter(o => isBefore(new Date(o.createdAt), endDate) || new Date(o.createdAt).getTime() === endDate.getTime());
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.customerName.toLowerCase().includes(query) ||
        o.phone.includes(query) ||
        o.address.toLowerCase().includes(query)
      );
    }
    
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, filterStatus, dateRange, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const avgCheck = filteredOrders.length > 0 ? total / filteredOrders.length : 0;
    const delivered = filteredOrders.filter(o => o.status === 'delivered').length;
    const newOrders = filteredOrders.filter(o => o.status === 'new').length;
    
    return { total, avgCheck, delivered, newOrders, count: filteredOrders.length };
  }, [filteredOrders]);

  // Chart data - last 7 days
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= dayStart && orderDate < dayEnd;
      });
      
      const delivered = dayOrders.filter(o => o.status === 'delivered').length;
      const cancelled = dayOrders.filter(o => o.status === 'cancelled').length;
      
      days.push({
        name: format(date, 'dd/MM'),
        buyurtmalar: dayOrders.length,
        summa: dayOrders.reduce((sum, o) => sum + o.totalPrice, 0) / 1000,
        yetkazildi: delivered,
        bekor: cancelled
      });
    }
    return days;
  }, [orders]);

  const getOrderItems = (orderId: string) => {
    return orderItems.filter(item => item.orderId === orderId);
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.title || 'Noma\'lum';
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    toast({ title: 'Yangilandi', description: 'Buyurtma statusi o\'zgartirildi' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Export functions
  const exportToExcel = () => {
    const headers = ['ID', 'Mijoz', 'Telefon', 'Manzil', 'Summa', 'Status', 'Sana'];
    const rows = filteredOrders.map(o => [
      o.id.slice(0, 8),
      o.customerName,
      o.phone,
      o.address,
      o.totalPrice,
      statusLabels[o.status].label,
      formatDate(o.createdAt)
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `buyurtmalar_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast({ title: 'Export', description: 'Excel fayl yuklandi' });
  };

  const exportToPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Buyurtmalar hisoboti</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            .stats { display: flex; gap: 20px; margin-bottom: 20px; }
            .stat { padding: 10px; background: #f9f9f9; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>Buyurtmalar hisoboti</h1>
          <p>Sana: ${format(new Date(), 'dd.MM.yyyy HH:mm')}</p>
          <div class="stats">
            <div class="stat"><strong>Jami:</strong> ${stats.count} ta</div>
            <div class="stat"><strong>Summa:</strong> ${stats.total.toLocaleString()} so'm</div>
            <div class="stat"><strong>O'rtacha chek:</strong> ${Math.round(stats.avgCheck).toLocaleString()} so'm</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Mijoz</th>
                <th>Telefon</th>
                <th>Summa</th>
                <th>Status</th>
                <th>Sana</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(o => `
                <tr>
                  <td>#${o.id.slice(0, 8)}</td>
                  <td>${o.customerName}</td>
                  <td>${o.phone}</td>
                  <td>${o.totalPrice.toLocaleString()} so'm</td>
                  <td>${statusLabels[o.status].label}</td>
                  <td>${formatDate(o.createdAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    toast({ title: 'Export', description: 'PDF tayyorlandi' });
  };

  const handleAddOrder = () => {
    if (!newOrder.customerName || !newOrder.phone || !newOrder.address) {
      toast({ title: 'Xato', description: 'Barcha maydonlarni to\'ldiring', variant: 'destructive' });
      return;
    }
    
    addOrder({
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      address: newOrder.address,
      totalPrice: newOrder.totalPrice,
      status: 'new'
    }, []);
    
    setNewOrder({ customerName: '', phone: '', address: '', totalPrice: 0 });
    setShowNewOrderDialog(false);
    toast({ title: 'Muvaffaqiyat', description: 'Yangi buyurtma qo\'shildi' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Buyurtmalar</h1>
            <p className="text-muted-foreground">Jami: {orders.length} ta buyurtma</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setShowNewOrderDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Yangi buyurtma
            </Button>
            <Button variant="outline" onClick={exportToExcel} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
            <Button variant="outline" onClick={exportToPDF} className="gap-2">
              <FileText className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Buyurtmalar</p>
                  <p className="text-2xl font-bold">{stats.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jami summa</p>
                  <p className="text-2xl font-bold">{(stats.total / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">O'rtacha chek</p>
                  <p className="text-2xl font-bold">{(stats.avgCheck / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Package className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Yetkazildi</p>
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Users className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Yangi</p>
                  <p className="text-2xl font-bold">{stats.newOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Kunlik buyurtmalar (so'nggi 7 kun)
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="buyurtmalar" stroke="hsl(var(--primary))" strokeWidth={2} name="Buyurtmalar" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Status bo'yicha (so'nggi 7 kun)
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="yetkazildi" fill="hsl(142, 76%, 36%)" name="Yetkazildi" />
                    <Bar dataKey="bekor" fill="hsl(0, 84%, 60%)" name="Bekor qilindi" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Mijoz ismi yoki telefon raqami..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd.MM.yyyy")} -{" "}
                      {format(dateRange.to, "dd.MM.yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd.MM.yyyy")
                  )
                ) : (
                  <span>Sana tanlang</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
              {dateRange && (
                <div className="p-3 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setDateRange(undefined)}
                    className="w-full"
                  >
                    Tozalash
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barchasi</SelectItem>
              <SelectItem value="new">Yangi</SelectItem>
              <SelectItem value="accepted">Qabul qilindi</SelectItem>
              <SelectItem value="preparing">Tayyorlanmoqda</SelectItem>
              <SelectItem value="delivered">Yetkazildi</SelectItem>
              <SelectItem value="cancelled">Bekor qilindi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Mijoz</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Manzil</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Buyurtmalar topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">#{order.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">{order.customerName}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell className="max-w-xs truncate">{order.address}</TableCell>
                    <TableCell className="font-semibold">{order.totalPrice.toLocaleString()} so'm</TableCell>
                    <TableCell>
                      <Select 
                        value={order.status} 
                        onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <Badge className={statusLabels[order.status].color}>
                            {statusLabels[order.status].label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              <Badge className={value.color}>{value.label}</Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* View Order Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Buyurtma #{selectedOrder?.id.slice(0, 8)}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Mijoz</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Telefon</p>
                    <p className="font-medium">{selectedOrder.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Manzil</p>
                    <p className="font-medium">{selectedOrder.address}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-semibold mb-3">Buyurtma tarkibi</p>
                  <div className="space-y-2">
                    {getOrderItems(selectedOrder.id).map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                        <div>
                          <p className="font-medium">{getProductName(item.productId)}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {item.priceAtMoment.toLocaleString()} so'm
                          </p>
                        </div>
                        <p className="font-semibold">{item.subtotal.toLocaleString()} so'm</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold">Jami:</span>
                  <span className="text-xl font-bold text-primary">
                    {selectedOrder.totalPrice.toLocaleString()} so'm
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* New Order Dialog */}
        <Dialog open={showNewOrderDialog} onOpenChange={setShowNewOrderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Yangi buyurtma qo'shish
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Mijoz ismi</label>
                <Input
                  placeholder="Mijoz ismini kiriting"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Telefon raqami</label>
                <Input
                  placeholder="+998 90 123 45 67"
                  value={newOrder.phone}
                  onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Manzil</label>
                <Input
                  placeholder="Yetkazib berish manzili"
                  value={newOrder.address}
                  onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Summa (so'm)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newOrder.totalPrice || ''}
                  onChange={(e) => setNewOrder({ ...newOrder, totalPrice: Number(e.target.value) })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowNewOrderDialog(false)} className="flex-1">
                  Bekor qilish
                </Button>
                <Button onClick={handleAddOrder} className="flex-1">
                  Qo'shish
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
