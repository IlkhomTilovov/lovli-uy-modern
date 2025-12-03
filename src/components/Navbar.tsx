import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
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

          <div className="flex items-center space-x-4">
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

      {/* Full-width Catalog Dropdown */}
      {catalogOpen && (
        <div className="hidden md:block absolute left-0 right-0 top-full w-full bg-background border-b border-border shadow-lg animate-fade-in z-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Kategoriyalar</h3>
              <Link 
                to="/catalog" 
                className="text-sm text-primary hover:underline"
              >
                Barcha mahsulotlar →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {activeCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/kategoriya/${category.id}`}
                  className="group flex flex-col items-center p-4 rounded-lg hover:bg-muted transition-colors"
                >
                  {category.image && (
                    <div className="w-16 h-16 mb-2 rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
