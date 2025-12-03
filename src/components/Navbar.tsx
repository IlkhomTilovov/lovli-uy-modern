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

      {/* Premium Mega Menu */}
      {catalogOpen && (
        <div className="hidden md:block absolute left-0 right-0 top-full w-full animate-fade-in z-50">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm -z-10"
            onClick={() => setCatalogOpen(false)}
          />
          
          {/* Mega Menu Content */}
          <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b-2 border-primary/20 shadow-2xl">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="container mx-auto px-4 py-10 relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      Kategoriyalar
                    </h3>
                  </div>
                  <p className="text-muted-foreground ml-4">
                    Sizga kerak bo'lgan barcha mahsulotlar
                  </p>
                </div>
                <Link 
                  to="/catalog" 
                  className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-semibold overflow-hidden"
                >
                  <span className="relative z-10">Barcha mahsulotlar</span>
                  <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                </Link>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {activeCategories.map((category, index) => (
                  <Link
                    key={category.id}
                    to={`/kategoriya/${category.id}`}
                    className="group relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Card Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    
                    <div className="relative p-5">
                      {/* Category Image */}
                      <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/50 shadow-inner">
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                        
                        {/* Image Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Category Info */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {category.description}
                          </p>
                        )}
                        
                        {/* View Link */}
                        <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 pt-1">
                          <span>Ko'rish</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Empty State */}
              {activeCategories.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">Hozircha kategoriyalar yo'q</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Tez orada yangi kategoriyalar qo'shiladi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
