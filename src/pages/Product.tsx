import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Package, Shield, Truck } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { motion } from "framer-motion";

const Product = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Mahsulot topilmadi</h1>
            <Button asChild>
              <Link to="/catalog">Katalogga qaytish</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products.filter(
    p => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 4);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga qaytish
            </Link>
          </Button>

          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Product Image */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                <div className="flex items-baseline gap-4 mb-6">
                  <p className="text-4xl font-bold text-primary">{product.price.toLocaleString()} so'm</p>
                  <span className="text-muted-foreground">Hajmi: {product.volume}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm">
                    {product.inStock ? "Mavjud" : "Mavjud emas"}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm">Sifat kafolati</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Tez yetkazib berish (1-2 kun)</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Savatchaga Qo'shish
              </Button>

              <div className="border-t border-border pt-6">
                <h2 className="font-semibold text-xl mb-3">Mahsulot Haqida</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="border-t border-border pt-6">
                <h2 className="font-semibold text-xl mb-3">Xususiyatlari</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Yuqori sifatli mahsulot</li>
                  <li>• Sertifikatlangan va kafolatlangan</li>
                  <li>• Arzon narxlarda</li>
                  <li>• Tez yetkazib berish xizmati</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold mb-8">O'xshash Mahsulotlar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct, index) => (
                  <motion.div
                    key={relatedProduct.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProductCard {...relatedProduct} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Product;
