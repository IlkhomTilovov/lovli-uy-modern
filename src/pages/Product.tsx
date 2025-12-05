import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Package, Shield, Truck } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSEO } from "@/hooks/useSEO";
import { motion } from "framer-motion";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { useCart } from "@/contexts/CartContext";

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
    productNotFound: "Mahsulot topilmadi",
    backToCatalog: "Katalogga qaytish",
    goBack: "Orqaga qaytish",
    other: "Boshqa",
    currency: "so'm",
    available: "Mavjud",
    pieces: "dona",
    outOfStock: "Mavjud emas",
    qualityGuarantee: "Sifat kafolati",
    fastDelivery: "Tez yetkazib berish (1-2 kun)",
    addToCart: "Savatchaga Qo'shish",
    aboutProduct: "Mahsulot Haqida",
    specifications: "Xususiyatlari",
    highQuality: "Yuqori sifatli mahsulot",
    certified: "Sertifikatlangan va kafolatlangan",
    fastDeliveryService: "Tez yetkazib berish xizmati",
    relatedProducts: "O'xshash Mahsulotlar",
    home: "Bosh sahifa",
    catalog: "Katalog"
  },
  ru: {
    productNotFound: "Товар не найден",
    backToCatalog: "Вернуться в каталог",
    goBack: "Назад",
    other: "Другое",
    currency: "сум",
    available: "В наличии",
    pieces: "шт",
    outOfStock: "Нет в наличии",
    qualityGuarantee: "Гарантия качества",
    fastDelivery: "Быстрая доставка (1-2 дня)",
    addToCart: "Добавить в корзину",
    aboutProduct: "О товаре",
    specifications: "Характеристики",
    highQuality: "Высококачественный товар",
    certified: "Сертифицировано и гарантировано",
    fastDeliveryService: "Услуга быстрой доставки",
    relatedProducts: "Похожие товары",
    home: "Главная",
    catalog: "Каталог"
  }
};

const Product = () => {
  const { id } = useParams();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { addToCart } = useCart();
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
  
  const product = products.find(p => p.id === id);
  const category = product ? categories.find(c => c.id === product.category_id) : null;

  const displayPrice = product?.discount_active && product?.discount_price 
    ? product.discount_price 
    : product?.retail_price || 0;

  // SEO with Open Graph and JSON-LD
  useSEO({
    title: product?.meta_title || `${product?.title || (language === "uz" ? 'Mahsulot' : 'Товар')} | ${language === "uz" ? "Do'kon" : "Магазин"}`,
    description: product?.meta_description || product?.description || (language === "uz" ? "Sifatli mahsulot arzon narxda" : "Качественный товар по доступной цене"),
    image: product?.images?.[0],
    url: product ? `${window.location.origin}/product/${product.id}` : undefined,
    type: 'product',
    product: product ? {
      name: product.title,
      description: product.description || undefined,
      image: product.images?.[0],
      sku: product.sku,
      price: displayPrice,
      currency: 'UZS',
      availability: product.stock > 0 ? 'InStock' : 'OutOfStock'
    } : undefined,
    breadcrumbs: product ? [
      { name: t.home, url: window.location.origin },
      { name: t.catalog, url: `${window.location.origin}/catalog` },
      ...(category ? [{ name: category.name, url: `${window.location.origin}/category/${category.slug}` }] : []),
      { name: product.title, url: `${window.location.origin}/product/${product.id}` }
    ] : undefined,
  });

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <ProductDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{t.productNotFound}</h1>
            <Button asChild>
              <Link to="/catalog">{t.backToCatalog}</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.category_id === product.category_id && p.id !== product.id && p.status === 'active')
    .slice(0, 4)
    .map(p => {
      const cat = categories.find(c => c.id === p.category_id);
      return {
        id: p.id,
        name: p.title,
        price: p.discount_active && p.discount_price ? p.discount_price : p.retail_price,
        image: p.images?.[0] || '/placeholder.svg',
        category: cat?.name || t.other
      };
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Button asChild variant="ghost" className="mb-6">
            <Link to="/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.goBack}
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
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {product.images.slice(1, 5).map((img, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={img} alt={`${product.title} ${index + 2}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
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
                <p className="text-sm text-muted-foreground mb-2">{category?.name || t.other}</p>
                <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
                <div className="flex items-baseline gap-4 mb-6">
                  <p className="text-4xl font-bold text-primary">{displayPrice.toLocaleString()} {t.currency}</p>
                  {product.discount_active && product.discount_price && (
                    <span className="text-muted-foreground line-through">{product.retail_price.toLocaleString()} {t.currency}</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm">
                    {product.stock > 0 ? `${t.available} (${product.stock} ${t.pieces})` : t.outOfStock}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm">{t.qualityGuarantee}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm">{t.fastDelivery}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={product.stock === 0}
                onClick={() => addToCart({
                  id: product.id,
                  title: product.title,
                  price: displayPrice,
                  originalPrice: product.discount_active ? product.retail_price : undefined,
                  image: product.images?.[0] || '/placeholder.svg',
                  stock: product.stock
                })}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {t.addToCart}
              </Button>

              {product.description && (
                <div className="border-t border-border pt-6">
                  <h2 className="font-semibold text-xl mb-3">{t.aboutProduct}</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="border-t border-border pt-6">
                <h2 className="font-semibold text-xl mb-3">{t.specifications}</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• SKU: {product.sku}</li>
                  <li>• {t.highQuality}</li>
                  <li>• {t.certified}</li>
                  <li>• {t.fastDeliveryService}</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold mb-8">{t.relatedProducts}</h2>
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