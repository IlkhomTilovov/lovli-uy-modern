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

      {/* Premium Mega Menu - Two Column Layout */}
      {catalogOpen && (
        <div className="hidden md:block absolute left-0 right-0 top-full w-full animate-fade-in z-50">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm -z-10"
            onClick={() => setCatalogOpen(false)}
          />
          
          {/* Mega Menu Content */}
          <div className="relative overflow-hidden bg-background border-b border-border shadow-2xl">
            <div className="container mx-auto px-4 py-8 relative">
              <div className="flex gap-8">
                {/* Left Side - Categories List */}
                <div className="w-56 shrink-0">
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                    KATEGORIYALAR
                  </h3>
                  <div className="space-y-1">
                    {activeCategories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/kategoriya/${category.id}`}
                        className="group flex items-center justify-between py-2.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <span className="text-sm font-medium">{category.name}</span>
                        <ChevronDown className="h-4 w-4 -rotate-90 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                    <Link
                      to="/catalog"
                      className="group flex items-center justify-between py-2.5 text-primary font-medium"
                    >
                      <span className="text-sm">Barcha mahsulotlar</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Right Side - Category Cards */}
                <div className="flex-1">
                  <div className="grid grid-cols-3 gap-4">
                    {activeCategories.slice(0, 3).map((category) => (
                      <Link
                        key={category.id}
                        to={`/kategoriya/${category.id}`}
                        className="group relative overflow-hidden rounded-2xl aspect-[4/3]"
                      >
                        {/* Background Image */}
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
                        )}
                        
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                        
                        {/* Content */}
                        <div className="absolute inset-0 p-5 flex flex-col justify-end">
                          <h4 className="text-xl font-bold text-white mb-1">
                            {category.name}
                          </h4>
                          <p className="text-sm text-white/80 mb-3 line-clamp-1">
                            {category.description || "Mahsulotlarni ko'ring"}
                          </p>
                          <div className="flex items-center gap-2 text-white group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Empty State */}
              {activeCategories.length === 0 && (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
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
