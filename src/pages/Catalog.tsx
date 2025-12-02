import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { products, categories } from "@/data/products";
import { motion } from "framer-motion";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const selectedCategory = searchParams.get("category") || "all";

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === "all" || product.categorySlug === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (slug: string) => {
    if (slug === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", slug);
    }
    setSearchParams(searchParams);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-secondary/30 py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold mb-4">Mahsulotlar Katalogi</h1>
              <p className="text-muted-foreground text-lg">
                {filteredProducts.length} mahsulot topildi
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[280px,1fr] gap-8">
            {/* Sidebar Filters */}
            <aside className="space-y-6">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold text-lg">Filtrlar</h2>
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Qidirish</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Mahsulot nomi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Kategoriyalar</label>
                    <div className="space-y-2">
                      <Button
                        variant={selectedCategory === "all" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleCategoryChange("all")}
                      >
                        Barcha mahsulotlar
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category.slug}
                          variant={selectedCategory === category.slug ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => handleCategoryChange(category.slug)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </aside>

            {/* Products Grid */}
            <div>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">
                    Mahsulot topilmadi. Boshqa kategoriyani tanlang yoki qidiruv so'zini o'zgartiring.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial="hidden"
                      animate="visible"
                      variants={fadeInUp}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <ProductCard {...product} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;
