import { Link } from "react-router-dom";
import { ShoppingCart, Eye, Heart, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  hasDiscount?: boolean;
  discountPercent?: number;
  isBestSeller?: boolean;
  isNew?: boolean;
  className?: string;
}

export const ProductCard = ({ 
  id, 
  name, 
  price, 
  originalPrice,
  image, 
  category,
  hasDiscount,
  discountPercent,
  isBestSeller,
  isNew,
  className
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Add to cart functionality
    console.log("Add to cart:", id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Quick view functionality
    console.log("Quick view:", id);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  // Save to viewed products
  const saveToViewed = () => {
    const viewed = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    const filtered = viewed.filter((v: string) => v !== id);
    filtered.unshift(id);
    localStorage.setItem('viewedProducts', JSON.stringify(filtered.slice(0, 10)));
  };

  // Calculate discount percentage
  const calculatedDiscount = discountPercent || (hasDiscount && originalPrice 
    ? Math.round((1 - price / originalPrice) * 100) 
    : 0);

  return (
    <Link to={`/product/${id}`} onClick={saveToViewed}>
      <Card 
        className={cn(
          "group overflow-hidden hover:shadow-xl transition-all duration-300 h-full border-border relative",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {calculatedDiscount > 0 && (
            <Badge className="bg-red-500 hover:bg-red-500 text-white font-bold px-2 py-1">
              <Percent className="h-3 w-3 mr-1" />
              -{calculatedDiscount}%
            </Badge>
          )}
          {isBestSeller && (
            <Badge className="bg-orange-500 hover:bg-orange-500 text-white font-bold px-2 py-1">
              🔥 Bestseller
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-green-500 hover:bg-green-500 text-white font-bold px-2 py-1">
              Yangi
            </Badge>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={cn(
            "absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300",
            isLiked 
              ? "bg-red-500 text-white" 
              : "bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-background hover:text-red-500"
          )}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        </button>

        {/* Image Container */}
        <div className="aspect-square overflow-hidden bg-secondary relative">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Quick Actions Overlay */}
          <div 
            className={cn(
              "absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={handleQuickView}
              className="rounded-full"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ko'rish
            </Button>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="rounded-full bg-primary hover:bg-primary/90"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Qo'shish
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{category}</p>
          <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xl font-bold text-primary">{price.toLocaleString()} so'm</p>
            {hasDiscount && originalPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {originalPrice.toLocaleString()} so'm
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
