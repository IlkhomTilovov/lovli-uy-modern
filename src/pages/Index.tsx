import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Truck, Shield, Sparkles, Star, Heart, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CategoryCard } from "@/components/CategoryCard";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useSEO } from "@/hooks/useSEO";
import heroBanner from "@/assets/hero-banner-new.jpg";
import { motion } from "framer-motion";
import { HeroSkeleton, CategoryGridSkeleton, ProductGridSkeleton } from "@/components/skeletons";
import { LucideIcon } from "lucide-react";

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
    heroTitle: "O'zbekistonning yetakchi xo'jalik mollari ishlab chiqaruvchisi",
    heroSubtitle: "Vallerlar, cho'tkalar, pichoqlar, supurgilar va har kuni kerak bo'ladigan sifatli uskunalar.",
    viewCatalog: "Katalogni Ko'rish",
    contact: "Bog'lanish",
    experience: "5+ Yillik Tajriba",
    clients: "1000+ Mijozlar",
    categories: "Kategoriyalar",
    categoriesSubtitle: "Sizga kerak bo'lgan mahsulotlarni toping",
    featuredProducts: "Eng Ko'p Sotiladigan Mahsulotlar",
    featuredSubtitle: "Mijozlarimizning sevimlilari",
    allProducts: "Barcha Mahsulotlar",
    whyChooseUs: "Nima Uchun Bizni Tanlaysiz?",
    reviews: "Mijozlarimiz Fikri",
    ctaTitle: "Buyurtma Berishga Tayyormisiz?",
    ctaSubtitle: "Hoziroq katalogni ko'rib chiqing va zarur mahsulotlarni tanlang",
    other: "Boshqa",
    features: [
      { icon: 'Shield', title: 'Sifat Kafolati', description: 'Barcha mahsulotlar sertifikatlangan va sifat kafolati bilan' },
      { icon: 'Sparkles', title: 'Doimiy Chegirmalar', description: 'Har oyda yangi chegirmalar va maxsus takliflar' },
      { icon: 'Truck', title: 'Tez Yetkazib Berish', description: "Toshkent bo'ylab 1-2 kun ichida bepul yetkazib berish" },
      { icon: 'CheckCircle', title: 'Katta Assortiment', description: '200+ turdagi xojalik mollari bir joyda' },
    ],
    reviewsList: [
      { name: 'Aziza Karimova', rating: 5, text: 'Juda sifatli mahsulotlar va tez yetkazib berishadi. Narxlari ham arzon. Hammaga tavsiya qilaman!' },
      { name: 'Sardor Toshmatov', rating: 5, text: 'Doimiy mijozman. Har doim zarur mahsulotlarni shu yerdan olib turaman. Xizmat juda yaxshi!' },
      { name: 'Nilufar Rahimova', rating: 5, text: "Katta assortiment va sifatli mahsulotlar. Chegirmalar ham doimo bor. Rahmat!" },
    ]
  },
  ru: {
    heroTitle: "Ведущий производитель хозяйственных товаров в Узбекистане",
    heroSubtitle: "Валики, щётки, ножи, мётлы и качественные инструменты для повседневного использования.",
    viewCatalog: "Смотреть каталог",
    contact: "Связаться",
    experience: "5+ лет опыта",
    clients: "1000+ клиентов",
    categories: "Категории",
    categoriesSubtitle: "Найдите нужные вам товары",
    featuredProducts: "Самые продаваемые товары",
    featuredSubtitle: "Любимые товары наших клиентов",
    allProducts: "Все товары",
    whyChooseUs: "Почему выбирают нас?",
    reviews: "Отзывы клиентов",
    ctaTitle: "Готовы сделать заказ?",
    ctaSubtitle: "Просмотрите каталог прямо сейчас и выберите нужные товары",
    other: "Другое",
    features: [
      { icon: 'Shield', title: 'Гарантия качества', description: 'Все товары сертифицированы и с гарантией качества' },
      { icon: 'Sparkles', title: 'Постоянные скидки', description: 'Каждый месяц новые скидки и специальные предложения' },
      { icon: 'Truck', title: 'Быстрая доставка', description: 'Бесплатная доставка по Ташкенту за 1-2 дня' },
      { icon: 'CheckCircle', title: 'Большой ассортимент', description: '200+ видов хозяйственных товаров в одном месте' },
    ],
    reviewsList: [
      { name: 'Азиза Каримова', rating: 5, text: 'Очень качественные товары и быстрая доставка. Цены тоже доступные. Всем рекомендую!' },
      { name: 'Сардор Тошматов', rating: 5, text: 'Постоянный клиент. Всегда беру нужные товары здесь. Сервис отличный!' },
      { name: 'Нилуфар Рахимова', rating: 5, text: 'Большой ассортимент и качественные товары. Скидки всегда есть. Спасибо!' },
    ]
  }
};

const ICON_MAP: Record<string, LucideIcon> = {
  Shield,
  Sparkles,
  Truck,
  CheckCircle,
  Star,
  Heart,
  Award,
  Clock,
};

const Index = () => {
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

  // SEO with Open Graph
  useSEO({
    title: language === "uz" 
      ? "Do'kon - O'zbekistonning yetakchi xo'jalik mollari" 
      : "Магазин - Ведущие хозяйственные товары Узбекистана",
    description: language === "uz"
      ? "Sifatli xo'jalik mollari - vallerlar, cho'tkalar, supurgilar va boshqa mahsulotlar arzon narxlarda"
      : "Качественные хозяйственные товары - валики, щётки, мётлы и другие товары по доступным ценам",
    image: heroBanner,
    url: window.location.origin,
    type: 'website'
  });

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { 
    banner, heroStats, categoriesSection, productsSection, features, reviews, cta,
    isLoading: contentLoading 
  } = useSiteContent();

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
        category: category?.name || t.other
      };
    });

  // Map categories to CategoryCard format
  const activeCategories = categories.map(category => ({
    name: category.name,
    slug: category.slug,
    image: category.image || '/placeholder.svg',
    productCount: products.filter(p => p.category_id === category.id && p.status === 'active').length
  }));

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const isLoading = productsLoading || categoriesLoading || contentLoading;

  const displayFeatures = t.features;
  const displayReviews = t.reviewsList;

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-background overflow-hidden">
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="space-y-4 sm:space-y-6 text-center lg:text-left"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                {banner?.title || t.heroTitle}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                {banner?.subtitle || t.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  <Link to="/catalog">
                    {banner?.buttonText || t.viewCatalog}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link to="/contact">{t.contact}</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative order-first lg:order-last"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={banner?.image || heroBanner}
                  alt="Xojalik Mollari"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-accent text-accent-foreground p-4 sm:p-6 rounded-xl shadow-lg">
                <p className="text-xs sm:text-sm font-medium">
                  {heroStats?.experienceText || t.experience}
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {heroStats?.clientsText || t.clients}
                </p>
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {categoriesSection?.title || t.categories}
            </h2>
            <p className="text-muted-foreground text-lg">
              {categoriesSection?.subtitle || t.categoriesSubtitle}
            </p>
          </motion.div>

          {categoriesLoading ? (
            <CategoryGridSkeleton count={4} />
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {productsSection?.title || t.featuredProducts}
            </h2>
            <p className="text-muted-foreground text-lg">
              {productsSection?.subtitle || t.featuredSubtitle}
            </p>
          </motion.div>

          {productsLoading ? (
            <ProductGridSkeleton count={4} />
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
                {productsSection?.buttonText || t.allProducts}
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {features?.title || t.whyChooseUs}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayFeatures.map((feature, index) => {
              const IconComponent = ICON_MAP[feature.icon] || Shield;
              return (
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
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
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
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {reviews?.title || t.reviews}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayReviews.map((review, index) => (
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
              {cta?.title || t.ctaTitle}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {cta?.subtitle || t.ctaSubtitle}
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/catalog">
                {cta?.buttonText || t.viewCatalog}
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