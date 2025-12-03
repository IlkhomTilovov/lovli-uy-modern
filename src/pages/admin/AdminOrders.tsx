import { useState } from 'react';
import { useErp } from '@/contexts/ErpContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Eye, Package } from 'lucide-react';
import { Order, OrderStatus } from '@/types/erp';

const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
  new: { label: 'Yangi', color: 'bg-yellow-500' },
  accepted: { label: 'Qabul qilindi', color: 'bg-blue-500' },
  preparing: { label: 'Tayyorlanmoqda', color: 'bg-purple-500' },
  delivered: { label: 'Yetkazildi', color: 'bg-green-500' },
  cancelled: { label: 'Bekor qilindi', color: 'bg-red-500' },
};

const AdminOrders = () => {
  const { orders, orderItems, products, updateOrderStatus } = useErp();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Buyurtmalar</h1>
            <p className="text-muted-foreground">Jami: {orders.length} ta buyurtma</p>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter" />
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
              {filteredOrders.map((order) => (
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
              ))}
            </TableBody>
          </Table>
        </div>

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
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
