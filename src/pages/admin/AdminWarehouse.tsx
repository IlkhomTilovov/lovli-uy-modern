import { useState, useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, ArrowDownCircle, ArrowUpCircle, Package, TrendingUp, TrendingDown, 
  Search, Download, FileSpreadsheet, FileText, Bell, AlertTriangle, Calendar,
  X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfDay, startOfWeek, startOfMonth, isAfter, parseISO } from 'date-fns';

const AdminWarehouse = () => {
  const { products, warehouseLogs, addWarehouseLog } = useErp();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'incoming' as 'incoming' | 'outgoing',
    quantity: 0,
    pricePerUnit: 0,
    note: '',
  });

  const resetForm = () => {
    setFormData({ productId: '', type: 'incoming', quantity: 0, pricePerUnit: 0, note: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === formData.productId);
    if (formData.type === 'outgoing' && product && product.stock < formData.quantity) {
      toast({ 
        title: 'Xatolik!', 
        description: 'Omborda yetarli mahsulot yo\'q',
        variant: 'destructive'
      });
      return;
    }

    addWarehouseLog(formData);
    toast({ 
      title: 'Muvaffaqiyatli!', 
      description: formData.type === 'incoming' ? 'Kirim qo\'shildi' : 'Chiqim qo\'shildi'
    });
    setIsOpen(false);
    resetForm();
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.title || 'Noma\'lum';
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

  // Date filtering logic
  const getFilteredByDate = (logs: typeof warehouseLogs) => {
    if (dateFilter === 'all') return logs;
    
    const now = new Date();
    let startDate: Date;
    
    switch (dateFilter) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      default:
        return logs;
    }
    
    return logs.filter(log => isAfter(parseISO(log.createdAt), startDate));
  };

  // Search filtering
  const getFilteredBySearch = (logs: typeof warehouseLogs) => {
    if (!searchQuery.trim()) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(log => {
      const productName = getProductName(log.productId).toLowerCase();
      return productName.includes(query) || log.note.toLowerCase().includes(query);
    });
  };

  // Combined filtering
  const filteredLogs = useMemo(() => {
    return getFilteredBySearch(getFilteredByDate(warehouseLogs));
  }, [warehouseLogs, dateFilter, searchQuery, products]);

  const incomingLogs = filteredLogs.filter(l => l.type === 'incoming');
  const outgoingLogs = filteredLogs.filter(l => l.type === 'outgoing');

  const totalIncoming = incomingLogs.reduce((sum, l) => sum + l.total, 0);
  const totalOutgoing = outgoingLogs.reduce((sum, l) => sum + l.total, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  // Low stock products (less than 20)
  const lowStockProducts = products.filter(p => p.stock < 20 && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const notifications = [...outOfStockProducts.map(p => ({ 
    type: 'danger' as const, 
    message: `${p.title} - Tugagan!`,
    product: p
  })), ...lowStockProducts.map(p => ({ 
    type: 'warning' as const, 
    message: `${p.title} - Faqat ${p.stock} dona qoldi`,
    product: p
  }))];

  // Chart data - last 7 days
  const chartData = useMemo(() => {
    const days: { [key: string]: { date: string; kirim: number; chiqim: number } } = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = format(date, 'yyyy-MM-dd');
      days[key] = { date: format(date, 'dd MMM'), kirim: 0, chiqim: 0 };
    }
    
    // Fill with actual data
    warehouseLogs.forEach(log => {
      const key = format(parseISO(log.createdAt), 'yyyy-MM-dd');
      if (days[key]) {
        if (log.type === 'incoming') {
          days[key].kirim += log.total;
        } else {
          days[key].chiqim += log.total;
        }
      }
    });
    
    return Object.values(days);
  }, [warehouseLogs]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Turi', 'Mahsulot', 'Miqdor', 'Narx', 'Jami', 'Izoh', 'Sana'];
    const rows = filteredLogs.map(log => [
      log.type === 'incoming' ? 'Kirim' : 'Chiqim',
      getProductName(log.productId),
      log.quantity,
      log.pricePerUnit,
      log.total,
      log.note,
      formatDate(log.createdAt)
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ombor_hisobot_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast({ title: 'Muvaffaqiyatli!', description: 'CSV fayl yuklab olindi' });
  };

  // Export to printable HTML (PDF alternative)
  const exportToPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ombor Hisoboti - ${format(new Date(), 'dd.MM.yyyy')}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          .summary { margin: 20px 0; display: flex; gap: 40px; }
          .summary-item { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
          .kirim { color: green; }
          .chiqim { color: red; }
        </style>
      </head>
      <body>
        <h1>Ombor Hisoboti</h1>
        <p>Sana: ${format(new Date(), 'dd.MM.yyyy HH:mm')}</p>
        <div class="summary">
          <div class="summary-item"><strong>Jami zaxira:</strong> ${totalStock.toLocaleString()} dona</div>
          <div class="summary-item"><strong>Jami kirim:</strong> <span class="kirim">${totalIncoming.toLocaleString()} so'm</span></div>
          <div class="summary-item"><strong>Jami chiqim:</strong> <span class="chiqim">${totalOutgoing.toLocaleString()} so'm</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Turi</th>
              <th>Mahsulot</th>
              <th>Miqdor</th>
              <th>Narx</th>
              <th>Jami</th>
              <th>Izoh</th>
              <th>Sana</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLogs.slice().reverse().map(log => `
              <tr>
                <td class="${log.type === 'incoming' ? 'kirim' : 'chiqim'}">${log.type === 'incoming' ? 'Kirim' : 'Chiqim'}</td>
                <td>${getProductName(log.productId)}</td>
                <td>${log.quantity} dona</td>
                <td>${log.pricePerUnit.toLocaleString()} so'm</td>
                <td><strong>${log.total.toLocaleString()} so'm</strong></td>
                <td>${log.note}</td>
                <td>${formatDate(log.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    
    toast({ title: 'Muvaffaqiyatli!', description: 'Hisobot chop etishga tayyor' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Ombor</h1>
            <p className="text-muted-foreground">Kirim va chiqim operatsiyalari</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications Bell */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className={notifications.length > 0 ? 'border-orange-300' : ''}
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
                  <div className="p-3 border-b flex justify-between items-center">
                    <h3 className="font-semibold">Bildirishnomalar</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Yangi bildirishnomalar yo'q
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notif, i) => (
                        <div key={i} className={`p-3 flex items-start gap-3 ${notif.type === 'danger' ? 'bg-red-50 dark:bg-red-950/20' : 'bg-yellow-50 dark:bg-yellow-950/20'}`}>
                          <AlertTriangle className={`w-5 h-5 mt-0.5 ${notif.type === 'danger' ? 'text-red-500' : 'text-yellow-500'}`} />
                          <div>
                            <p className="text-sm font-medium">{notif.message}</p>
                            <p className="text-xs text-muted-foreground">Zaxira kam</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Export Buttons */}
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
            <Button variant="outline" onClick={exportToPrint} className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            
            {/* Add Operation */}
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Yangi operatsiya
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">Ombor operatsiyasi</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Operatsiya turi</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: 'incoming' | 'outgoing') => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incoming">
                          <div className="flex items-center gap-2">
                            <ArrowDownCircle className="w-4 h-4 text-green-500" />
                            Kirim
                          </div>
                        </SelectItem>
                        <SelectItem value="outgoing">
                          <div className="flex items-center gap-2">
                            <ArrowUpCircle className="w-4 h-4 text-red-500" />
                            Chiqim
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mahsulot</Label>
                    <Select 
                      value={formData.productId} 
                      onValueChange={(value) => setFormData({ ...formData, productId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.title} (Zaxira: {product.stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Miqdor</Label>
                      <Input 
                        type="number"
                        min="1"
                        value={formData.quantity} 
                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Narx (dona)</Label>
                      <Input 
                        type="number"
                        min="0"
                        value={formData.pricePerUnit} 
                        onChange={(e) => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })}
                        required 
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Jami summa:</p>
                    <p className="text-lg font-bold">
                      {(formData.quantity * formData.pricePerUnit).toLocaleString()} so'm
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Izoh</Label>
                    <Textarea 
                      value={formData.note} 
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Qo'shimcha ma'lumot..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Bekor qilish</Button>
                    <Button type="submit">Saqlash</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Low Stock Alert Banner */}
        {(outOfStockProducts.length > 0 || lowStockProducts.length > 0) && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Zaxira ogohlantirishi
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  {outOfStockProducts.length > 0 && `${outOfStockProducts.length} ta mahsulot tugagan. `}
                  {lowStockProducts.length > 0 && `${lowStockProducts.length} ta mahsulotda zaxira kam.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jami zaxira</CardTitle>
              <Package className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock.toLocaleString()} dona</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jami kirim</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalIncoming.toLocaleString()} so'm</div>
            </CardContent>
          </Card>
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jami chiqim</CardTitle>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalOutgoing.toLocaleString()} so'm</div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kirim/Chiqim dinamikasi (7 kun)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString()} so'm`}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="kirim" stroke="#22c55e" strokeWidth={2} name="Kirim" />
                  <Line type="monotone" dataKey="chiqim" stroke="#ef4444" strokeWidth={2} name="Chiqim" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Mahsulot qidirish..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={dateFilter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setDateFilter('all')}
            >
              Barchasi
            </Button>
            <Button 
              variant={dateFilter === 'today' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setDateFilter('today')}
              className="gap-1"
            >
              <Calendar className="w-3 h-3" />
              Bugun
            </Button>
            <Button 
              variant={dateFilter === 'week' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setDateFilter('week')}
            >
              Hafta
            </Button>
            <Button 
              variant={dateFilter === 'month' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setDateFilter('month')}
            >
              Oy
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Barchasi ({filteredLogs.length})</TabsTrigger>
            <TabsTrigger value="incoming">Kirim ({incomingLogs.length})</TabsTrigger>
            <TabsTrigger value="outgoing">Chiqim ({outgoingLogs.length})</TabsTrigger>
            <TabsTrigger value="inventory">Inventar</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="border rounded-lg mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turi</TableHead>
                  <TableHead>Mahsulot</TableHead>
                  <TableHead>Miqdor</TableHead>
                  <TableHead>Narx</TableHead>
                  <TableHead>Jami</TableHead>
                  <TableHead>Izoh</TableHead>
                  <TableHead>Sana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Ma'lumot topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.slice().reverse().map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {log.type === 'incoming' ? (
                          <Badge className="bg-green-500">Kirim</Badge>
                        ) : (
                          <Badge className="bg-red-500">Chiqim</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{getProductName(log.productId)}</TableCell>
                      <TableCell>{log.quantity} dona</TableCell>
                      <TableCell>{log.pricePerUnit.toLocaleString()} so'm</TableCell>
                      <TableCell className="font-semibold">{log.total.toLocaleString()} so'm</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">{log.note}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(log.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="incoming" className="border rounded-lg mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mahsulot</TableHead>
                  <TableHead>Miqdor</TableHead>
                  <TableHead>Narx</TableHead>
                  <TableHead>Jami</TableHead>
                  <TableHead>Izoh</TableHead>
                  <TableHead>Sana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomingLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Ma'lumot topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  incomingLogs.slice().reverse().map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{getProductName(log.productId)}</TableCell>
                      <TableCell>{log.quantity} dona</TableCell>
                      <TableCell>{log.pricePerUnit.toLocaleString()} so'm</TableCell>
                      <TableCell className="font-semibold text-green-600">{log.total.toLocaleString()} so'm</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">{log.note}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(log.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="outgoing" className="border rounded-lg mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mahsulot</TableHead>
                  <TableHead>Miqdor</TableHead>
                  <TableHead>Narx</TableHead>
                  <TableHead>Jami</TableHead>
                  <TableHead>Izoh</TableHead>
                  <TableHead>Sana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outgoingLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Ma'lumot topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  outgoingLogs.slice().reverse().map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{getProductName(log.productId)}</TableCell>
                      <TableCell>{log.quantity} dona</TableCell>
                      <TableCell>{log.pricePerUnit.toLocaleString()} so'm</TableCell>
                      <TableCell className="font-semibold text-red-600">{log.total.toLocaleString()} so'm</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">{log.note}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(log.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="inventory" className="border rounded-lg mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mahsulot</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Zaxirada</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className={product.stock === 0 ? 'bg-red-50 dark:bg-red-950/20' : product.stock < 20 ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                    <TableCell className="font-semibold">{product.stock} dona</TableCell>
                    <TableCell>
                      {product.stock === 0 ? (
                        <Badge variant="destructive">Tugagan</Badge>
                      ) : product.stock < 20 ? (
                        <Badge className="bg-yellow-500">Kam qoldi</Badge>
                      ) : (
                        <Badge className="bg-green-500">Yetarli</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminWarehouse;