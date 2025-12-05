import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, LayoutGrid, Rows3 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSEO } from "@/hooks/useSEO";
import { motion } from "framer-motion";
import { FilterSidebarSkeleton, CatalogGridSkeleton } from "@/components/skeletons";
import { usePagination } from "@/hooks/usePagination";
import { useLazyLoad } from "@/hooks/useLazyLoad";
import { PaginationControls } from "@/components/PaginationControls";
import { LazyLoadTrigger } from "@/components/LazyLoadTrigger";

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
    title: "Mahsulotlar Katalogi",
    productsFound: "mahsulot topildi",
    pagination: "Sahifalash",
    infiniteScroll: "Cheksiz yuklash",
    filters: "Filtrlar",
    search: "Qidirish",
    searchPlaceholder: "Mahsulot nomi...",
    categories: "Kategoriyalar",
    allProducts: "Barcha mahsulotlar",
    noProducts: "Mahsulot topilmadi. Boshqa kategoriyani tanlang yoki qidiruv so'zini o'zgartiring.",
    other: "Boshqa"
  },
  ru: {
    title: "Каталог товаров",
    productsFound: "товаров найдено",
    pagination: "Пагинация",
    infiniteScroll: "Бесконечная загрузка",
    filters: "Фильтры",
    search: "Поиск",
    searchPlaceholder: "Название товара...",
    categories: "Категории",
    allProducts: "Все товары",
    noProducts: "Товары не найдены. Выберите другую категорию или измените поисковый запрос.",
    other: "Другое"
  }
};

const ITEMS_PER_PAGE = 12;

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"pagination" | "infinite">("pagination");
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const selectedCategory = searchParams.get("category") || "all";
  
  // Listen for language changes from Navbar
  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail);
    };
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, []);

  const t = translations[language];

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Find selected category for SEO
  const selectedCategoryData = useMemo(() => {
    if (selectedCategory === "all") return null;
    return categories.find(c => c.id === selectedCategory);
  }, [selectedCategory, categories]);

  // SEO with Open Graph
  useSEO({
    title: selectedCategoryData?.meta_title || selectedCategoryData?.name 
      ? `${selectedCategoryData.name} | ${language === "uz" ? "Do'kon" : "Магазин"}` 
      : language === "uz" ? "Mahsulotlar Katalogi | Do'kon" : "Каталог товаров | Магазин",
    description: selectedCategoryData?.meta_description || selectedCategoryData?.description 
      || (language === "uz" ? "Barcha mahsulotlar katalogi - sifatli va arzon narxlarda" : "Каталог всех товаров - качественные и доступные цены"),
    url: `${window.location.origin}/catalog`,
    type: 'website'
  });

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => product.status === 'active')
      .filter(product => {
        const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        return matchesCategory && matchesSearch;
      })
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
  }, [selectedCategory, searchQuery, products, categories, t.other]);

  // Pagination hook
  const pagination = usePagination(filteredProducts, { itemsPerPage: ITEMS_PER_PAGE });

  // Lazy load hook
  const lazyLoad = useLazyLoad(filteredProducts, { initialBatch: ITEMS_PER_PAGE, batchSize: ITEMS_PER_PAGE });

  // Reset pagination/lazy load when filters change
  useEffect(() => {
    pagination.resetPage();
    lazyLoad.reset();
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (slug: string) => {
    if (slug === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", slug);
    }
    setSearchParams(searchParams);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const isLoading = productsLoading || categoriesLoading;

  // Get items based on view mode
  const displayProducts = viewMode === "pagination" 
    ? pagination.paginatedItems 
    : lazyLoad.visibleItems;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-secondary/30 py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <h1 className="text-4xl font-bold mb-2">{t.title}</h1>
                <p className="text-muted-foreground text-lg">
                  {filteredProducts.length} {t.productsFound}
                </p>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
                <Button
                  variant={viewMode === "pagination" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("pagination")}
                  className="gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  {t.pagination}
                </Button>
                <Button
                  variant={viewMode === "infinite" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("infinite")}
                  className="gap-2"
                >
                  <Rows3 className="h-4 w-4" />
                  {t.infiniteScroll}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[280px,1fr] gap-8">
            {/* Sidebar Filters */}
            <aside className="space-y-6">
              {isLoading ? (
                <FilterSidebarSkeleton />
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <SlidersHorizontal className="h-5 w-5 text-primary" />
                      <h2 className="font-semibold text-lg">{t.filters}</h2>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                      <label className="text-sm font-medium mb-2 block">{t.search}</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t.searchPlaceholder}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">{t.categories}</label>
                      <div className="space-y-2">
                        <Button
                          variant={selectedCategory === "all" ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => handleCategoryChange("all")}
                        >
                          {t.allProducts}
                        </Button>
                        {categories.map((category) => (
                          <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => handleCategoryChange(category.id)}
                          >
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </aside>

            {/* Products Grid */}
            <div className="space-y-6">
              {isLoading ? (
                <CatalogGridSkeleton count={6} />
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">
                    {t.noProducts}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                      >
                        <ProductCard {...product} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {viewMode === "pagination" && (
                    <PaginationControls
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      hasNextPage={pagination.hasNextPage}
                      hasPrevPage={pagination.hasPrevPage}
                      onPageChange={pagination.goToPage}
                      startIndex={pagination.startIndex}
                      endIndex={pagination.endIndex}
                      totalItems={pagination.totalItems}
                      showQuickJump={pagination.totalPages > 10}
                    />
                  )}

                  {/* Lazy Load Trigger */}
                  {viewMode === "infinite" && (
                    <LazyLoadTrigger
                      observerRef={lazyLoad.observerRef}
                      hasMore={lazyLoad.hasMore}
                      isLoading={lazyLoad.isLoading}
                      loadedCount={lazyLoad.loadedCount}
                      totalCount={lazyLoad.totalCount}
                      onLoadMore={lazyLoad.loadMore}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;