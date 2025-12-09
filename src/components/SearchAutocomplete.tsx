import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Loader2, ArrowRight, FolderOpen, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

type SearchResultItem = 
  | { type: 'category'; id: string; name: string; image: string | null; slug: string }
  | { type: 'product'; id: string; title: string; images: string[] | null; retail_price: number; discount_price: number | null; discount_active: boolean; categoryId?: string | null };

export const SearchAutocomplete = ({ 
  className, 
  placeholder = "Mahsulot qidirish...",
  onClose,
  isMobile = false
}: SearchAutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isLoading = productsLoading || categoriesLoading;

  // Filter and combine results
  const searchResults = useMemo<SearchResultItem[]>(() => {
    if (query.trim().length < 2) return [];

    const lowerQuery = query.toLowerCase();

    // Filter categories
    const filteredCategories = categories
      ?.filter(cat => 
        cat.status === 'active' && 
        (cat.name.toLowerCase().includes(lowerQuery) ||
         cat.description?.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 3)
      .map(cat => ({
        type: 'category' as const,
        id: cat.id,
        name: cat.name,
        image: cat.image,
        slug: cat.slug
      })) || [];

    // Get matching category IDs
    const matchingCategoryIds = filteredCategories.map(cat => cat.id);

    // Filter products - include products from matching categories OR products that match the search query
    const filteredProducts = products
      ?.filter(product => {
        // Check if product matches search query directly
        const matchesSearch = product.title.toLowerCase().includes(lowerQuery) ||
          product.description?.toLowerCase().includes(lowerQuery);
        
        // Check if product belongs to a matching category
        const belongsToMatchingCategory = product.category_id && matchingCategoryIds.includes(product.category_id);
        
        return matchesSearch || belongsToMatchingCategory;
      })
      .slice(0, 8) // Show more products since we're including category products
      .map(product => ({
        type: 'product' as const,
        id: product.id,
        title: product.title,
        images: product.images,
        retail_price: product.retail_price,
        discount_price: product.discount_price,
        discount_active: product.discount_active,
        categoryId: product.category_id
      })) || [];

    return [...filteredCategories, ...filteredProducts];
  }, [query, products, categories]);

  const hasResults = searchResults.length > 0;
  const showDropdown = isOpen && query.trim().length >= 2;

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          const item = searchResults[selectedIndex];
          if (item.type === 'category') {
            navigate(`/kategoriya/${item.id}`);
          } else {
            navigate(`/product/${item.id}`);
          }
          handleClose();
        } else if (query.trim()) {
          navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
          handleClose();
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClose = () => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    onClose?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
      handleClose();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  // Separate categories and products for display
  const categoryResults = searchResults.filter(item => item.type === 'category');
  const productResults = searchResults.filter(item => item.type === 'product');

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className={cn(
              "pl-9 pr-9 transition-all duration-200",
              isMobile ? "w-full h-11" : "w-[200px] lg:w-[300px] h-9",
              showDropdown && "rounded-b-none border-b-0"
            )}
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div className={cn(
          "absolute left-0 right-0 top-full z-50",
          "bg-background border border-t-0 border-border rounded-b-lg shadow-lg",
          "animate-fade-in overflow-hidden"
        )}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : hasResults ? (
            <>
              <div className="max-h-[400px] overflow-y-auto">
                {/* Categories Section */}
                {categoryResults.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-muted/30 border-b border-border">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <FolderOpen className="h-3 w-3" />
                        Kategoriyalar
                      </span>
                    </div>
                    {categoryResults.map((item, idx) => {
                      if (item.type !== 'category') return null;
                      const globalIndex = idx;
                      return (
                        <Link
                          key={item.id}
                          to={`/kategoriya/${item.id}`}
                          onClick={handleClose}
                          className={cn(
                            "flex items-center gap-3 p-3 transition-colors",
                            "hover:bg-muted/50",
                            selectedIndex === globalIndex && "bg-muted"
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FolderOpen className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Kategoriya</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Products Section */}
                {productResults.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-muted/30 border-b border-border">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Package className="h-3 w-3" />
                        Mahsulotlar
                      </span>
                    </div>
                    {productResults.map((item, idx) => {
                      if (item.type !== 'product') return null;
                      const globalIndex = categoryResults.length + idx;
                      return (
                        <Link
                          key={item.id}
                          to={`/product/${item.id}`}
                          onClick={handleClose}
                          className={cn(
                            "flex items-center gap-3 p-3 transition-colors",
                            "hover:bg-muted/50",
                            selectedIndex === globalIndex && "bg-muted"
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {item.images?.[0] ? (
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <div className="flex items-center gap-2">
                              {item.discount_active && item.discount_price ? (
                                <>
                                  <span className="text-sm font-semibold text-primary">
                                    {formatPrice(item.discount_price)}
                                  </span>
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(item.retail_price)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-semibold text-primary">
                                  {formatPrice(item.retail_price)}
                                </span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* View All Results */}
              <div className="border-t border-border p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-sm hover:text-primary"
                  onClick={() => {
                    navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
                    handleClose();
                  }}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Barcha natijalarni ko'rish
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                "{query}" bo'yicha hech narsa topilmadi
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Boshqa kalit so'zlarni sinab ko'ring
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
