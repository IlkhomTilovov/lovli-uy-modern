import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Truck, Shield, Sparkles, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSiteContent } from "@/hooks/useSiteContent";
import heroBanner from "@/assets/hero-banner.jpg";
import { motion } from "framer-motion";

const Index = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { banner, isLoading: contentLoading } = useSiteContent();
  // Get active products and map to ProductCard format
  const featuredProducts = products
    .filter(p => p.status === 'active')
    .slice(0, 4)
    .map(product => {
      const category = categories.find(c => c.id === product.category_id);
      return {
        id: product.id,
        name: product.title,
        price: product.discount_active && product.discount_price ? product.discount_price : product.retail_price,
        image: product.images?.[0] || '/placeholder.svg',
        category: category?.name || 'Boshqa'
      };
    });

  // Map categories to CategoryCard format
  const activeCategories = categories.map(category => ({
    name: category.name,
    slug: category.id,
    image: category.image || '/placeholder.svg',
    productCount: products.filter(p => p.category_id === category.id && p.status === 'active').length
  }));

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const isLoading = productsLoading || categoriesLoading || contentLoading;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-background overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {banner?.title || "O'zbekistonning yetakchi xo'jalik mollari ishlab chiqaruvchisi"}
              </h1>
              <p className="text-lg text-muted-foreground">
                {banner?.subtitle || "Vallerlar, cho'tkalar, pichoqlar, supurgilar va har kuni kerak bo'ladigan sifatli uskunalar."}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/catalog">
                    {banner?.buttonText || "Katalogni Ko'rish"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/contact">Bog'lanish</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={banner?.image || heroBanner}
                  alt="Xojalik Mollari"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground p-6 rounded-xl shadow-lg">
                <p className="text-sm font-medium">5+ Yillik Tajriba</p>
                <p className="text-2xl font-bold">1000+ Mijozlar</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Kategoriyalar</h2>
            <p className="text-muted-foreground text-lg">
              Sizga kerak bo'lgan mahsulotlarni toping
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeCategories.map((category, index) => (
                <motion.div
                  key={category.slug}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CategoryCard {...category} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Eng Ko'p Sotiladigan Mahsulotlar</h2>
            <p className="text-muted-foreground text-lg">
              Mijozlarimizning sevimlilari
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link to="/catalog">
                Barcha Mahsulotlar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Nima Uchun Bizni Tanlaysiz?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Sifat Kafolati",
                description: "Barcha mahsulotlar sertifikatlangan va sifat kafolati bilan"
              },
              {
                icon: Sparkles,
                title: "Doimiy Chegirmalar",
                description: "Har oyda yangi chegirmalar va maxsus takliflar"
              },
              {
                icon: Truck,
                title: "Tez Yetkazib Berish",
                description: "Toshkent bo'ylab 1-2 kun ichida bepul yetkazib berish"
              },
              {
                icon: CheckCircle,
                title: "Katta Assortiment",
                description: "200+ turdagi xojalik mollari bir joyda"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Mijozlarimiz Fikri</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Aziza Karimova",
                rating: 5,
                text: "Juda sifatli mahsulotlar va tez yetkazib berishadi. Narxlari ham arzon. Hammaga tavsiya qilaman!"
              },
              {
                name: "Sardor Toshmatov",
                rating: 5,
                text: "Doimiy mijozman. Har doim zarur mahsulotlarni shu yerdan olib turaman. Xizmat juda yaxshi!"
              },
              {
                name: "Nilufar Rahimova",
                rating: 5,
                text: "Katta assortiment va sifatli mahsulotlar. Chegirmalar ham doimo bor. Rahmat!"
              }
            ].map((review, index) => (
              <motion.div
                key={review.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card p-6 rounded-xl border border-border"
              >
                <div className="flex mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">{review.text}</p>
                <p className="font-semibold">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Buyurtma Berishga Tayyormisiz?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Hoziroq katalogni ko'rib chiqing va zarur mahsulotlarni tanlang
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/catalog">
                Katalogni Ko'rish
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
