import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { CheckoutForm } from "@/components/CheckoutForm";

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
    emptyCart: "Savatingiz Bo'sh",
    emptyCartDescription: "Mahsulotlar qo'shish uchun katalogga o'ting",
    viewCatalog: "Katalogni Ko'rish",
    ordersHistory: "Buyurtmalar Tarixi",
    continueShopping: "Xaridni davom ettirish",
    cartTitle: "Savat",
    products: "ta mahsulot",
    remove: "O'chirish",
    total: "Jami",
    clearCart: "Savatchani tozalash",
    orderInfo: "Buyurtma Ma'lumotlari",
    productsCount: "Mahsulotlar",
    delivery: "Yetkazib berish",
    free: "Bepul",
    totalPrice: "Jami",
    placeOrder: "Buyurtma Berish",
    continueShoppingBtn: "Xaridni Davom Ettirish",
    currency: "so'm"
  },
  ru: {
    emptyCart: "Ваша корзина пуста",
    emptyCartDescription: "Перейдите в каталог, чтобы добавить товары",
    viewCatalog: "Смотреть каталог",
    ordersHistory: "История заказов",
    continueShopping: "Продолжить покупки",
    cartTitle: "Корзина",
    products: "товаров",
    remove: "Удалить",
    total: "Итого",
    clearCart: "Очистить корзину",
    orderInfo: "Информация о заказе",
    productsCount: "Товары",
    delivery: "Доставка",
    free: "Бесплатно",
    totalPrice: "Итого",
    placeOrder: "Оформить заказ",
    continueShoppingBtn: "Продолжить покупки",
    currency: "сум"
  }
};

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">{t.emptyCart}</h2>
            <p className="text-muted-foreground mb-8">
              {t.emptyCartDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/catalog">{t.viewCatalog}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/orders">{t.ordersHistory}</Link>
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="bg-secondary/30 py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <Button asChild variant="ghost" className="mb-4">
              <Link to="/catalog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.continueShopping}
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{t.cartTitle} ({items.length} {t.products})</h1>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-4 flex gap-4"
                >
                  {/* Product Image */}
                  <Link to={`/product/${item.id}`} className="shrink-0">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.id}`}>
                      <h3 className="font-semibold text-lg truncate hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-bold text-primary">
                        {item.price.toLocaleString()} {t.currency}
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {item.originalPrice.toLocaleString()} {t.currency}
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border border-border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t.remove}
                      </Button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-muted-foreground">{t.total}</p>
                    <p className="text-lg font-bold">
                      {(item.price * item.quantity).toLocaleString()} {t.currency}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Clear Cart Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  variant="outline" 
                  className="text-destructive hover:text-destructive"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t.clearCart}
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div>
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-card border border-border rounded-xl p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold mb-6">{t.orderInfo}</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.productsCount} ({items.length}):</span>
                    <span className="font-semibold">{totalPrice.toLocaleString()} {t.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.delivery}:</span>
                    <span className="font-semibold text-green-600">{t.free}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold text-lg">{t.totalPrice}:</span>
                    <span className="font-bold text-2xl text-primary">{totalPrice.toLocaleString()} {t.currency}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                  size="lg"
                  onClick={() => setCheckoutOpen(true)}
                >
                  {t.placeOrder}
                </Button>

                <CheckoutForm open={checkoutOpen} onOpenChange={setCheckoutOpen} />

                <Button asChild variant="outline" className="w-full mt-3">
                  <Link to="/catalog">{t.continueShoppingBtn}</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;