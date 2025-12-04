import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Target, Users, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Skeleton } from "@/components/ui/skeleton";

const About = () => {
  const { about, isLoading } = useSiteContent();

  useSEO({
    title: "Biz Haqimizda | Do'kon - Xojalik Mollari Do'koni",
    description: about?.heroSubtitle || "Xojalik Mollari — sizning ishonchli hamkoringiz. 2018-yildan beri O'zbekiston bozorida sifatli va arzon xojalik mahsulotlarini taqdim etib kelmoqdamiz.",
    url: `${window.location.origin}/about`,
    type: 'website',
    breadcrumbs: [
      { name: "Bosh sahifa", url: window.location.origin },
      { name: "Biz haqimizda", url: `${window.location.origin}/about` }
    ],
    localBusiness: {
      name: "Do'kon - Xojalik Mollari",
      description: "Sifatli va arzon xojalik mahsulotlari do'koni. Tozalash, gigiena, kir yuvish va uy-ro'zg'or mollari.",
      telephone: "+998-90-123-45-67",
      email: "info@dokon.uz",
      priceRange: "$$",
      address: {
        streetAddress: "Navoiy ko'chasi, 12",
        addressLocality: "Toshkent",
        addressRegion: "Toshkent viloyati",
        postalCode: "100000",
        addressCountry: "UZ"
      },
      openingHours: ["Mo-Fr 09:00-18:00", "Sa 10:00-16:00"]
    }
  });

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const statIcons = [TrendingUp, Users, Award, Target];

  // Default values
  const defaultAbout = {
    heroTitle: "Biz Haqimizda",
    heroSubtitle: "Xojalik Mollari — sizning ishonchli hamkoringiz. Biz 2018-yildan beri O'zbekiston bozorida sifatli va arzon xojalik mahsulotlarini taqdim etib kelmoqdamiz.",
    missionTitle: "Bizning Maqsadimiz",
    missionContent: "Har bir oilaga sifatli va arzon xojalik mahsulotlarini yetkazib berish orqali kundalik hayotni qulayroq qilish — bu bizning asosiy maqsadimiz.\n\nBiz nafaqat mahsulot sotamiz, balki mijozlarimizning ishonchini qozonamiz. Har bir buyurtma biz uchun muhim va biz doimo yuqori xizmat ko'rsatishga intilamiz.",
    valuesTitle: "Bizning Qadriyatlarimiz",
    values: [
      { text: "Sifat — barcha mahsulotlarimiz sertifikatlangan" },
      { text: "Ishonch — mijozlarimiz bilan o'zaro hurmat asosida ishlaymiz" },
      { text: "Tezkorlik — buyurtmalarni o'z vaqtida yetkazib beramiz" },
      { text: "Innovatsiya — doimo yangi mahsulotlar va xizmatlar qo'shamiz" }
    ],
    statsTitle: "Bizning Yutuqlarimiz",
    stats: [
      { value: "5+", label: "Yillik Tajriba", description: "Bozorda barqaror faoliyat" },
      { value: "1000+", label: "Mijozlar", description: "Doimiy mijozlarimiz" },
      { value: "200+", label: "Mahsulot Turi", description: "Keng assortiment" },
      { value: "99%", label: "Qoniqish Darajasi", description: "Mijozlar baholashi" }
    ],
    advantagesTitle: "Bizning Ustunliklarimiz",
    advantages: [
      { title: "Sifatli Mahsulotlar", description: "Faqat sertifikatlangan va tasdiqlangan brendlarni taqdim etamiz. Har bir mahsulot sifat nazoratidan o'tadi." },
      { title: "Arzon Narxlar", description: "To'g'ridan-to'g'ri ishlab chiqaruvchilar bilan hamkorlik qilib, eng qulay narxlarni taklif qilamiz." },
      { title: "Tezkor Xizmat", description: "Onlayn buyurtma berish va tez yetkazib berish xizmati. Toshkent bo'ylab 1-2 kun ichida." }
    ]
  };

  const content = about || defaultAbout;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <section className="bg-secondary/30 py-20 border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Skeleton className="h-12 w-64 mx-auto mb-6" />
              <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-secondary/30 py-20 border-b border-border">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">{content.heroTitle}</h1>
              <p className="text-lg text-muted-foreground">{content.heroSubtitle}</p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-6">{content.missionTitle}</h2>
                {content.missionContent.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-primary text-primary-foreground p-8 rounded-2xl"
              >
                <h3 className="text-2xl font-bold mb-6">{content.valuesTitle}</h3>
                <ul className="space-y-4">
                  {content.values.map((value, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                      <span>{value.text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">{content.statsTitle}</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {content.stats.map((stat, index) => {
                const Icon = statIcons[index % statIcons.length];
                return (
                  <motion.div
                    key={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center p-6 bg-card rounded-xl border border-border"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                    <p className="font-semibold mb-1">{stat.label}</p>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">{content.advantagesTitle}</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {content.advantages.map((advantage, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 bg-card rounded-xl border border-border"
                >
                  <h3 className="text-xl font-semibold mb-3">{advantage.title}</h3>
                  <p className="text-muted-foreground">{advantage.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;