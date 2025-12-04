import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Package, Clock, CheckCircle, Truck, XCircle, Phone } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: "Yangi", color: "bg-blue-500", icon: <Clock className="h-4 w-4" /> },
  accepted: { label: "Qabul qilindi", color: "bg-yellow-500", icon: <CheckCircle className="h-4 w-4" /> },
  preparing: { label: "Tayyorlanmoqda", color: "bg-orange-500", icon: <Package className="h-4 w-4" /> },
  delivered: { label: "Yetkazildi", color: "bg-green-500", icon: <Truck className="h-4 w-4" /> },
  cancelled: { label: "Bekor qilindi", color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
};

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
  total_price: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function Orders() {
  const [phone, setPhone] = useState(() => localStorage.getItem('lastOrderPhone') || '');
  const [searchPhone, setSearchPhone] = useState(() => localStorage.getItem('lastOrderPhone') || '');

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders', searchPhone],
    queryFn: async () => {
      if (!searchPhone || searchPhone.length < 9) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('phone', searchPhone)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: searchPhone.length >= 9,
  });

  const handleSearch = () => {
    setSearchPhone(phone);
    localStorage.setItem('lastOrderPhone', phone);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Buyurtmalar Tarixi</h1>
          
          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5" />
                Telefon raqam orqali qidirish
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Qidirish
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Buyurtma berishda ishlatgan telefon raqamingizni kiriting
              </p>
            </CardContent>
          </Card>

          {/* Orders List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-1/3 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.new;
                return (
                  <Card key={order.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-mono">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('uz-UZ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <Badge className={`${status.color} text-white flex items-center gap-1`}>
                          {status.icon}
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Order Items */}
                      <div className="border rounded-lg divide-y mb-4">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.product_title}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} x {item.price_at_moment.toLocaleString()} so'm
                              </p>
                            </div>
                            <span className="font-semibold">
                              {item.subtotal.toLocaleString()} so'm
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address */}
                      <div className="text-sm text-muted-foreground mb-3">
                        <strong>Manzil:</strong> {order.region}, {order.city}, {order.address}
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="font-semibold">Jami:</span>
                        <span className="text-xl font-bold text-primary">
                          {order.total_price.toLocaleString()} so'm
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : searchPhone.length >= 9 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Buyurtmalar topilmadi</h3>
                <p className="text-muted-foreground">
                  Bu telefon raqami bo'yicha buyurtmalar mavjud emas
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Telefon raqamni kiriting</h3>
                <p className="text-muted-foreground">
                  Buyurtmalaringizni ko'rish uchun telefon raqamingizni kiriting
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}