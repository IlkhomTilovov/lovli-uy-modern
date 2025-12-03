import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";

interface CategoryCardProps {
  name: string;
  image: string;
  productCount: number;
  slug: string;
}

export const CategoryCard = ({ name, image, productCount, slug }: CategoryCardProps) => {
  const isValidImage = image && image !== '/placeholder.svg';
  
  return (
    <Link to={`/kategoriya/${slug}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="group overflow-hidden cursor-pointer border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
          {/* Image Container with fixed aspect ratio */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/50">
            {isValidImage ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FolderOpen className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Product count badge */}
            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              {productCount} mahsulot
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors text-center">
              {name}
            </h3>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
};
