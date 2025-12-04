import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
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
  Tag,
  Percent,
  Sparkles,
  Clock,
  Package,
  TrendingUp,
  Eye,
  Star,
  Weight,
  Ruler,
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
  const [newOnly, setNewOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [discountRange, setDiscountRange] = useState<[number, number]>([0, 100]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "lowStock">("all");
  const [sizeFilter, setSizeFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewedProductIds, setViewedProductIds] = useState<string[]>([]);
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Load viewed products from localStorage
  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    setViewedProductIds(viewed);
  }, []);

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

  // Category statistics
  const categoryStats = useMemo(() => {
    if (!category) return { total: 0, discounted: 0, new: 0 };
    const categoryProducts = products.filter(
      p => p.status === 'active' && p.category_id === category.id
    );
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      total: categoryProducts.length,
      discounted: categoryProducts.filter(p => p.discount_active && p.discount_price).length,
      new: categoryProducts.filter(p => new Date(p.created_at) > weekAgo).length
    };
  }, [category, products]);

  // Filter, search, and sort products
  const filteredProducts = useMemo(() => {
    if (!category) return [];
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let result = products
      .filter(product => product.status === 'active' && product.category_id === category.id)
      .map(product => {
        const hasDiscount = Boolean(product.discount_active && product.discount_price);
        const price = hasDiscount ? product.discount_price! : product.retail_price;
        const discountPercent = hasDiscount 
          ? Math.round((1 - product.discount_price! / product.retail_price) * 100) 
          : 0;
        
        return {
          id: product.id,
          name: product.title,
          price,
          originalPrice: product.retail_price,
          image: product.images?.[0] || '/placeholder.svg',
          category: category.name,
          hasDiscount,
          discountPercent,
          isNew: new Date(product.created_at) > weekAgo,
          createdAt: product.created_at,
          stock: product.stock,
          rating: (product as any).rating || 0,
          size: (product as any).size || null,
        };
      });

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }

    // Discount filter
    if (discountOnly) {
      result = result.filter(p => p.hasDiscount);
    }

    // New products filter
    if (newOnly) {
      result = result.filter(p => p.isNew);
    }

    // Price range filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Discount percentage range filter
    if (discountRange[0] > 0 || discountRange[1] < 100) {
      result = result.filter(p => p.discountPercent >= discountRange[0] && p.discountPercent <= discountRange[1]);
    }

    // Rating filter
    if (ratingFilter > 0) {
      result = result.filter(p => p.rating >= ratingFilter);
    }

    // Stock filter
    if (stockFilter === "inStock") {
      result = result.filter(p => p.stock > 5);
    } else if (stockFilter === "lowStock") {
      result = result.filter(p => p.stock > 0 && p.stock <= 5);
    }

    // Size filter
    if (sizeFilter) {
      result = result.filter(p => p.size === sizeFilter);
    }

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
      case "discount":
        result.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [category, products, searchQuery, discountOnly, newOnly, priceRange, discountRange, ratingFilter, stockFilter, sizeFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);


  // Viewed products
  const viewedProducts = useMemo(() => {
    return viewedProductIds
      .map(id => {
        const product = products.find(p => p.id === id);
        if (!product || product.status !== 'active') return null;
        const cat = categories.find(c => c.id === product.category_id);
        const hasDiscount = Boolean(product.discount_active && product.discount_price);
        return {
          id: product.id,
          name: product.title,
          price: hasDiscount ? product.discount_price! : product.retail_price,
          originalPrice: product.retail_price,
          image: product.images?.[0] || '/placeholder.svg',
          category: cat?.name || '',
          hasDiscount
        };
      })
      .filter(Boolean)
      .slice(0, 6);
  }, [viewedProductIds, products, categories]);

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Quick filter handlers
  const applyQuickFilter = (filter: string) => {
    switch (filter) {
      case "discount":
        setDiscountOnly(true);
        setNewOnly(false);
        break;
      case "new":
        setNewOnly(true);
        setDiscountOnly(false);
        break;
      case "cheap":
        setSortBy("price-asc");
        break;
      case "expensive":
        setSortBy("price-desc");
        break;
      default:
        break;
    }
    handleFilterChange();
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSortBy("default");
    setDiscountOnly(false);
    setNewOnly(false);
    setPriceRange([priceStats.min, priceStats.max]);
    setDiscountRange([0, 100]);
    setRatingFilter(0);
    setStockFilter("all");
    setSizeFilter("");
    setCurrentPage(1);
  };

  // SEO
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

  const hasActiveFilters = searchQuery || discountOnly || newOnly || sortBy !== "default" || 
    priceRange[0] > priceStats.min || priceRange[1] < priceStats.max ||
    discountRange[0] > 0 || discountRange[1] < 100 || ratingFilter > 0 || stockFilter !== "all" || sizeFilter;

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
    <div className="space-y-5">
      {/* Search */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs font-medium">
          <Search className="h-3.5 w-3.5" />
          Qidirish
        </Label>
        <div className="relative">
          <Input
            placeholder="Mahsulot nomi..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleFilterChange();
            }}
            className="h-9 text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(""); handleFilterChange(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Tags */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Tezkor filterlar</Label>
        <div className="flex flex-wrap gap-1.5">
          <Badge 
            variant={discountOnly ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/20 text-xs"
            onClick={() => { setDiscountOnly(!discountOnly); handleFilterChange(); }}
          >
            <Percent className="h-3 w-3 mr-1" />
            Chegirmali
          </Badge>
          <Badge 
            variant={newOnly ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/20 text-xs"
            onClick={() => { setNewOnly(!newOnly); handleFilterChange(); }}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Yangi
          </Badge>
          <Badge 
            variant={stockFilter === "inStock" ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/20 text-xs"
            onClick={() => { setStockFilter(stockFilter === "inStock" ? "all" : "inStock"); handleFilterChange(); }}
          >
            <Package className="h-3 w-3 mr-1" />
            Mavjud
          </Badge>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-xs font-medium">
          <Tag className="h-3.5 w-3.5" />
          Narx oralig'i
        </Label>
        <Slider
          value={priceRange}
          onValueChange={(value) => {
            setPriceRange(value as [number, number]);
            handleFilterChange();
          }}
          min={priceStats.min}
          max={priceStats.max}
          step={1000}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{priceRange[0].toLocaleString()} so'm</span>
          <span>{priceRange[1].toLocaleString()} so'm</span>
        </div>
      </div>

      {/* Discount Percentage Range */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-xs font-medium">
          <Percent className="h-3.5 w-3.5" />
          Chegirma foizi
        </Label>
        <Slider
          value={discountRange}
          onValueChange={(value) => {
            setDiscountRange(value as [number, number]);
            handleFilterChange();
          }}
          min={0}
          max={100}
          step={5}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{discountRange[0]}%</span>
          <span>{discountRange[1]}%</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs font-medium">
          <Star className="h-3.5 w-3.5" />
          Reyting
        </Label>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => { setRatingFilter(rating); handleFilterChange(); }}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors",
                ratingFilter === rating 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "border-border hover:bg-secondary"
              )}
            >
              {rating === 0 ? "Barchasi" : (
                <>
                  {rating}
                  <Star className="h-3 w-3 fill-current" />
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Filter */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs font-medium">
          <Package className="h-3.5 w-3.5" />
          Ombordagi miqdor
        </Label>
        <Select value={stockFilter} onValueChange={(value: "all" | "inStock" | "lowStock") => { setStockFilter(value); handleFilterChange(); }}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Tanlang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="inStock">Mavjud (5+ dona)</SelectItem>
            <SelectItem value="lowStock">Kam qoldi (1-5 dona)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Size Filter */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-xs font-medium">
          <Ruler className="h-3.5 w-3.5" />
          O'lcham
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {["", "XS", "S", "M", "L", "XL", "XXL"].map((size) => (
            <button
              key={size}
              onClick={() => { setSizeFilter(size); handleFilterChange(); }}
              className={cn(
                "px-3 py-1.5 rounded text-xs border transition-colors",
                sizeFilter === size 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "border-border hover:bg-secondary"
              )}
            >
              {size || "Barchasi"}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Count */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">
              {filteredProducts.length} ta natija
            </span>
          </div>
          <Button variant="outline" onClick={resetFilters} className="w-full h-9 text-sm">
            <X className="h-4 w-4 mr-2" />
            Filtrlarni tozalash
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Compact Hero Section */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 py-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <Link to="/" className="hover:text-foreground transition-colors">
                Bosh sahifa
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/catalog" className="hover:text-foreground transition-colors">
                Katalog
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">{category.name}</span>
            </nav>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{category.name}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filteredProducts.length} ta mahsulot
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Promo Banner */}
        {categoryStats.discounted > 0 && (
          <section className="bg-gradient-to-r from-red-500 to-orange-500 py-3">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-3 text-white">
                <Flame className="h-5 w-5 animate-pulse" />
                <span className="font-medium">
                  🎉 Maxsus chegirma! {categoryStats.discounted} ta mahsulotda 70% gacha chegirma!
                </span>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="ml-4"
                  onClick={() => { setDiscountOnly(true); handleFilterChange(); }}
                >
                  Ko'rish
                </Button>
              </div>
            </div>
          </section>
        )}


        {/* Filters and Products */}
        <section className="container mx-auto px-4 py-8">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-card rounded-xl border border-border">
            {/* Left side */}
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
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Saralash" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Standart</SelectItem>
                  <SelectItem value="price-asc">Arzondan qimmatga</SelectItem>
                  <SelectItem value="price-desc">Qimmatdan arzonga</SelectItem>
                  <SelectItem value="newest">Eng yangilari</SelectItem>
                  <SelectItem value="discount">Chegirma bo'yicha</SelectItem>
                  <SelectItem value="rating">Reyting bo'yicha</SelectItem>
                </SelectContent>
              </Select>

              {/* Results count */}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {filteredProducts.length} ta natija
              </span>
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
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtrlar
                </h3>
                <FilterContent />
              </div>
            </aside>

            {/* Products Grid/List */}
            <div className="flex-1">
              {paginatedProducts.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border border-border">
                  <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-6">
                    Mahsulot topilmadi
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Filtrlarni tozalash
                  </Button>
                </div>
              ) : (
                <>
                  <div className={cn(
                    viewMode === "grid" 
                      ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
                      : "flex flex-col gap-4"
                  )}>
                    {paginatedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
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
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        );
                      })}
                      
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

        {/* Viewed Products */}
        {viewedProducts.length > 0 && (
          <section className="container mx-auto px-4 py-10 border-t border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Ko'rilgan mahsulotlar</h2>
                <p className="text-sm text-muted-foreground">Siz yaqinda ko'rgan mahsulotlar</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {viewedProducts.map((product) => product && (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </section>
        )}

        {/* Related Categories */}
        <section className="container mx-auto px-4 py-10 border-t border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary rounded-lg">
              <Eye className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Boshqa kategoriyalar</h2>
              <p className="text-sm text-muted-foreground">Sizni qiziqtirishi mumkin</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories
              .filter(c => c.id !== category.id && c.status === 'active')
              .slice(0, 6)
              .map(c => (
                <Link 
                  key={c.id} 
                  to={`/kategoriya/${c.slug}`}
                  className="group relative overflow-hidden rounded-xl aspect-square"
                >
                  {c.image ? (
                    <img 
                      src={c.image} 
                      alt={c.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <h3 className="text-white font-semibold text-sm">{c.name}</h3>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// List view product card component
const ListProductCard = ({ product }: { product: { id: string; name: string; price: number; originalPrice?: number; image: string; category: string; hasDiscount?: boolean; discountPercent?: number; isNew?: boolean } }) => {
  return (
    <Link 
      to={`/product/${product.id}`}
      className="flex gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-lg hover:border-primary/30 transition-all group"
    >
      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden shrink-0 relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {product.discountPercent && product.discountPercent > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
            -{product.discountPercent}%
          </Badge>
        )}
        {product.isNew && (
          <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">
            Yangi
          </Badge>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl font-bold text-primary">
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
