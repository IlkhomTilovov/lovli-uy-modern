import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MapPin, Mail, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { useSiteContent } from "@/hooks/useSiteContent";

const Contact = () => {
  const { toast } = useToast();
  const { contact, isLoading } = useSiteContent();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });

  // Default values
  const defaults = {
    heroTitle: "Biz Bilan Bog'laning",
    heroSubtitle: "Savollaringiz bormi? Buyurtma bermoqchimisiz? Biz har doim yordam berishga tayyormiz!",
    infoTitle: "Aloqa Ma'lumotlari",
    infoSubtitle: "Quyidagi usullar orqali biz bilan bog'lanishingiz mumkin. Biz har doim sizning xizmatinizdamiz!",
    formTitle: "Xabar Yuborish",
    phone: "+998 90 123 45 67",
    phone2: "+998 91 234 56 78",
    email: "info@xojalikmollari.uz",
    email2: "support@xojalikmollari.uz",
    address: "Toshkent shahar, Chilonzor tumani",
    addressLine2: "Kichik halqa yo'li 1-uy",
    workingHours: {
      weekdays: "Dushanba - Shanba: 9:00 - 20:00",
      sunday: "Yakshanba: 10:00 - 18:00"
    },
    mapTitle: "Bizning Joylashuvimiz",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.426076844384!2d69.20392931538396!3d41.31121597927122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b0cc379e9c3%3A0xa5a9323b4aa5cb98!2sTashkent%2C%20Uzbekistan!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s",
    submitButtonText: "Xabar Yuborish"
  };

  // Merge with DB content
  const content = {
    heroTitle: contact?.heroTitle || defaults.heroTitle,
    heroSubtitle: contact?.heroSubtitle || defaults.heroSubtitle,
    infoTitle: contact?.infoTitle || defaults.infoTitle,
    infoSubtitle: contact?.infoSubtitle || defaults.infoSubtitle,
    formTitle: contact?.formTitle || defaults.formTitle,
    phone: contact?.phone || defaults.phone,
    phone2: contact?.phone2 || defaults.phone2,
    email: contact?.email || defaults.email,
    email2: contact?.email2 || defaults.email2,
    address: contact?.address || defaults.address,
    addressLine2: contact?.addressLine2 || defaults.addressLine2,
    workingHours: {
      weekdays: contact?.workingHours?.weekdays || defaults.workingHours.weekdays,
      sunday: contact?.workingHours?.sunday || defaults.workingHours.sunday
    },
    mapTitle: contact?.mapTitle || defaults.mapTitle,
    mapUrl: contact?.mapUrl || defaults.mapUrl,
    submitButtonText: contact?.submitButtonText || defaults.submitButtonText
  };

  useSEO({
    title: "Aloqa | Do'kon - Biz Bilan Bog'laning",
    description: content.heroSubtitle,
    url: `${window.location.origin}/contact`,
    type: 'website',
    breadcrumbs: [
      { name: "Bosh sahifa", url: window.location.origin },
      { name: "Aloqa", url: `${window.location.origin}/contact` }
    ],
    localBusiness: {
      name: "Do'kon - Xojalik Mollari",
      description: "Sifatli va arzon xojalik mahsulotlari do'koni. Tozalash, gigiena, kir yuvish va uy-ro'zg'or mollari.",
      telephone: content.phone,
      email: content.email,
      priceRange: "$$",
      address: {
        streetAddress: content.addressLine2,
        addressLocality: content.address,
        addressRegion: "Toshkent",
        postalCode: "100000",
        addressCountry: "UZ"
      },
      openingHours: ["Mo-Sa 09:00-20:00", "Su 10:00-18:00"]
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{content.heroTitle}</h1>
              <p className="text-muted-foreground">{content.heroSubtitle}</p>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Info */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-3">{content.infoTitle}</h2>
                <p className="text-muted-foreground text-sm">{content.infoSubtitle}</p>
              </div>

              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Telefon Raqamlar</h3>
                    <p className="text-muted-foreground text-sm">{content.phone}</p>
                    {content.phone2 && <p className="text-muted-foreground text-sm">{content.phone2}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Elektron Pochta</h3>
                    <p className="text-muted-foreground text-sm">{content.email}</p>
                    {content.email2 && <p className="text-muted-foreground text-sm">{content.email2}</p>}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Manzil</h3>
                    <p className="text-muted-foreground text-sm">
                      {content.address}
                      {content.addressLine2 && <><br />{content.addressLine2}</>}
                    </p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Ish Vaqti</h3>
                    <p className="text-muted-foreground text-sm">{content.workingHours.weekdays}</p>
                    <p className="text-muted-foreground text-sm">{content.workingHours.sunday}</p>
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
              <div className="bg-card p-6 lg:p-8 rounded-2xl border border-border shadow-sm">
                <h2 className="text-xl font-bold mb-6">{content.formTitle}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
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
                      className="h-11"
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
                      className="h-11"
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
                      className="h-11"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="text-sm font-medium mb-2 block">
                      Xabar *
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Xabaringizni yozing..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium" 
                    size="lg"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {content.submitButtonText}
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
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">{content.mapTitle}</h2>
            <div className="aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden border border-border bg-secondary">
              <iframe
                src={content.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bizning joylashuvimiz"
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
