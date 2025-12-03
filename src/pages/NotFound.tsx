import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Package } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center">
            {/* Animated 404 Number */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative inline-block mb-8"
            >
              <span className="text-[150px] sm:text-[200px] font-black text-primary/10 leading-none select-none">
                404
              </span>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                </div>
              </motion.div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-4 mb-10"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Sahifa topilmadi
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki boshqa joyga ko'chirilgan bo'lishi mumkin.
              </p>
              <p className="text-sm text-muted-foreground/70">
                Manzil: <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code>
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="min-w-[180px]">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Bosh sahifaga
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-[180px]">
                <Link to="/catalog">
                  <Search className="w-4 h-4 mr-2" />
                  Katalogga o'tish
                </Link>
              </Button>
            </motion.div>

            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-8"
            >
              <button
                onClick={() => window.history.back()}
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Orqaga qaytish
              </button>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
