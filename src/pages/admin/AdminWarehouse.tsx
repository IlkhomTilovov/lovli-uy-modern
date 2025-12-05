import { useState, useMemo } from 'react';
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
  Search, FileSpreadsheet, FileText, Bell, AlertTriangle, Calendar,
  X, RotateCcw, ClipboardCheck, Truck, Users, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfDay, startOfWeek, startOfMonth, isAfter, parseISO } from 'date-fns';
import { useProducts } from '@/hooks/useProducts';
import { 
  useSuppliers, useAddSupplier, useUpdateSupplier, useDeleteSupplier,
  useWarehouseLogs, useAddWarehouseLog,
  useInventoryAudits, useAddInventoryAudit, useUpdateInventoryAudit,
  Supplier, WarehouseLog, InventoryAudit
} from '@/hooks/useWarehouse';

const AdminWarehouse = () => {
  // Use Supabase data for everything
  const { data: dbProducts = [], isLoading: productsLoading } = useProducts();
  const { data: dbSuppliers = [], isLoading: suppliersLoading } = useSuppliers();
  const { data: dbWarehouseLogs = [], isLoading: logsLoading } = useWarehouseLogs();
  const { data: dbInventoryAudits = [], isLoading: auditsLoading } = useInventoryAudits();
  
  // Mutations
  const addSupplierMutation = useAddSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();
  const addWarehouseLogMutation = useAddWarehouseLog();
  const addInventoryAuditMutation = useAddInventoryAudit();
  const updateInventoryAuditMutation = useUpdateInventoryAudit();
  
  const { toast } = useToast();
  
  // Transform DB data to match expected format
  const products = dbProducts.map(p => ({
    id: p.id,
    title: p.title,
    stock: p.stock,
    sku: p.sku,
    retailPrice: p.retail_price,
    minStock: 20,
  }));
  
  const suppliers = dbSuppliers.map(s => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    email: s.email || undefined,
    address: s.address || undefined,
    contactPerson: s.contact_person || undefined,
    status: s.status as 'active' | 'inactive',
  }));
  
  const warehouseLogs = dbWarehouseLogs.map(l => ({
    id: l.id,
    productId: l.product_id || '',
    type: l.type as 'incoming' | 'outgoing' | 'return' | 'adjustment',
    quantity: l.quantity,
    pricePerUnit: Number(l.price_per_unit),
    total: Number(l.total),
    note: l.note || '',
    supplierId: l.supplier_id || undefined,
    batchNumber: l.batch_number || undefined,
    expiryDate: l.expiry_date || undefined,
    createdAt: l.created_at,
  }));
  
  const inventoryAudits = dbInventoryAudits.map(a => ({
    id: a.id,
    productId: a.product_id || '',
    expectedStock: a.expected_stock,
    actualStock: a.actual_stock,
    difference: a.difference,
    note: a.note || '',
    status: a.status as 'pending' | 'approved' | 'rejected',
    approvedBy: a.approved_by || undefined,
    createdAt: a.created_at,
  }));

  const isLoading = productsLoading || suppliersLoading || logsLoading || auditsLoading;
  
  // Dialog states
  const [isOperationOpen, setIsOperationOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Form states
  const [operationForm, setOperationForm] = useState({
    productId: '',
    type: 'incoming' as 'incoming' | 'outgoing' | 'return' | 'adjustment',
    quantity: 0,
    pricePerUnit: 0,
    note: '',
    supplierId: '',
    batchNumber: '',
    expiryDate: '',
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    contactPerson: '',
  });
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);

  const [auditForm, setAuditForm] = useState({
    productId: '',
    actualStock: 0,
    note: '',
  });

  // Reset forms
  const resetOperationForm = () => {
    setOperationForm({ productId: '', type: 'incoming', quantity: 0, pricePerUnit: 0, note: '', supplierId: '', batchNumber: '', expiryDate: '' });
  };

  const resetSupplierForm = () => {
    setSupplierForm({ name: '', phone: '', email: '', address: '', contactPerson: '' });
    setEditingSupplierId(null);
  };

  const resetAuditForm = () => {
    setAuditForm({ productId: '', actualStock: 0, note: '' });
  };

  // Submit handlers
  const handleOperationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === operationForm.productId);
    if (operationForm.type === 'outgoing' && product && product.stock < operationForm.quantity) {
      toast({ title: 'Xatolik!', description: 'Omborda yetarli mahsulot yo\'q', variant: 'destructive' });
      return;
    }

    const total = operationForm.quantity * operationForm.pricePerUnit;
    addWarehouseLogMutation.mutate({
      product_id: operationForm.productId || null,
      type: operationForm.type,
      quantity: operationForm.quantity,
      price_per_unit: operationForm.pricePerUnit,
      total: total,
      note: operationForm.note || null,
      supplier_id: operationForm.supplierId || null,
      batch_number: operationForm.batchNumber || null,
      expiry_date: operationForm.expiryDate || null,
      created_by: null,
    });
    
    setIsOperationOpen(false);
    resetOperationForm();
  };

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSupplierId) {
      updateSupplierMutation.mutate({
        id: editingSupplierId,
        name: supplierForm.name,
        phone: supplierForm.phone,
        email: supplierForm.email || null,
        address: supplierForm.address || null,
        contact_person: supplierForm.contactPerson || null,
      });
    } else {
      addSupplierMutation.mutate({
        name: supplierForm.name,
        phone: supplierForm.phone,
        email: supplierForm.email || null,
        address: supplierForm.address || null,
        contact_person: supplierForm.contactPerson || null,
        status: 'active',
      });
    }
    setIsSupplierOpen(false);
    resetSupplierForm();
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === auditForm.productId);
    if (!product) return;

    addInventoryAuditMutation.mutate({
      product_id: auditForm.productId || null,
      expected_stock: product.stock,
      actual_stock: auditForm.actualStock,
      difference: auditForm.actualStock - product.stock,
      note: auditForm.note || null,
      status: 'pending',
      approved_by: null,
    });
    
    setIsAuditOpen(false);
    resetAuditForm();
  };

  const handleApproveAudit = (id: string) => {
    updateInventoryAuditMutation.mutate({ id, status: 'approved', approved_by: 'Admin' });
    toast({ title: 'Muvaffaqiyatli!', description: 'Inventarizatsiya tasdiqlandi' });
  };

  const handleRejectAudit = (id: string) => {
    updateInventoryAuditMutation.mutate({ id, status: 'rejected' });
    toast({ title: 'Bekor qilindi', description: 'Inventarizatsiya rad etildi' });
  };

  const editSupplier = (supplier: typeof suppliers[0]) => {
    setSupplierForm({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      contactPerson: supplier.contactPerson || '',
    });
    setEditingSupplierId(supplier.id);
    setIsSupplierOpen(true);
  };

  // Helpers
  const getProductName = (productId: string) => products.find(p => p.id === productId)?.title || 'Noma\'lum';
  const getSupplierName = (supplierId?: string) => supplierId ? suppliers.find(s => s.id === supplierId)?.name || '-' : '-';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Filtering
  const getFilteredByDate = (logs: typeof warehouseLogs) => {
    if (dateFilter === 'all') return logs;
    const now = new Date();
    let startDate: Date;
    switch (dateFilter) {
      case 'today': startDate = startOfDay(now); break;
      case 'week': startDate = startOfWeek(now, { weekStartsOn: 1 }); break;
      case 'month': startDate = startOfMonth(now); break;
      default: return logs;
    }
    return logs.filter(log => isAfter(parseISO(log.createdAt), startDate));
  };

  const getFilteredBySearch = (logs: typeof warehouseLogs) => {
    if (!searchQuery.trim()) return logs;
    const query = searchQuery.toLowerCase();
    return logs.filter(log => {
      const productName = getProductName(log.productId).toLowerCase();
      return productName.includes(query) || log.note.toLowerCase().includes(query);
    });
  };

  const filteredLogs = useMemo(() => getFilteredBySearch(getFilteredByDate(warehouseLogs)), [warehouseLogs, dateFilter, searchQuery, products]);

  const incomingLogs = filteredLogs.filter(l => l.type === 'incoming');
  const outgoingLogs = filteredLogs.filter(l => l.type === 'outgoing');
  const returnLogs = filteredLogs.filter(l => l.type === 'return');

  const totalIncoming = incomingLogs.reduce((sum, l) => sum + l.total, 0);
  const totalOutgoing = outgoingLogs.reduce((sum, l) => sum + l.total, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  // Low stock with minStock
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 20));
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const notifications = [
    ...outOfStockProducts.map(p => ({ type: 'danger' as const, message: `${p.title} - Tugagan!`, product: p })),
    ...lowStockProducts.map(p => ({ type: 'warning' as const, message: `${p.title} - Faqat ${p.stock} dona (min: ${p.minStock || 20})`, product: p }))
  ];

  // Chart data
  const chartData = useMemo(() => {
    const days: { [key: string]: { date: string; kirim: number; chiqim: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = format(date, 'yyyy-MM-dd');
      days[key] = { date: format(date, 'dd MMM'), kirim: 0, chiqim: 0 };
    }
    warehouseLogs.forEach(log => {
      const key = format(parseISO(log.createdAt), 'yyyy-MM-dd');
      if (days[key]) {
        if (log.type === 'incoming' || log.type === 'return') days[key].kirim += log.total;
        else if (log.type === 'outgoing') days[key].chiqim += log.total;
      }
    });
    return Object.values(days);
  }, [warehouseLogs]);

  // Export functions
  const exportToCSV = () => {
    const headers = ['Turi', 'Mahsulot', 'Miqdor', 'Narx', 'Jami', 'Yetkazuvchi', 'Partiya', 'Izoh', 'Sana'];
    const rows = filteredLogs.map(log => [
      log.type === 'incoming' ? 'Kirim' : log.type === 'outgoing' ? 'Chiqim' : log.type === 'return' ? 'Qaytarish' : 'Tuzatish',
      getProductName(log.productId),
      log.quantity, log.pricePerUnit, log.total,
      getSupplierName(log.supplierId), log.batchNumber || '-', log.note, formatDate(log.createdAt)
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ombor_hisobot_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast({ title: 'Muvaffaqiyatli!', description: 'CSV fayl yuklab olindi' });
  };

  const exportToPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `<!DOCTYPE html><html><head><title>Ombor Hisoboti</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f4f4f4}.kirim{color:green}.chiqim{color:red}</style></head><body><h1>Ombor Hisoboti</h1><p>Sana: ${format(new Date(), 'dd.MM.yyyy HH:mm')}</p><table><thead><tr><th>Turi</th><th>Mahsulot</th><th>Miqdor</th><th>Jami</th><th>Yetkazuvchi</th><th>Partiya</th><th>Sana</th></tr></thead><tbody>${filteredLogs.slice().reverse().map(log => `<tr><td class="${log.type === 'incoming' ? 'kirim' : 'chiqim'}">${log.type === 'incoming' ? 'Kirim' : log.type === 'outgoing' ? 'Chiqim' : log.type === 'return' ? 'Qaytarish' : 'Tuzatish'}</td><td>${getProductName(log.productId)}</td><td>${log.quantity}</td><td>${log.total.toLocaleString()}</td><td>${getSupplierName(log.supplierId)}</td><td>${log.batchNumber || '-'}</td><td>${formatDate(log.createdAt)}</td></tr>`).join('')}</tbody></table></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'incoming': return <Badge className="bg-green-500">Kirim</Badge>;
      case 'outgoing': return <Badge className="bg-red-500">Chiqim</Badge>;
      case 'return': return <Badge className="bg-blue-500">Qaytarish</Badge>;
      case 'adjustment': return <Badge className="bg-purple-500">Tuzatish</Badge>;
      default: return <Badge>{type}</Badge>;
    }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Ombor</h1>
            <p className="text-muted-foreground">Kirim, chiqim va inventarizatsiya</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Notifications */}
            <div className="relative">
              <Button variant="outline" size="icon" onClick={() => setShowNotifications(!showNotifications)} className={notifications.length > 0 ? 'border-orange-300' : ''}>
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifications.length}</span>}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
                  <div className="p-3 border-b flex justify-between items-center">
                    <h3 className="font-semibold">Bildirishnomalar</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}><X className="w-4 h-4" /></Button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">Yangi bildirishnomalar yo'q</div>
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

            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" /><span className="hidden sm:inline">Excel</span>
            </Button>
            <Button variant="outline" onClick={exportToPrint} className="gap-2">
              <FileText className="w-4 h-4" /><span className="hidden sm:inline">PDF</span>
            </Button>
            
            <Dialog open={isOperationOpen} onOpenChange={(open) => { setIsOperationOpen(open); if (!open) resetOperationForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" />Yangi operatsiya</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ombor operatsiyasi</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleOperationSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Operatsiya turi</Label>
                    <Select value={operationForm.type} onValueChange={(value: typeof operationForm.type) => setOperationForm({ ...operationForm, type: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incoming"><div className="flex items-center gap-2"><ArrowDownCircle className="w-4 h-4 text-green-500" />Kirim</div></SelectItem>
                        <SelectItem value="outgoing"><div className="flex items-center gap-2"><ArrowUpCircle className="w-4 h-4 text-red-500" />Chiqim</div></SelectItem>
                        <SelectItem value="return"><div className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-blue-500" />Qaytarish</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Mahsulot</Label>
                    <Select value={operationForm.productId} onValueChange={(value) => setOperationForm({ ...operationForm, productId: value })}>
                      <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>{product.title} (Zaxira: {product.stock})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {operationForm.type === 'incoming' && (
                    <div className="space-y-2">
                      <Label>Yetkazib beruvchi</Label>
                      <Select value={operationForm.supplierId} onValueChange={(value) => setOperationForm({ ...operationForm, supplierId: value })}>
                        <SelectTrigger><SelectValue placeholder="Tanlang (ixtiyoriy)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tanlanmagan</SelectItem>
                          {suppliers.filter(s => s.status === 'active').map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Miqdor</Label>
                      <Input type="number" min="1" value={operationForm.quantity} onChange={(e) => setOperationForm({ ...operationForm, quantity: Number(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Narx (dona)</Label>
                      <Input type="number" min="0" value={operationForm.pricePerUnit} onChange={(e) => setOperationForm({ ...operationForm, pricePerUnit: Number(e.target.value) })} required />
                    </div>
                  </div>

                  {operationForm.type === 'incoming' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Partiya raqami</Label>
                        <Input value={operationForm.batchNumber} onChange={(e) => setOperationForm({ ...operationForm, batchNumber: e.target.value })} placeholder="BTH-2024-001" />
                      </div>
                      <div className="space-y-2">
                        <Label>Yaroqlilik muddati</Label>
                        <Input type="date" value={operationForm.expiryDate} onChange={(e) => setOperationForm({ ...operationForm, expiryDate: e.target.value })} />
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Jami summa:</p>
                    <p className="text-lg font-bold">{(operationForm.quantity * operationForm.pricePerUnit).toLocaleString()} so'm</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Izoh</Label>
                    <Textarea value={operationForm.note} onChange={(e) => setOperationForm({ ...operationForm, note: e.target.value })} placeholder="Qo'shimcha ma'lumot..." rows={2} />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsOperationOpen(false)}>Bekor qilish</Button>
                    <Button type="submit">Saqlash</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Low Stock Alert */}
        {notifications.length > 0 && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">Zaxira ogohlantirishi</p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  {outOfStockProducts.length > 0 && `${outOfStockProducts.length} ta mahsulot tugagan. `}
                  {lowStockProducts.length > 0 && `${lowStockProducts.length} ta mahsulotda minimal zaxiradan kam.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jami zaxira</CardTitle>
              <Package className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalStock.toLocaleString()} dona</div></CardContent>
          </Card>
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jami kirim</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{totalIncoming.toLocaleString()} so'm</div></CardContent>
          </Card>
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jami chiqim</CardTitle>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{totalOutgoing.toLocaleString()} so'm</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Yetkazuvchilar</CardTitle>
              <Truck className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{suppliers.filter(s => s.status === 'active').length}</div></CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Kirim/Chiqim dinamikasi (7 kun)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} so'm`} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
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
            <Input placeholder="Mahsulot qidirish..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'today', 'week', 'month'] as const).map(filter => (
              <Button key={filter} variant={dateFilter === filter ? 'default' : 'outline'} size="sm" onClick={() => setDateFilter(filter)} className={filter === 'today' ? 'gap-1' : ''}>
                {filter === 'today' && <Calendar className="w-3 h-3" />}
                {filter === 'all' ? 'Barchasi' : filter === 'today' ? 'Bugun' : filter === 'week' ? 'Hafta' : 'Oy'}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">Barchasi ({filteredLogs.length})</TabsTrigger>
            <TabsTrigger value="incoming">Kirim ({incomingLogs.length})</TabsTrigger>
            <TabsTrigger value="outgoing">Chiqim ({outgoingLogs.length})</TabsTrigger>
            <TabsTrigger value="inventory">Inventar</TabsTrigger>
            <TabsTrigger value="audits">Inventarizatsiya</TabsTrigger>
            <TabsTrigger value="suppliers">Yetkazuvchilar</TabsTrigger>
          </TabsList>

          {/* All Logs Tab */}
          <TabsContent value="all" className="border rounded-lg mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turi</TableHead>
                  <TableHead>Mahsulot</TableHead>
                  <TableHead>Miqdor</TableHead>
                  <TableHead>Jami</TableHead>
                  <TableHead>Yetkazuvchi</TableHead>
                  <TableHead>Partiya</TableHead>
                  <TableHead>Sana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Ma'lumot topilmadi</TableCell></TableRow>
                ) : (
                  filteredLogs.slice().reverse().map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{getTypeBadge(log.type)}</TableCell>
                      <TableCell className="font-medium">{getProductName(log.productId)}</TableCell>
                      <TableCell>{log.quantity} dona</TableCell>
                      <TableCell className="font-semibold">{log.total.toLocaleString()} so'm</TableCell>
                      <TableCell className="text-muted-foreground">{getSupplierName(log.supplierId)}</TableCell>
                      <TableCell className="text-muted-foreground">{log.batchNumber || '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(log.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Incoming Tab */}
          <TabsContent value="incoming" className="border rounded-lg mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mahsulot</TableHead>
                  <TableHead>Miqdor</TableHead>
                  <TableHead>Jami</TableHead>
                  <TableHead>Yetkazuvchi</TableHead>
                  <TableHead>Partiya</TableHead>
                  <TableHead>Yaroqlilik</TableHead>
                  <TableHead>Sana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomingLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Ma'lumot topilmadi</TableCell></TableRow>
                ) : (
                  incomingLogs.slice().reverse().map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{getProductName(log.productId)}</TableCell>
                      <TableCell>{log.quantity} dona</TableCell>
                      <TableCell className="font-semibold text-green-600">{log.total.toLocaleString()} so'm</TableCell>
                      <TableCell>{getSupplierName(log.supplierId)}</TableCell>
                      <TableCell>{log.batchNumber || '-'}</TableCell>
                      <TableCell>{log.expiryDate || '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(log.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Outgoing Tab */}
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
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Ma'lumot topilmadi</TableCell></TableRow>
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

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="border rounded-lg mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mahsulot</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Zaxirada</TableHead>
                  <TableHead>Min. zaxira</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className={product.stock === 0 ? 'bg-red-50 dark:bg-red-950/20' : product.stock <= (product.minStock || 20) ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                    <TableCell className="font-semibold">{product.stock} dona</TableCell>
                    <TableCell className="text-muted-foreground">{product.minStock || 20} dona</TableCell>
                    <TableCell>
                      {product.stock === 0 ? (
                        <Badge variant="destructive">Tugagan</Badge>
                      ) : product.stock <= (product.minStock || 20) ? (
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

          {/* Audits Tab */}
          <TabsContent value="audits" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Dialog open={isAuditOpen} onOpenChange={(open) => { setIsAuditOpen(open); if (!open) resetAuditForm(); }}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><ClipboardCheck className="w-4 h-4" />Yangi inventarizatsiya</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Inventarizatsiya</DialogTitle></DialogHeader>
                  <form onSubmit={handleAuditSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Mahsulot</Label>
                      <Select value={auditForm.productId} onValueChange={(value) => {
                        const product = products.find(p => p.id === value);
                        setAuditForm({ ...auditForm, productId: value, actualStock: product?.stock || 0 });
                      }}>
                        <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>{product.title} (Kutilgan: {product.stock})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Haqiqiy zaxira</Label>
                      <Input type="number" min="0" value={auditForm.actualStock} onChange={(e) => setAuditForm({ ...auditForm, actualStock: Number(e.target.value) })} required />
                    </div>
                    {auditForm.productId && (
                      <div className="p-3 bg-accent/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Farq:</p>
                        <p className={`text-lg font-bold ${auditForm.actualStock - (products.find(p => p.id === auditForm.productId)?.stock || 0) === 0 ? '' : auditForm.actualStock - (products.find(p => p.id === auditForm.productId)?.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {auditForm.actualStock - (products.find(p => p.id === auditForm.productId)?.stock || 0)} dona
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Izoh</Label>
                      <Textarea value={auditForm.note} onChange={(e) => setAuditForm({ ...auditForm, note: e.target.value })} placeholder="Inventarizatsiya sababi..." rows={2} />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsAuditOpen(false)}>Bekor qilish</Button>
                      <Button type="submit">Yaratish</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mahsulot</TableHead>
                    <TableHead>Kutilgan</TableHead>
                    <TableHead>Haqiqiy</TableHead>
                    <TableHead>Farq</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sana</TableHead>
                    <TableHead>Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryAudits.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Inventarizatsiya topilmadi</TableCell></TableRow>
                  ) : (
                    inventoryAudits.slice().reverse().map((audit) => (
                      <TableRow key={audit.id}>
                        <TableCell className="font-medium">{getProductName(audit.productId)}</TableCell>
                        <TableCell>{audit.expectedStock} dona</TableCell>
                        <TableCell>{audit.actualStock} dona</TableCell>
                        <TableCell className={audit.difference === 0 ? '' : audit.difference > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {audit.difference > 0 ? '+' : ''}{audit.difference} dona
                        </TableCell>
                        <TableCell>
                          {audit.status === 'pending' ? <Badge className="bg-yellow-500">Kutilmoqda</Badge> : 
                           audit.status === 'approved' ? <Badge className="bg-green-500">Tasdiqlangan</Badge> : 
                           <Badge variant="destructive">Rad etilgan</Badge>}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDate(audit.createdAt)}</TableCell>
                        <TableCell>
                          {audit.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleApproveAudit(audit.id)}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleRejectAudit(audit.id)}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="mt-4 space-y-4">
            <div className="flex justify-end">
              <Dialog open={isSupplierOpen} onOpenChange={(open) => { setIsSupplierOpen(open); if (!open) resetSupplierForm(); }}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Users className="w-4 h-4" />Yangi yetkazuvchi</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingSupplierId ? 'Yetkazuvchini tahrirlash' : 'Yangi yetkazuvchi'}</DialogTitle></DialogHeader>
                  <form onSubmit={handleSupplierSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nomi *</Label>
                      <Input value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Telefon *</Label>
                        <Input value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Manzil</Label>
                      <Input value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mas'ul shaxs</Label>
                      <Input value={supplierForm.contactPerson} onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsSupplierOpen(false)}>Bekor qilish</Button>
                      <Button type="submit">{editingSupplierId ? 'Yangilash' : 'Qo\'shish'}</Button>
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
                    <TableHead>Telefon</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mas'ul</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Yetkazuvchi topilmadi</TableCell></TableRow>
                  ) : (
                    suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.phone}</TableCell>
                        <TableCell className="text-muted-foreground">{supplier.email || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{supplier.contactPerson || '-'}</TableCell>
                        <TableCell>
                          {supplier.status === 'active' ? <Badge className="bg-green-500">Faol</Badge> : <Badge variant="secondary">Nofaol</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => editSupplier(supplier)}>Tahrirlash</Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteSupplierMutation.mutate(supplier.id)}>O'chirish</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminWarehouse;
