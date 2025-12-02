import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export const ProductCard = ({ id, name, price, image, category }: ProductCardProps) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Add to cart functionality
    console.log("Add to cart:", id);
  };

  return (
    <Link to={`/product/${id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full border-border">
        <div className="aspect-square overflow-hidden bg-secondary">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{category}</p>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-2xl font-bold text-primary">{price.toLocaleString()} so'm</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            onClick={handleAddToCart}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Savatchaga
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};
