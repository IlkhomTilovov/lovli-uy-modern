import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CategoryCardProps {
  name: string;
  image: string;
  productCount: number;
  slug: string;
}

export const CategoryCard = ({ name, image, productCount, slug }: CategoryCardProps) => {
  return (
    <Link to={`/kategoriya/${slug}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="group overflow-hidden cursor-pointer border-border hover:shadow-xl transition-all duration-300">
          <div className="aspect-square overflow-hidden bg-secondary relative">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="p-6 text-center">
            <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-muted-foreground text-sm">{productCount} mahsulot</p>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
};
