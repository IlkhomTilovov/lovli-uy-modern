import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, ChevronDown, Search, ArrowRight, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { SearchAutocomplete } from "./SearchAutocomplete";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const cartItems = 0;
  const { data: categories } = useCategories();
  const catalogRef = useRef<HTMLDivElement>(null);

  const activeCategories = categories?.filter(cat => cat.status === 'active') || [];

  const links = [
    { href: "/", label: "Bosh Sahifa" },
    { href: "/about", label: "Biz Haqimizda" },
    { href: "/contact", label: "Aloqa" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isCatalogActive = location.pathname === "/catalog" || location.pathname.startsWith("/kategoriya");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catalogRef.current && !catalogRef.current.contains(event.target as Node)) {
        setCatalogOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setCatalogOpen(false);
    setIsOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">XM</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">Xojalik Mollari</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative py-2",
                isActive("/")
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground"
              )}
            >
              Bosh Sahifa
            </Link>

            {/* Katalog Dropdown */}
            <div ref={catalogRef} className="relative">
              <button
                onClick={() => setCatalogOpen(!catalogOpen)}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary py-2",
                  isCatalogActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                Katalog
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    catalogOpen && "rotate-180"
                  )} 
                />
              </button>
            </div>

            {links.slice(1).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-2",
                  isActive(link.href)
                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {/* Desktop Search with Autocomplete */}
            <div className="hidden md:block">
              <SearchAutocomplete placeholder="Qidirish..." />
            </div>

            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden py-3 border-t border-border animate-fade-in">
            <SearchAutocomplete 
              isMobile 
              placeholder="Mahsulot qidirish..."
              onClose={() => setSearchOpen(false)}
            />
          </div>
        )}

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md",
                  isActive("/") ? "text-primary bg-primary/10" : "text-muted-foreground"
                )}
              >
                Bosh Sahifa
              </Link>
              
              {/* Mobile Katalog */}
              <div className="px-4 py-2">
                <Link
                  to="/catalog"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isCatalogActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Katalog
                </Link>
                <div className="mt-2 pl-4 space-y-1">
                  {activeCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/kategoriya/${category.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block text-sm text-muted-foreground hover:text-primary py-1"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              {links.slice(1).map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md",
                    isActive(link.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full-width Mega Menu Catalog Dropdown */}
      {catalogOpen && (
        <div className="hidden md:block absolute left-0 right-0 top-full w-full animate-fade-in z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setCatalogOpen(false)}
          />
          
          {/* Mega Menu Content */}
          <div className="bg-gradient-to-b from-background via-background to-muted/30 border-b border-border shadow-2xl">
            <div className="container mx-auto px-4 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Kategoriyalar</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Barcha mahsulotlarimizni ko'ring
                  </p>
                </div>
                <Link 
                  to="/catalog" 
                  className="group flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  Barcha mahsulotlar
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {activeCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/kategoriya/${category.id}`}
                    className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative flex items-center gap-4">
                      {/* Category Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex-shrink-0 ring-2 ring-border group-hover:ring-primary/30 transition-all">
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FolderOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Category Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Empty State */}
              {activeCategories.length === 0 && (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Hozircha kategoriyalar yo'q</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
