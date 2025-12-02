import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Target, Users, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">Biz Haqimizda</h1>
              <p className="text-lg text-muted-foreground">
                Xojalik Mollari — sizning ishonchli hamkoringiz. Biz 2018-yildan beri 
                O'zbekiston bozorida sifatli va arzon xojalik mahsulotlarini taqdim etib kelmoqdamiz.
              </p>
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
                <h2 className="text-3xl font-bold mb-6">Bizning Maqsadimiz</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Har bir oilaga sifatli va arzon xojalik mahsulotlarini yetkazib berish orqali 
                  kundalik hayotni qulayroq qilish — bu bizning asosiy maqsadimiz.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Biz nafaqat mahsulot sotamiz, balki mijozlarimizning ishonchini qozonamiz. 
                  Har bir buyurtma biz uchun muhim va biz doimo yuqori xizmat ko'rsatishga intilamiz.
                </p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-primary text-primary-foreground p-8 rounded-2xl"
              >
                <h3 className="text-2xl font-bold mb-6">Bizning Qadriyatlarimiz</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                    <span>Sifat — barcha mahsulotlarimiz sertifikatlangan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                    <span>Ishonch — mijozlarimiz bilan o'zaro hurmat asosida ishlaymiz</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                    <span>Tezkorlik — buyurtmalarni o'z vaqtida yetkazib beramiz</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                    <span>Innovatsiya — doimo yangi mahsulotlar va xizmatlar qo'shamiz</span>
                  </li>
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
              <h2 className="text-3xl font-bold mb-4">Bizning Yutuqlarimiz</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: TrendingUp,
                  value: "5+",
                  label: "Yillik Tajriba",
                  description: "Bozorda barqaror faoliyat"
                },
                {
                  icon: Users,
                  value: "1000+",
                  label: "Mijozlar",
                  description: "Doimiy mijozlarimiz"
                },
                {
                  icon: Award,
                  value: "200+",
                  label: "Mahsulot Turi",
                  description: "Keng assortiment"
                },
                {
                  icon: Target,
                  value: "99%",
                  label: "Qoniqish Darajasi",
                  description: "Mijozlar baholashi"
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-6 bg-card rounded-xl border border-border"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                  <p className="font-semibold mb-1">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team/Advantages */}
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
              <h2 className="text-3xl font-bold mb-4">Bizning Ustunliklarimiz</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Sifatli Mahsulotlar",
                  description: "Faqat sertifikatlangan va tasdiqlangan brendlarni taqdim etamiz. Har bir mahsulot sifat nazoratidan o'tadi."
                },
                {
                  title: "Arzon Narxlar",
                  description: "To'g'ridan-to'g'ri ishlab chiqaruvchilar bilan hamkorlik qilib, eng qulay narxlarni taklif qilamiz."
                },
                {
                  title: "Tezkor Xizmat",
                  description: "Onlayn buyurtma berish va tez yetkazib berish xizmati. Toshkent bo'ylab 1-2 kun ichida."
                }
              ].map((advantage, index) => (
                <motion.div
                  key={advantage.title}
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
