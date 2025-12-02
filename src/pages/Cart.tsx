import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const Cart = () => {
  // TODO: Connect to actual cart state
  const cartItems: any[] = [];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (cartItems.length === 0) {
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
        <section className="bg-secondary/30 py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold">Savat</h1>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* TODO: Map through actual cart items */}
            </div>

            {/* Summary */}
            <div>
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Buyurtma Ma'lumotlari</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mahsulotlar:</span>
                    <span className="font-semibold">0 so'm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yetkazib berish:</span>
                    <span className="font-semibold">Bepul</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold text-lg">Jami:</span>
                    <span className="font-bold text-2xl text-primary">0 so'm</span>
                  </div>
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
                  Buyurtma Berish
                </Button>

                <Button asChild variant="outline" className="w-full mt-3">
                  <Link to="/catalog">Xaridni Davom Ettirish</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
