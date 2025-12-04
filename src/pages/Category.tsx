import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Loader2,
  ChevronRight,
  Home,
  Search,
  Grid3X3,
  List,
  SlidersHorizontal,
  ChevronLeft,
  X,
  Flame,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSEO } from "@/hooks/useSEO";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 12;

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // State for filters, sorting, view, pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [discountOnly, setDiscountOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Find category by slug
  const category = useMemo(() => {
    return categories.find(c => c.slug === slug);
  }, [slug, categories]);

  // Get min and max prices from all products in category
  const priceStats = useMemo(() => {
    if (!category) return { min: 0, max: 10000000 };
    const categoryProducts = products.filter(
      p => p.status === 'active' && p.category_id === category.id
    );
    if (categoryProducts.length === 0) return { min: 0, max: 10000000 };
    
    const prices = categoryProducts.map(p => 
      p.discount_active && p.discount_price ? p.discount_price : p.retail_price
    );
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [category, products]);

  // Filter, search, and sort products
  const filteredProducts = useMemo(() => {
    if (!category) return [];
    
    let result = products
      .filter(product => product.status === 'active' && product.category_id === category.id)
      .map(product => ({
        id: product.id,
        name: product.title,
        price: product.discount_active && product.discount_price ? product.discount_price : product.retail_price,
        originalPrice: product.retail_price,
        image: product.images?.[0] || '/placeholder.svg',
        category: category.name,
        hasDiscount: Boolean(product.discount_active && product.discount_price),
        createdAt: product.created_at
      }));

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }

    // Discount filter
    if (discountOnly) {
      result = result.filter(p => p.hasDiscount);
    }

    // Price range filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }

    return result;
  }, [category, products, searchQuery, discountOnly, priceRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Popular products (products with discount or random selection)
  const popularProducts = useMemo(() => {
    if (!category) return [];
    const withDiscount = filteredProducts.filter(p => p.hasDiscount);
    if (withDiscount.length >= 4) return withDiscount.slice(0, 4);
    return filteredProducts.slice(0, 4);
  }, [category, filteredProducts]);

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSortBy("default");
    setDiscountOnly(false);
    setPriceRange([priceStats.min, priceStats.max]);
    setCurrentPage(1);
  };

  // SEO with Open Graph
  useSEO({
    title: category?.meta_title || `${category?.name || 'Kategoriya'} | Do'kon`,
    description: category?.meta_description || category?.description || "Sifatli mahsulotlar arzon narxlarda",
    image: category?.image || undefined,
    url: category ? `${window.location.origin}/kategoriya/${category.slug}` : undefined,
    type: 'website',
    breadcrumbs: category ? [
      { name: "Bosh sahifa", url: window.location.origin },
      { name: "Katalog", url: `${window.location.origin}/catalog` },
      { name: category.name, url: `${window.location.origin}/kategoriya/${category.slug}` }
    ] : undefined
  });

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const isLoading = productsLoading || categoriesLoading;

  const hasActiveFilters = searchQuery || discountOnly || sortBy !== "default" || 
    priceRange[0] > priceStats.min || priceRange[1] < priceStats.max;

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

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>Qidirish</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mahsulot nomi..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleFilterChange();
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label>Narx oralig'i</Label>
        <Slider
          value={priceRange}
          onValueChange={(value) => {
            setPriceRange(value as [number, number]);
            handleFilterChange();
          }}
          min={priceStats.min}
          max={priceStats.max}
          step={1000}
          className="mt-2"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{priceRange[0].toLocaleString()} so'm</span>
          <span>{priceRange[1].toLocaleString()} so'm</span>
        </div>
      </div>

      {/* Discount Filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="discount"
          checked={discountOnly}
          onCheckedChange={(checked) => {
            setDiscountOnly(checked as boolean);
            handleFilterChange();
          }}
        />
        <Label htmlFor="discount" className="cursor-pointer">
          Faqat chegirmali mahsulotlar
        </Label>
      </div>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={resetFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Filtrlarni tozalash
        </Button>
      )}
    </div>
  );

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
                {filteredProducts.length} ta mahsulot topildi
              </p>
            </motion.div>
          </div>
        </section>

        {/* Popular Products */}
        {popularProducts.length > 0 && !hasActiveFilters && (
          <section className="container mx-auto px-4 py-8 border-b border-border">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-bold">Mashhur mahsulotlar</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        )}

        {/* Filters and Products */}
        <section className="container mx-auto px-4 py-8">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Left side - Filter button (mobile) and sort */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtr
                    {hasActiveFilters && (
                      <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filtrlar</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Select */}
              <Select value={sortBy} onValueChange={(value) => { setSortBy(value); handleFilterChange(); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Saralash" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Standart</SelectItem>
                  <SelectItem value="price-asc">Arzondan qimmatga</SelectItem>
                  <SelectItem value="price-desc">Qimmatdan arzonga</SelectItem>
                  <SelectItem value="newest">Eng yangilari</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right side - View toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Ko'rinish:</span>
              <div className="flex items-center border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Filtrlar</h3>
                <FilterContent />
              </div>
            </aside>

            {/* Products Grid/List */}
            <div className="flex-1">
              {paginatedProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg mb-6">
                    Mahsulot topilmadi
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Filtrlarni tozalash
                  </Button>
                </div>
              ) : (
                <>
                  <div className={cn(
                    viewMode === "grid" 
                      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                      : "flex flex-col gap-4"
                  )}>
                    {paginatedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      >
                        {viewMode === "grid" ? (
                          <ProductCard {...product} />
                        ) : (
                          <ListProductCard product={product} />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
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

// List view product card component
const ListProductCard = ({ product }: { product: { id: string; name: string; price: number; originalPrice?: number; image: string; category: string; hasDiscount?: boolean } }) => {
  return (
    <Link 
      to={`/product/${product.id}`}
      className="flex gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-lg transition-shadow"
    >
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden shrink-0">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <h3 className="font-semibold text-foreground truncate mb-2">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            {product.price.toLocaleString()} so'm
          </span>
          {product.hasDiscount && product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice.toLocaleString()} so'm
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Category;
