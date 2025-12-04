import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { CheckoutForm } from "@/components/CheckoutForm";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

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
            <h2 className="text-3xl font-bold mb-4">Savatingiz Bo'sh</h2>
            <p className="text-muted-foreground mb-8">
              Mahsulotlar qo'shish uchun katalogga o'ting
            </p>
            <Button asChild size="lg">
              <Link to="/catalog">Katalogni Ko'rish</Link>
            </Button>
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
                Xaridni davom ettirish
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Savat ({items.length} ta mahsulot)</h1>
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
                        {item.price.toLocaleString()} so'm
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {item.originalPrice.toLocaleString()} so'm
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
                        O'chirish
                      </Button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-muted-foreground">Jami</p>
                    <p className="text-lg font-bold">
                      {(item.price * item.quantity).toLocaleString()} so'm
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
                  Savatchani tozalash
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
                <h2 className="text-xl font-bold mb-6">Buyurtma Ma'lumotlari</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mahsulotlar ({items.length}):</span>
                    <span className="font-semibold">{totalPrice.toLocaleString()} so'm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yetkazib berish:</span>
                    <span className="font-semibold text-green-600">Bepul</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold text-lg">Jami:</span>
                    <span className="font-bold text-2xl text-primary">{totalPrice.toLocaleString()} so'm</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                  size="lg"
                  onClick={() => setCheckoutOpen(true)}
                >
                  Buyurtma Berish
                </Button>

                <CheckoutForm open={checkoutOpen} onOpenChange={setCheckoutOpen} />

                <Button asChild variant="outline" className="w-full mt-3">
                  <Link to="/catalog">Xaridni Davom Ettirish</Link>
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
