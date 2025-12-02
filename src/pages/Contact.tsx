import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MapPin, Mail, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Add actual form submission logic
    toast({
      title: "Xabar yuborildi!",
      description: "Tez orada siz bilan bog'lanamiz.",
    });

    setFormData({ name: "", phone: "", email: "", message: "" });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-secondary/30 py-20 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">Biz Bilan Bog'laning</h1>
              <p className="text-lg text-muted-foreground">
                Savollaringiz bormi? Buyurtma bermoqchimisiz? Biz har doim yordam berishga tayyormiz!
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold mb-6">Aloqa Ma'lumotlari</h2>
                <p className="text-muted-foreground mb-8">
                  Quyidagi usullar orqali biz bilan bog'lanishingiz mumkin. Biz har doim sizning xizmatinizdamiz!
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Telefon Raqamlar</h3>
                    <p className="text-muted-foreground">+998 90 123 45 67</p>
                    <p className="text-muted-foreground">+998 91 234 56 78</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Elektron Pochta</h3>
                    <p className="text-muted-foreground">info@xojalikmollari.uz</p>
                    <p className="text-muted-foreground">support@xojalikmollari.uz</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Manzil</h3>
                    <p className="text-muted-foreground">
                      Toshkent shahar, Chilonzor tumani,<br />
                      Kichik halqa yo'li 1-uy
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Ish Vaqti</h3>
                    <p className="text-muted-foreground">Dushanba - Shanba: 9:00 - 20:00</p>
                    <p className="text-muted-foreground">Yakshanba: 10:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-card p-8 rounded-2xl border border-border">
                <h2 className="text-2xl font-bold mb-6">Xabar Yuborish</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium mb-2 block">
                      Ismingiz *
                    </label>
                    <Input
                      id="name"
                      placeholder="To'liq ismingizni kiriting"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="text-sm font-medium mb-2 block">
                      Telefon Raqam *
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="text-sm font-medium mb-2 block">
                      Email (ixtiyoriy)
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="text-sm font-medium mb-2 block">
                      Xabar *
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Xabaringizni yozing..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
                    <Send className="mr-2 h-5 w-5" />
                    Xabar Yuborish
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Map */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="mt-20"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Bizning Joylashuvimiz</h2>
            <div className="aspect-video rounded-2xl overflow-hidden border border-border bg-secondary">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.426076844384!2d69.20392931538396!3d41.31121597927122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b0cc379e9c3%3A0xa5a9323b4aa5cb98!2sTashkent%2C%20Uzbekistan!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
