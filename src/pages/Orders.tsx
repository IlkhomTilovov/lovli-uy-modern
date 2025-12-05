import { useState, useEffect } from "react";
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

type Language = "uz" | "ru";
const LANGUAGE_KEY = "site_language";

const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === "uz" || saved === "ru") return saved;
  }
  return "uz";
};

const translations = {
  uz: {
    title: "Buyurtmalar Tarixi",
    searchTitle: "Telefon raqam orqali qidirish",
    searchPlaceholder: "+998 90 123 45 67",
    searchButton: "Qidirish",
    searchHint: "Buyurtma berishda ishlatgan telefon raqamingizni kiriting",
    address: "Manzil",
    total: "Jami",
    currency: "so'm",
    noOrders: "Buyurtmalar topilmadi",
    noOrdersDesc: "Bu telefon raqami bo'yicha buyurtmalar mavjud emas",
    enterPhone: "Telefon raqamni kiriting",
    enterPhoneDesc: "Buyurtmalaringizni ko'rish uchun telefon raqamingizni kiriting",
    statuses: {
      new: "Yangi",
      accepted: "Qabul qilindi",
      preparing: "Tayyorlanmoqda",
      delivered: "Yetkazildi",
      cancelled: "Bekor qilindi"
    }
  },
  ru: {
    title: "История заказов",
    searchTitle: "Поиск по номеру телефона",
    searchPlaceholder: "+998 90 123 45 67",
    searchButton: "Поиск",
    searchHint: "Введите номер телефона, который вы использовали при оформлении заказа",
    address: "Адрес",
    total: "Итого",
    currency: "сум",
    noOrders: "Заказы не найдены",
    noOrdersDesc: "По этому номеру телефона заказов нет",
    enterPhone: "Введите номер телефона",
    enterPhoneDesc: "Введите номер телефона, чтобы просмотреть свои заказы",
    statuses: {
      new: "Новый",
      accepted: "Принят",
      preparing: "Готовится",
      delivered: "Доставлен",
      cancelled: "Отменён"
    }
  }
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
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  // Listen for language changes from Navbar
  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail);
    };
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, []);

  const t = translations[language];

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    new: { label: t.statuses.new, color: "bg-blue-500", icon: <Clock className="h-4 w-4" /> },
    accepted: { label: t.statuses.accepted, color: "bg-yellow-500", icon: <CheckCircle className="h-4 w-4" /> },
    preparing: { label: t.statuses.preparing, color: "bg-orange-500", icon: <Package className="h-4 w-4" /> },
    delivered: { label: t.statuses.delivered, color: "bg-green-500", icon: <Truck className="h-4 w-4" /> },
    cancelled: { label: t.statuses.cancelled, color: "bg-red-500", icon: <XCircle className="h-4 w-4" /> },
  };

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
          <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
          
          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5" />
                {t.searchTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder={t.searchPlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  {t.searchButton}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t.searchHint}
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
                            {new Date(order.created_at).toLocaleDateString(language === "uz" ? 'uz-UZ' : 'ru-RU', {
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
                                {item.quantity} x {item.price_at_moment.toLocaleString()} {t.currency}
                              </p>
                            </div>
                            <span className="font-semibold">
                              {item.subtotal.toLocaleString()} {t.currency}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Address */}
                      <div className="text-sm text-muted-foreground mb-3">
                        <strong>{t.address}:</strong> {order.region}, {order.city}, {order.address}
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="font-semibold">{t.total}:</span>
                        <span className="text-xl font-bold text-primary">
                          {order.total_price.toLocaleString()} {t.currency}
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
                <h3 className="text-xl font-semibold mb-2">{t.noOrders}</h3>
                <p className="text-muted-foreground">
                  {t.noOrdersDesc}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t.enterPhone}</h3>
                <p className="text-muted-foreground">
                  {t.enterPhoneDesc}
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