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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, ArrowDownCircle, ArrowUpCircle, Package, TrendingUp, TrendingDown } from 'lucide-react';

const AdminWarehouse = () => {
  const { products, warehouseLogs, addWarehouseLog } = useErp();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
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

  const incomingLogs = warehouseLogs.filter(l => l.type === 'incoming');
  const outgoingLogs = warehouseLogs.filter(l => l.type === 'outgoing');

  const totalIncoming = incomingLogs.reduce((sum, l) => sum + l.total, 0);
  const totalOutgoing = outgoingLogs.reduce((sum, l) => sum + l.total, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ombor</h1>
            <p className="text-muted-foreground">Kirim va chiqim operatsiyalari</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Yangi operatsiya
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ombor operatsiyasi</DialogTitle>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jami kirim</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalIncoming.toLocaleString()} so'm</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Jami chiqim</CardTitle>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalOutgoing.toLocaleString()} so'm</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Barchasi ({warehouseLogs.length})</TabsTrigger>
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
                {warehouseLogs.slice().reverse().map((log) => (
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
                ))}
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
                {incomingLogs.slice().reverse().map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{getProductName(log.productId)}</TableCell>
                    <TableCell>{log.quantity} dona</TableCell>
                    <TableCell>{log.pricePerUnit.toLocaleString()} so'm</TableCell>
                    <TableCell className="font-semibold text-green-600">{log.total.toLocaleString()} so'm</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{log.note}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
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
                {outgoingLogs.slice().reverse().map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{getProductName(log.productId)}</TableCell>
                    <TableCell>{log.quantity} dona</TableCell>
                    <TableCell>{log.pricePerUnit.toLocaleString()} so'm</TableCell>
                    <TableCell className="font-semibold text-red-600">{log.total.toLocaleString()} so'm</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{log.note}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
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
                  <TableRow key={product.id}>
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
