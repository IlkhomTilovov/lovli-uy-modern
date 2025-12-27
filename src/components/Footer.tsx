import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, MapPin, Mail, Facebook, Instagram, Send, Youtube, MessageCircle, Clock, ArrowRight } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";

type Language = "uz" | "ru" | "kk" | "tg" | "tk" | "ky" | "fa";
const LANGUAGE_KEY = "site_language";

const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    const validLanguages: Language[] = ["uz", "ru", "kk", "tg", "tk", "ky", "fa"];
    if (saved && validLanguages.includes(saved as Language)) return saved as Language;
  }
  return "uz";
};

const translations: Record<Language, Record<string, string>> = {
  uz: {
    companyName: "Xojalik Mollari",
    slogan: "Sifat va ishonch",
    description: "Sifatli va arzon xojalik mollari. Sizning uyingiz uchun eng yaxshi mahsulotlar.",
    ctaTitle: "Savollaringiz bormi?",
    ctaSubtitle: "Biz bilan bog'laning - yordam berishdan mamnunmiz!",
    ctaButtonText: "Bog'lanish",
    pagesTitle: "Sahifalar",
    contactTitle: "Aloqa",
    workingHoursTitle: "Ish Vaqti",
    socialTitle: "Ijtimoiy Tarmoqlar",
    copyright: `© ${new Date().getFullYear()} Xojalik Mollari. Barcha huquqlar himoyalangan.`,
    privacyText: "Maxfiylik siyosati",
    termsText: "Foydalanish shartlari",
    home: "Bosh Sahifa",
    catalog: "Katalog",
    about: "Biz Haqimizda",
    contact: "Aloqa",
    weekdays: "Du-Sha",
    sunday: "Yak"
  },
  ru: {
    companyName: "Хозяйственные товары",
    slogan: "Качество и доверие",
    description: "Качественные и доступные хозяйственные товары. Лучшие товары для вашего дома.",
    ctaTitle: "Есть вопросы?",
    ctaSubtitle: "Свяжитесь с нами - мы рады помочь!",
    ctaButtonText: "Связаться",
    pagesTitle: "Страницы",
    contactTitle: "Контакты",
    workingHoursTitle: "Время работы",
    socialTitle: "Социальные сети",
    copyright: `© ${new Date().getFullYear()} Хозяйственные товары. Все права защищены.`,
    privacyText: "Политика конфиденциальности",
    termsText: "Условия использования",
    home: "Главная",
    catalog: "Каталог",
    about: "О нас",
    contact: "Контакты",
    weekdays: "Пн-Сб",
    sunday: "Вс"
  },
  kk: {
    companyName: "Шаруашылық тауарлары",
    slogan: "Сапа және сенім",
    description: "Сапалы және қолжетімді шаруашылық тауарлары. Үйіңіз үшін ең жақсы өнімдер.",
    ctaTitle: "Сұрақтарыңыз бар ма?",
    ctaSubtitle: "Бізбен хабарласыңыз - көмектесуге қуаныштымыз!",
    ctaButtonText: "Байланысу",
    pagesTitle: "Беттер",
    contactTitle: "Байланыс",
    workingHoursTitle: "Жұмыс уақыты",
    socialTitle: "Әлеуметтік желілер",
    copyright: `© ${new Date().getFullYear()} Шаруашылық тауарлары. Барлық құқықтар қорғалған.`,
    privacyText: "Құпиялылық саясаты",
    termsText: "Пайдалану шарттары",
    home: "Басты бет",
    catalog: "Каталог",
    about: "Біз туралы",
    contact: "Байланыс",
    weekdays: "Дү-Сн",
    sunday: "Жс"
  },
  tg: {
    companyName: "Молҳои хоҷагӣ",
    slogan: "Сифат ва эътимод",
    description: "Молҳои хоҷагии сифатнок ва арзон. Беҳтарин маҳсулотҳо барои хонаи шумо.",
    ctaTitle: "Саволҳо доред?",
    ctaSubtitle: "Бо мо тамос гиред - мо аз кӯмак хушнудем!",
    ctaButtonText: "Тамос",
    pagesTitle: "Саҳифаҳо",
    contactTitle: "Тамос",
    workingHoursTitle: "Вақти корӣ",
    socialTitle: "Шабакаҳои иҷтимоӣ",
    copyright: `© ${new Date().getFullYear()} Молҳои хоҷагӣ. Ҳамаи ҳуқуқҳо ҳифз шудаанд.`,
    privacyText: "Сиёсати махфият",
    termsText: "Шартҳои истифода",
    home: "Саҳифаи асосӣ",
    catalog: "Каталог",
    about: "Дар бораи мо",
    contact: "Тамос",
    weekdays: "Дш-Шб",
    sunday: "Як"
  },
  tk: {
    companyName: "Hojalyk harytlary",
    slogan: "Hil we ynam",
    description: "Ýokary hilli we elýeterli hojalyk harytlary. Öýüňiz üçin iň gowy önümler.",
    ctaTitle: "Soraglaryňyz barmy?",
    ctaSubtitle: "Biz bilen habarlaşyň - kömek etmäge şat!",
    ctaButtonText: "Habarlaşmak",
    pagesTitle: "Sahypalar",
    contactTitle: "Habarlaşmak",
    workingHoursTitle: "Iş wagty",
    socialTitle: "Sosial ulgamlar",
    copyright: `© ${new Date().getFullYear()} Hojalyk harytlary. Ähli hukuklar goragly.`,
    privacyText: "Gizlinlik syýasaty",
    termsText: "Ulanmak şertleri",
    home: "Baş sahypa",
    catalog: "Katalog",
    about: "Biz barada",
    contact: "Habarlaşmak",
    weekdays: "Du-Şe",
    sunday: "Ýb"
  },
  ky: {
    companyName: "Чарба товарлары",
    slogan: "Сапат жана ишеним",
    description: "Сапаттуу жана жеткиликтүү чарба товарлары. Үйүңүз үчүн эң жакшы товарлар.",
    ctaTitle: "Суроолоруңуз барбы?",
    ctaSubtitle: "Биз менен байланышыңыз - жардам берүүдөн кубанычтуубуз!",
    ctaButtonText: "Байланышуу",
    pagesTitle: "Беттер",
    contactTitle: "Байланыш",
    workingHoursTitle: "Иш убактысы",
    socialTitle: "Социалдык тармактар",
    copyright: `© ${new Date().getFullYear()} Чарба товарлары. Бардык укуктар корголгон.`,
    privacyText: "Купуялык саясаты",
    termsText: "Пайдалануу шарттары",
    home: "Башкы бет",
    catalog: "Каталог",
    about: "Биз жөнүндө",
    contact: "Байланыш",
    weekdays: "Дш-Шб",
    sunday: "Жш"
  },
  fa: {
    companyName: "کالاهای خانگی",
    slogan: "کیفیت و اعتماد",
    description: "کالاهای خانگی با کیفیت و مقرون به صرفه. بهترین محصولات برای خانه شما.",
    ctaTitle: "سوالی دارید؟",
    ctaSubtitle: "با ما تماس بگیرید - خوشحال می‌شویم کمک کنیم!",
    ctaButtonText: "تماس",
    pagesTitle: "صفحات",
    contactTitle: "تماس",
    workingHoursTitle: "ساعات کاری",
    socialTitle: "شبکه‌های اجتماعی",
    copyright: `© ${new Date().getFullYear()} کالاهای خانگی. تمامی حقوق محفوظ است.`,
    privacyText: "سیاست حفظ حریم خصوصی",
    termsText: "شرایط استفاده",
    home: "صفحه اصلی",
    catalog: "کاتالوگ",
    about: "درباره ما",
    contact: "تماس",
    weekdays: "شنبه-پنج",
    sunday: "جمعه"
  }
};

export const Footer = () => {
  const { contact, social, footer, branding, isLoading: isBrandingLoading } = useSiteContent();
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  // Listen for language changes from Navbar
  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail);
    };
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, []);

  const t = translations[language];

  const hasSocialLinks = social?.facebook || social?.instagram || social?.telegram || social?.youtube || social?.whatsapp;

  // Merge with translations
  const content = {
    companyName: t.companyName,
    slogan: t.slogan,
    description: t.description,
    ctaTitle: t.ctaTitle,
    ctaSubtitle: t.ctaSubtitle,
    ctaButtonText: t.ctaButtonText,
    pagesTitle: t.pagesTitle,
    contactTitle: t.contactTitle,
    workingHoursTitle: t.workingHoursTitle,
    socialTitle: t.socialTitle,
    copyright: t.copyright,
    privacyText: t.privacyText,
    termsText: t.termsText
  };

  const navLinks = [
    { to: "/", label: t.home },
    { to: "/catalog", label: t.catalog },
    { to: "/about", label: t.about },
    { to: "/contact", label: t.contact },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-secondary to-secondary/80 border-t border-border mt-20 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 py-12 lg:py-16 relative">
        {/* Top Section - CTA */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 sm:p-8 mb-12 text-primary-foreground">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">{content.ctaTitle}</h3>
              <p className="text-primary-foreground/80 text-sm sm:text-base">{content.ctaSubtitle}</p>
            </div>
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link to="/contact">
                {content.ctaButtonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              {isBrandingLoading ? (
                <>
                  <div className="w-12 h-12 bg-muted rounded-xl animate-pulse" />
                  <div>
                    <div className="w-28 h-5 bg-muted rounded animate-pulse mb-1" />
                    <div className="w-20 h-3 bg-muted rounded animate-pulse" />
                  </div>
                </>
              ) : branding?.logo ? (
                <>
                  <img 
                    src={branding.logo} 
                    alt="Logo" 
                    className="h-12 object-contain"
                  />
                  <div>
                    <span className="font-bold text-lg block">{branding?.siteName || content.companyName}</span>
                    <span className="text-xs text-muted-foreground">{content.slogan}</span>
                  </div>
                </>
              ) : branding?.siteName ? (
                <>
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-primary-foreground font-bold text-2xl">
                      {branding.siteName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-lg block">{branding.siteName}</span>
                    <span className="text-xs text-muted-foreground">{content.slogan}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-primary-foreground font-bold text-2xl">XM</span>
                  </div>
                  <div>
                    <span className="font-bold text-lg block">{content.companyName}</span>
                    <span className="text-xs text-muted-foreground">{content.slogan}</span>
                  </div>
                </>
              )}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {content.description}
            </p>
            
            {/* Social Links - Mobile visible here */}
            {hasSocialLinks && (
              <div className="lg:hidden">
                <h4 className="font-semibold text-sm mb-3">{content.socialTitle}</h4>
                <div className="flex flex-wrap gap-2">
                  {social?.telegram && (
                    <a
                      href={social.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-background rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                    >
                      <Send className="h-5 w-5" />
                    </a>
                  )}
                  {social?.instagram && (
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-background rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {social?.facebook && (
                    <a
                      href={social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-background rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {social?.youtube && (
                    <a
                      href={social.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-background rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                  {social?.whatsapp && (
                    <a
                      href={`https://wa.me/${social.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-background rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              {content.pagesTitle}
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              {content.contactTitle}
            </h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href={`tel:${contact?.phone || "+998901234567"}`}
                  className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{contact?.phone || "+998 90 123 45 67"}</p>
                    {contact?.phone2 && <p className="text-xs">{contact.phone2}</p>}
                  </div>
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${contact?.email || "info@xojalikmollari.uz"}`}
                  className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="break-all">{contact?.email || "info@xojalikmollari.uz"}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span>{contact?.address || (language === "uz" ? "Toshkent sh., Chilonzor tumani" : "г. Ташкент, Чиланзарский район")}</span>
              </li>
            </ul>
          </div>

          {/* Working Hours & Social (Desktop) */}
          <div>
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              {content.workingHoursTitle}
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="text-muted-foreground">
                  <p><span className="font-medium text-foreground">{t.weekdays}:</span> {contact?.workingHours?.weekdays || "9:00 - 20:00"}</p>
                  <p><span className="font-medium text-foreground">{t.sunday}:</span> {contact?.workingHours?.sunday || "10:00 - 18:00"}</p>
                </div>
              </div>
            </div>
            
            {/* Social Links - Desktop */}
            {hasSocialLinks && (
              <div className="hidden lg:block">
                <h4 className="font-semibold text-sm mb-3">{content.socialTitle}</h4>
                <div className="flex flex-wrap gap-2">
                  {social?.telegram && (
                    <a
                      href={social.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-background rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                      aria-label="Telegram"
                    >
                      <Send className="h-5 w-5" />
                    </a>
                  )}
                  {social?.instagram && (
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-background rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {social?.facebook && (
                    <a
                      href={social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-background rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {social?.youtube && (
                    <a
                      href={social.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-background rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                      aria-label="YouTube"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                  {social?.whatsapp && (
                    <a
                      href={`https://wa.me/${social.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-background rounded-xl flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="text-center sm:text-left">
              {content.copyright}
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link to="/about" className="hover:text-primary transition-colors">{content.privacyText}</Link>
              <span className="text-border">•</span>
              <Link to="/about" className="hover:text-primary transition-colors">{content.termsText}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};