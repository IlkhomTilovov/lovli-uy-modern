import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, Home } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSEO } from "@/hooks/useSEO";
import { motion } from "framer-motion";

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Find category by slug
  const category = useMemo(() => {
    return categories.find(c => c.slug === slug);
  }, [slug, categories]);

  // Filter products by category
  const categoryProducts = useMemo(() => {
    if (!category) return [];
    return products
      .filter(product => product.status === 'active' && product.category_id === category.id)
      .map(product => ({
        id: product.id,
        name: product.title,
        price: product.discount_active && product.discount_price ? product.discount_price : product.retail_price,
        image: product.images?.[0] || '/placeholder.svg',
        category: category.name
      }));
  }, [category, products]);

  // SEO with Open Graph
  useSEO({
    title: category?.meta_title || `${category?.name || 'Kategoriya'} | Do'kon`,
    description: category?.meta_description || category?.description || "Sifatli mahsulotlar arzon narxlarda",
    image: category?.image || undefined,
    url: category ? `${window.location.origin}/kategoriya/${category.slug}` : undefined,
    type: 'website'
  });

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const isLoading = productsLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold mb-4">Kategoriya topilmadi</h1>
          <p className="text-muted-foreground mb-6">Bu kategoriya mavjud emas yoki o'chirilgan</p>
          <Button asChild>
            <Link to="/catalog">Katalogga qaytish</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section with Category Image */}
        <section 
          className="relative py-16 md:py-24 bg-secondary/30 border-b border-border"
          style={category.image ? {
            backgroundImage: `linear-gradient(to bottom, hsl(var(--background) / 0.85), hsl(var(--background) / 0.95)), url(${category.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : undefined}
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
            >
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  Bosh sahifa
                </Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/catalog" className="hover:text-foreground transition-colors">
                  Katalog
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground font-medium">{category.name}</span>
              </nav>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground text-lg max-w-2xl">
                  {category.description}
                </p>
              )}
              <p className="text-muted-foreground mt-4">
                {categoryProducts.length} ta mahsulot
              </p>
            </motion.div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-4 py-12">
          {categoryProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-6">
                Bu kategoriyada hozircha mahsulot yo'q
              </p>
              <Button asChild variant="outline">
                <Link to="/catalog">Boshqa mahsulotlarni ko'rish</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categoryProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Other Categories */}
        <section className="container mx-auto px-4 py-12 border-t border-border">
          <h2 className="text-2xl font-bold mb-6">Boshqa kategoriyalar</h2>
          <div className="flex flex-wrap gap-3">
            {categories
              .filter(c => c.id !== category.id && c.status === 'active')
              .map(c => (
                <Button key={c.id} variant="outline" asChild>
                  <Link to={`/kategoriya/${c.slug}`}>{c.name}</Link>
                </Button>
              ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Category;
