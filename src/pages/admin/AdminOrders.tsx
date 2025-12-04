import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Eye, Package, Search, FileSpreadsheet, FileText, RefreshCw,
  ShoppingCart, DollarSign, TrendingUp, Users, Calendar, CalendarIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { startOfDay, endOfDay, isAfter, isBefore, format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

type OrderStatus = 'new' | 'accepted' | 'preparing' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  product_title: string;
  quantity: number;
  price_at_moment: number;
  subtotal: number;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  region: string;
  city: string;
  address: string;
  comment: string | null;
  total_price: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
  new: { label: 'Yangi', color: 'bg-yellow-500' },
  accepted: { label: 'Qabul qilindi', color: 'bg-blue-500' },
  preparing: { label: 'Tayyorlanmoqda', color: 'bg-purple-500' },
  delivered: { label: 'Yetkazildi', color: 'bg-green-500' },
  cancelled: { label: 'Bekor qilindi', color: 'bg-red-500' },
};

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders from Supabase
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Buyurtma statusi o\'zgartirildi');
    },
    onError: () => {
      toast.error('Xatolik yuz berdi');
    },
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
      result = result.filter(o => isAfter(new Date(o.created_at), startDate) || new Date(o.created_at).getTime() === startDate.getTime());
    }
    if (dateRange?.to) {
      const endDate = endOfDay(dateRange.to);
      result = result.filter(o => isBefore(new Date(o.created_at), endDate) || new Date(o.created_at).getTime() === endDate.getTime());
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.customer_name.toLowerCase().includes(query) ||
        o.phone.includes(query) ||
        o.address.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [orders, filterStatus, dateRange, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
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
        const orderDate = new Date(o.created_at);
        return orderDate >= dayStart && orderDate < dayEnd;
      });
      
      const delivered = dayOrders.filter(o => o.status === 'delivered').length;
      const cancelled = dayOrders.filter(o => o.status === 'cancelled').length;
      
      days.push({
        name: format(date, 'dd/MM'),
        buyurtmalar: dayOrders.length,
        summa: dayOrders.reduce((sum, o) => sum + Number(o.total_price), 0) / 1000,
        yetkazildi: delivered,
        bekor: cancelled
      });
    }
    return days;
  }, [orders]);

  const handleStatusChange = (orderId: string, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
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
      o.customer_name,
      o.phone,
      `${o.region}, ${o.city}, ${o.address}`,
      o.total_price,
      statusLabels[o.status as OrderStatus]?.label || o.status,
      formatDate(o.created_at)
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `buyurtmalar_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('Excel fayl yuklandi');
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
                  <td>${o.customer_name}</td>
                  <td>${o.phone}</td>
                  <td>${Number(o.total_price).toLocaleString()} so'm</td>
                  <td>${statusLabels[o.status as OrderStatus]?.label || o.status}</td>
                  <td>${formatDate(o.created_at)}</td>
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
    toast.success('PDF tayyorlandi');
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
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Yangilash
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    Buyurtmalar topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const status = statusLabels[order.status as OrderStatus] || { label: order.status, color: 'bg-gray-500' };
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">#{order.id.slice(0, 8).toUpperCase()}</TableCell>
                      <TableCell className="font-medium">{order.customer_name}</TableCell>
                      <TableCell>{order.phone}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {order.region}, {order.city}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {Number(order.total_price).toLocaleString()} so'm
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <Badge className={`${status.color} text-white`}>
                              {status.label}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Yangi</SelectItem>
                            <SelectItem value="accepted">Qabul qilindi</SelectItem>
                            <SelectItem value="preparing">Tayyorlanmoqda</SelectItem>
                            <SelectItem value="delivered">Yetkazildi</SelectItem>
                            <SelectItem value="cancelled">Bekor qilindi</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Buyurtma #{selectedOrder?.id.slice(0, 8).toUpperCase()}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Mijoz</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{selectedOrder.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Manzil</p>
                    <p className="font-medium">
                      {selectedOrder.region}, {selectedOrder.city}, {selectedOrder.address}
                    </p>
                  </div>
                  {selectedOrder.comment && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Izoh</p>
                      <p className="font-medium">{selectedOrder.comment}</p>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3">Mahsulotlar</h4>
                  <div className="border rounded-lg divide-y">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.product_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {Number(item.price_at_moment).toLocaleString()} so'm
                          </p>
                        </div>
                        <span className="font-semibold">
                          {Number(item.subtotal).toLocaleString()} so'm
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-semibold text-lg">Jami:</span>
                  <span className="text-2xl font-bold text-primary">
                    {Number(selectedOrder.total_price).toLocaleString()} so'm
                  </span>
                </div>

                {/* Status Change */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Statusni o'zgartirish:</span>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => {
                      handleStatusChange(selectedOrder.id, value);
                      setSelectedOrder({ ...selectedOrder, status: value });
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Yangi</SelectItem>
                      <SelectItem value="accepted">Qabul qilindi</SelectItem>
                      <SelectItem value="preparing">Tayyorlanmoqda</SelectItem>
                      <SelectItem value="delivered">Yetkazildi</SelectItem>
                      <SelectItem value="cancelled">Bekor qilindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;