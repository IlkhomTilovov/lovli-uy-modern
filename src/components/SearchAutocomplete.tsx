import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProducts } from "@/hooks/useProducts";

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

export const SearchAutocomplete = ({ 
  className, 
  placeholder = "Mahsulot qidirish...",
  onClose,
  isMobile = false
}: SearchAutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { data: products, isLoading } = useProducts();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Filter products based on query
  const filteredProducts = query.trim().length >= 2
    ? products?.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6) || []
    : [];

  const hasResults = filteredProducts.length > 0;
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
          prev < filteredProducts.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && filteredProducts[selectedIndex]) {
          navigate(`/product/${filteredProducts[selectedIndex].id}`);
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
              <div className="max-h-[360px] overflow-y-auto">
                {filteredProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={handleClose}
                    className={cn(
                      "flex items-center gap-3 p-3 transition-colors",
                      "hover:bg-muted/50",
                      selectedIndex === index && "bg-muted"
                    )}
                  >
                    {/* Product Image */}
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          Rasm yo'q
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {product.discount_active && product.discount_price ? (
                          <>
                            <span className="text-sm font-semibold text-primary">
                              {formatPrice(product.discount_price)}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.retail_price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-primary">
                            {formatPrice(product.retail_price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                ))}
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
