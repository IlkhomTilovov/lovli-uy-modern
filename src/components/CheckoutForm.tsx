import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Loader2, MapPin, Phone, User } from "lucide-react";

const checkoutSchema = z.object({
  fullName: z.string().min(3, "Ism kamida 3 ta belgidan iborat bo'lishi kerak").max(100),
  phone: z.string().min(9, "Telefon raqamini to'liq kiriting").max(20),
  region: z.string().min(2, "Viloyatni kiriting").max(100),
  city: z.string().min(2, "Shahar/tumanni kiriting").max(100),
  address: z.string().min(5, "Manzilni to'liq kiriting").max(500),
  comment: z.string().max(500).optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CheckoutForm = ({ open, onOpenChange }: CheckoutFormProps) => {
  const { items, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "+998",
      region: "",
      city: "",
      address: "",
      comment: "",
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: data.fullName,
          phone: data.phone,
          region: data.region,
          city: data.city,
          address: data.address,
          comment: data.comment || null,
          total_price: totalPrice,
          status: 'new',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_title: item.title,
        quantity: item.quantity,
        price_at_moment: item.price,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send Telegram notification
      try {
        await supabase.functions.invoke('telegram-notify', {
          body: {
            id: order.id,
            customer_name: data.fullName,
            phone: data.phone,
            region: data.region,
            city: data.city,
            address: data.address,
            comment: data.comment,
            total_price: totalPrice,
            items: items.map(item => ({
              product_title: item.title,
              quantity: item.quantity,
              price_at_moment: item.price,
              subtotal: item.price * item.quantity,
            })),
            created_at: order.created_at,
          },
        });
        console.log('Telegram notification sent successfully');
      } catch (telegramError) {
        console.error('Failed to send Telegram notification:', telegramError);
        // Don't throw - order was successful, just notification failed
      }

      setOrderId(order.id);
      setIsSuccess(true);
      
      // Save phone to localStorage for order tracking
      localStorage.setItem('lastOrderPhone', data.phone);
      
      setTimeout(() => {
        clearCart();
        setIsSuccess(false);
        onOpenChange(false);
        form.reset();
        toast.success("Buyurtmangiz qabul qilindi! Tez orada siz bilan bog'lanamiz.");
      }, 2000);
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Buyurtma Qabul Qilindi!</h3>
            <p className="text-muted-foreground">
              Tez orada operatorimiz siz bilan bog'lanadi
            </p>
            {orderId && (
              <p className="text-sm text-muted-foreground mt-2">
                Buyurtma raqami: <span className="font-mono">{orderId.slice(0, 8).toUpperCase()}</span>
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Buyurtma Berish</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <User className="h-5 w-5" />
                <span className="font-semibold">Shaxsiy Ma'lumotlar</span>
              </div>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ism Familiya *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ism Familiya" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon Raqam *</FormLabel>
                    <FormControl>
                      <Input placeholder="+998 90 123 45 67" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Delivery Address */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-primary">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">Yetkazib Berish Manzili</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Viloyat *</FormLabel>
                      <FormControl>
                        <Input placeholder="Toshkent" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shahar/Tuman *</FormLabel>
                      <FormControl>
                        <Input placeholder="Chilonzor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To'liq Manzil *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ko'cha, uy, xonadon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Izoh (ixtiyoriy)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Qo'shimcha ma'lumotlar..."
                        className="resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Order Summary */}
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mahsulotlar ({items.length}):</span>
                <span className="font-medium">{totalPrice.toLocaleString()} so'm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Yetkazib berish:</span>
                <span className="font-medium text-green-600">Bepul</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold">Jami:</span>
                <span className="font-bold text-lg text-primary">{totalPrice.toLocaleString()} so'm</span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yuborilmoqda...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Buyurtma Berish
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};