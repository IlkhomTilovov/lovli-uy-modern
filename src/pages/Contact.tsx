import { useState, useEffect } from "react";
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

type Language = "uz" | "ru";

const LANGUAGE_KEY = "site_language";

const translations = {
  uz: {
    heroTitle: "Biz Bilan Bog'laning",
    heroSubtitle: "Savollaringiz bormi? Buyurtma bermoqchimisiz? Biz har doim yordam berishga tayyormiz!",
    infoTitle: "Aloqa Ma'lumotlari",
    infoSubtitle: "Quyidagi usullar orqali biz bilan bog'lanishingiz mumkin. Biz har doim sizning xizmatinizdamiz!",
    formTitle: "Xabar Yuborish",
    phoneLabel: "Telefon Raqamlar",
    emailLabel: "Elektron Pochta",
    addressLabel: "Manzil",
    workingHoursLabel: "Ish Vaqti",
    nameLabel: "Ismingiz *",
    namePlaceholder: "To'liq ismingizni kiriting",
    phoneFormLabel: "Telefon Raqam *",
    emailFormLabel: "Email (ixtiyoriy)",
    messageLabel: "Xabar *",
    messagePlaceholder: "Xabaringizni yozing...",
    submitButton: "Xabar Yuborish",
    mapTitle: "Bizning Joylashuvimiz",
    toastTitle: "Xabar yuborildi!",
    toastDescription: "Tez orada siz bilan bog'lanamiz.",
    weekdays: "Dushanba - Shanba: 9:00 - 20:00",
    sunday: "Yakshanba: 10:00 - 18:00"
  },
  ru: {
    heroTitle: "Свяжитесь с нами",
    heroSubtitle: "Есть вопросы? Хотите сделать заказ? Мы всегда готовы помочь!",
    infoTitle: "Контактная информация",
    infoSubtitle: "Вы можете связаться с нами следующими способами. Мы всегда к вашим услугам!",
    formTitle: "Отправить сообщение",
    phoneLabel: "Номера телефонов",
    emailLabel: "Электронная почта",
    addressLabel: "Адрес",
    workingHoursLabel: "Рабочее время",
    nameLabel: "Ваше имя *",
    namePlaceholder: "Введите ваше полное имя",
    phoneFormLabel: "Номер телефона *",
    emailFormLabel: "Email (необязательно)",
    messageLabel: "Сообщение *",
    messagePlaceholder: "Напишите ваше сообщение...",
    submitButton: "Отправить сообщение",
    mapTitle: "Наше местоположение",
    toastTitle: "Сообщение отправлено!",
    toastDescription: "Мы свяжемся с вами в ближайшее время.",
    weekdays: "Понедельник - Суббота: 9:00 - 20:00",
    sunday: "Воскресенье: 10:00 - 18:00"
  }
};

const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === "uz" || saved === "ru") return saved;
  }
  return "uz";
};

const Contact = () => {
  const { toast } = useToast();
  const { contact, isLoading } = useSiteContent();
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });

  // Listen for language changes from Navbar
  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail);
    };
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, []);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const t = translations[language];

  // Default values for contact data (not translations)
  const defaults = {
    phone: "+998 90 123 45 67",
    phone2: "+998 91 234 56 78",
    email: "info@xojalikmollari.uz",
    email2: "support@xojalikmollari.uz",
    address: language === "uz" ? "Toshkent shahar, Chilonzor tumani" : "г. Ташкент, Чиланзарский район",
    addressLine2: language === "uz" ? "Kichik halqa yo'li 1-uy" : "Малая кольцевая дорога, дом 1",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.426076844384!2d69.20392931538396!3d41.31121597927122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b0cc379e9c3%3A0xa5a9323b4aa5cb98!2sTashkent%2C%20Uzbekistan!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s"
  };

  // Merge with DB content
  const content = {
    phone: contact?.phone || defaults.phone,
    phone2: contact?.phone2 || defaults.phone2,
    email: contact?.email || defaults.email,
    email2: contact?.email2 || defaults.email2,
    address: defaults.address,
    addressLine2: defaults.addressLine2,
    mapUrl: contact?.mapUrl || defaults.mapUrl
  };

  useSEO({
    title: language === "uz" ? "Aloqa | Do'kon - Biz Bilan Bog'laning" : "Контакты | Магазин - Свяжитесь с нами",
    description: t.heroSubtitle,
    url: `${window.location.origin}/contact`,
    type: 'website',
    breadcrumbs: [
      { name: language === "uz" ? "Bosh sahifa" : "Главная", url: window.location.origin },
      { name: language === "uz" ? "Aloqa" : "Контакты", url: `${window.location.origin}/contact` }
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
      title: t.toastTitle,
      description: t.toastDescription,
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
            {/* Language Switcher */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg border border-border bg-card p-1">
                <button
                  onClick={() => setLanguage("uz")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    language === "uz"
                      ? "bg-amber-500 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  O'zbekcha
                </button>
                <button
                  onClick={() => setLanguage("ru")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    language === "ru"
                      ? "bg-amber-500 text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Русский
                </button>
              </div>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{t.heroTitle}</h1>
              <p className="text-muted-foreground">{t.heroSubtitle}</p>
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
                <h2 className="text-2xl font-bold mb-3">{t.infoTitle}</h2>
                <p className="text-muted-foreground text-sm">{t.infoSubtitle}</p>
              </div>

              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{t.phoneLabel}</h3>
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
                    <h3 className="font-semibold text-sm mb-1">{t.emailLabel}</h3>
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
                    <h3 className="font-semibold text-sm mb-1">{t.addressLabel}</h3>
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
                    <h3 className="font-semibold text-sm mb-1">{t.workingHoursLabel}</h3>
                    <p className="text-muted-foreground text-sm">{t.weekdays}</p>
                    <p className="text-muted-foreground text-sm">{t.sunday}</p>
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
                <h2 className="text-xl font-bold mb-6">{t.formTitle}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium mb-2 block">
                      {t.nameLabel}
                    </label>
                    <Input
                      id="name"
                      placeholder={t.namePlaceholder}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="text-sm font-medium mb-2 block">
                      {t.phoneFormLabel}
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
                      {t.emailFormLabel}
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
                      {t.messageLabel}
                    </label>
                    <Textarea
                      id="message"
                      placeholder={t.messagePlaceholder}
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
                    {t.submitButton}
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
            <h2 className="text-2xl font-bold mb-6 text-center">{t.mapTitle}</h2>
            <div className="aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden border border-border bg-secondary">
              <iframe
                src={content.mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t.mapTitle}
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
