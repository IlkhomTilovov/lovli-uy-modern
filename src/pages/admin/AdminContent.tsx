import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save, Image, FileText, Phone, Share2, Search, 
  MessageSquare, Clock, Upload, Plus, Trash2, Loader2,
  Home, LayoutGrid, Package, Star, Megaphone, Palette
} from 'lucide-react';
import { 
  useSiteContent, 
  BannerContent, 
  HeroStatsContent,
  CategoriesSectionContent,
  ProductsSectionContent,
  FeaturesContent,
  FeatureItem,
  ReviewsContent,
  ReviewItem,
  CtaContent,
  AboutContent, 
  AboutValue,
  AboutStat,
  AboutAdvantage,
  ContactContent, 
  SocialContent, 
  SeoContent, 
  FooterContent, 
  FaqContent, 
  FaqItem,
  BrandingContent
} from '@/hooks/useSiteContent';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ICON_OPTIONS = [
  { value: 'Shield', label: 'Sifat (Shield)' },
  { value: 'Sparkles', label: 'Chegirma (Sparkles)' },
  { value: 'Truck', label: 'Yetkazib berish (Truck)' },
  { value: 'CheckCircle', label: "To'gri belgi (CheckCircle)" },
  { value: 'Star', label: 'Yulduz (Star)' },
  { value: 'Heart', label: 'Yurak (Heart)' },
  { value: 'Award', label: 'Mukofot (Award)' },
  { value: 'Clock', label: 'Soat (Clock)' },
];

const AdminContent = () => {
  const { 
    banner, heroStats, categoriesSection, productsSection, features, reviews, cta,
    about, contact, social, seo, footer, faq, branding,
    updateContent, isLoading, isUpdating 
  } = useSiteContent();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Banner state
  const [bannerData, setBannerData] = useState<BannerContent>({
    title: '', subtitle: '', buttonText: '', image: ''
  });

  // Hero Stats state
  const [heroStatsData, setHeroStatsData] = useState<HeroStatsContent>({
    experienceText: '', experienceValue: '', clientsText: '', clientsValue: ''
  });

  // Categories Section state
  const [categoriesSectionData, setCategoriesSectionData] = useState<CategoriesSectionContent>({
    title: '', subtitle: ''
  });

  // Products Section state
  const [productsSectionData, setProductsSectionData] = useState<ProductsSectionContent>({
    title: '', subtitle: '', buttonText: ''
  });

  // Features state
  const [featuresData, setFeaturesData] = useState<FeaturesContent>({
    title: '',
    items: []
  });

  // Reviews state
  const [reviewsData, setReviewsData] = useState<ReviewsContent>({
    title: '',
    items: []
  });

  // CTA state
  const [ctaData, setCtaData] = useState<CtaContent>({
    title: '', subtitle: '', buttonText: ''
  });

  // About state
  const [aboutData, setAboutData] = useState<AboutContent>({
    heroTitle: '',
    heroSubtitle: '',
    missionTitle: '',
    missionContent: '',
    valuesTitle: '',
    values: [],
    statsTitle: '',
    stats: [],
    advantagesTitle: '',
    advantages: []
  });

  // Contact state
  const [contactData, setContactData] = useState<ContactContent>({
    heroTitle: '', heroSubtitle: '', infoTitle: '', infoSubtitle: '', formTitle: '',
    phone: '', phone2: '', email: '', email2: '', address: '', addressLine2: '',
    workingHours: { weekdays: '', saturday: '', sunday: '' },
    mapTitle: '', mapUrl: '', submitButtonText: ''
  });

  // Social state
  const [socialData, setSocialData] = useState<SocialContent>({
    instagram: '', telegram: '', facebook: '', youtube: '', whatsapp: ''
  });

  // SEO state
  const [seoData, setSeoData] = useState<SeoContent>({
    metaTitle: '', metaDescription: '', keywords: ''
  });

  // Footer state
  const [footerData, setFooterData] = useState<FooterContent>({
    companyName: '', slogan: '', description: '', 
    ctaTitle: '', ctaSubtitle: '', ctaButtonText: '',
    pagesTitle: '', contactTitle: '', workingHoursTitle: '', socialTitle: '',
    copyright: '', privacyText: '', termsText: ''
  });

  // FAQ state
  const [faqData, setFaqData] = useState<FaqContent>({ items: [] });
  
  // Branding state
  const [brandingData, setBrandingData] = useState<BrandingContent>({ logo: '', favicon: '' });
  
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Load data from DB
  useEffect(() => {
    if (banner) setBannerData(banner);
    if (heroStats) setHeroStatsData(heroStats);
    if (categoriesSection) setCategoriesSectionData(categoriesSection);
    if (productsSection) setProductsSectionData(productsSection);
    if (features) setFeaturesData(features);
    if (reviews) setReviewsData(reviews);
    if (cta) setCtaData(cta);
    if (about) setAboutData(about);
    if (contact) setContactData(contact);
    if (social) setSocialData(social);
    if (seo) setSeoData(seo);
    if (footer) setFooterData(footer);
    if (faq) setFaqData(faq);
    if (branding) setBrandingData(branding);
  }, [banner, heroStats, categoriesSection, productsSection, features, reviews, cta, about, contact, social, seo, footer, faq, branding]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setBannerData({ ...bannerData, image: publicUrl });
      toast({ title: "Rasm yuklandi" });
    } catch (error: unknown) {
      toast({ 
        title: 'Xatolik', 
        description: error instanceof Error ? error.message : 'Rasm yuklashda xatolik',
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setBrandingData({ ...brandingData, logo: publicUrl });
      toast({ title: "Logo yuklandi" });
    } catch (error: unknown) {
      toast({ 
        title: 'Xatolik', 
        description: error instanceof Error ? error.message : 'Logo yuklashda xatolik',
        variant: 'destructive' 
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `favicon-${Date.now()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setBrandingData({ ...brandingData, favicon: publicUrl });
      toast({ title: "Favicon yuklandi" });
    } catch (error: unknown) {
      toast({ 
        title: 'Xatolik', 
        description: error instanceof Error ? error.message : 'Favicon yuklashda xatolik',
        variant: 'destructive' 
      });
    } finally {
      setUploadingFavicon(false);
    }
  };

  // Features helpers
  const addFeature = () => {
    setFeaturesData({
      ...featuresData,
      items: [...featuresData.items, { title: '', description: '', icon: 'Shield' }]
    });
  };

  const updateFeature = (index: number, field: keyof FeatureItem, value: string) => {
    const newItems = [...featuresData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFeaturesData({ ...featuresData, items: newItems });
  };

  const removeFeature = (index: number) => {
    setFeaturesData({
      ...featuresData,
      items: featuresData.items.filter((_, i) => i !== index)
    });
  };

  // Reviews helpers
  const addReview = () => {
    setReviewsData({
      ...reviewsData,
      items: [...reviewsData.items, { name: '', rating: 5, text: '' }]
    });
  };

  const updateReview = (index: number, field: keyof ReviewItem, value: string | number) => {
    const newItems = [...reviewsData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setReviewsData({ ...reviewsData, items: newItems });
  };

  const removeReview = (index: number) => {
    setReviewsData({
      ...reviewsData,
      items: reviewsData.items.filter((_, i) => i !== index)
    });
  };

  // FAQ helpers
  const addFaqItem = () => {
    setFaqData({
      items: [...faqData.items, { question: '', answer: '' }]
    });
  };

  const updateFaqItem = (index: number, field: keyof FaqItem, value: string) => {
    const newItems = [...faqData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFaqData({ items: newItems });
  };

  const removeFaqItem = (index: number) => {
    setFaqData({
      items: faqData.items.filter((_, i) => i !== index)
    });
  };

  // About helpers
  const addValue = () => {
    setAboutData({
      ...aboutData,
      values: [...aboutData.values, { text: '' }]
    });
  };

  const updateValue = (index: number, text: string) => {
    const newValues = [...aboutData.values];
    newValues[index] = { text };
    setAboutData({ ...aboutData, values: newValues });
  };

  const removeValue = (index: number) => {
    setAboutData({
      ...aboutData,
      values: aboutData.values.filter((_, i) => i !== index)
    });
  };

  const addStat = () => {
    setAboutData({
      ...aboutData,
      stats: [...aboutData.stats, { value: '', label: '', description: '' }]
    });
  };

  const updateStat = (index: number, field: keyof AboutStat, value: string) => {
    const newStats = [...aboutData.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setAboutData({ ...aboutData, stats: newStats });
  };

  const removeStat = (index: number) => {
    setAboutData({
      ...aboutData,
      stats: aboutData.stats.filter((_, i) => i !== index)
    });
  };

  const addAdvantage = () => {
    setAboutData({
      ...aboutData,
      advantages: [...aboutData.advantages, { title: '', description: '' }]
    });
  };

  const updateAdvantage = (index: number, field: keyof AboutAdvantage, value: string) => {
    const newAdvantages = [...aboutData.advantages];
    newAdvantages[index] = { ...newAdvantages[index], [field]: value };
    setAboutData({ ...aboutData, advantages: newAdvantages });
  };

  const removeAdvantage = (index: number) => {
    setAboutData({
      ...aboutData,
      advantages: aboutData.advantages.filter((_, i) => i !== index)
    });
  };

  const saveHomePage = () => {
    updateContent({ section: 'home_banner', data: bannerData });
    updateContent({ section: 'home_hero_stats', data: heroStatsData });
    updateContent({ section: 'home_categories', data: categoriesSectionData });
    updateContent({ section: 'home_products', data: productsSectionData });
    updateContent({ section: 'home_features', data: featuresData });
    updateContent({ section: 'home_reviews', data: reviewsData });
    updateContent({ section: 'home_cta', data: ctaData });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kontent boshqaruvi</h1>
          <p className="text-muted-foreground">Sayt kontentini tahrirlash</p>
        </div>

        <Tabs defaultValue="homepage">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="homepage" className="gap-2">
              <Home className="w-4 h-4" />
              Bosh sahifa
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <FileText className="w-4 h-4" />
              Biz haqimizda
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <Phone className="w-4 h-4" />
              Aloqa
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <Share2 className="w-4 h-4" />
              Ijtimoiy
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Search className="w-4 h-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2">
              <FileText className="w-4 h-4" />
              Footer
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="w-4 h-4" />
              Logo & Favicon
            </TabsTrigger>
          </TabsList>

          {/* Home Page Tab */}
          <TabsContent value="homepage" className="mt-6 space-y-6">
            {/* Hero Banner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Hero Banner
                </CardTitle>
                <CardDescription>Bosh sahifa asosiy banner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Banner rasmi</Label>
                  <div className="flex items-center gap-4">
                    {bannerData.image && (
                      <img 
                        src={bannerData.image} 
                        alt="Banner" 
                        className="w-40 h-24 object-cover rounded-lg border"
                      />
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      Rasm yuklash
                    </Button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sarlavha</Label>
                    <Input 
                      value={bannerData.title} 
                      onChange={(e) => setBannerData({ ...bannerData, title: e.target.value })}
                      placeholder="Asosiy sarlavha"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tugma matni</Label>
                    <Input 
                      value={bannerData.buttonText} 
                      onChange={(e) => setBannerData({ ...bannerData, buttonText: e.target.value })}
                      placeholder="Katalogni ko'rish"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <Textarea 
                    value={bannerData.subtitle} 
                    onChange={(e) => setBannerData({ ...bannerData, subtitle: e.target.value })}
                    placeholder="Banner tavsifi"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hero Stats Badge */}
            <Card>
              <CardHeader>
                <CardTitle>Statistika Badge</CardTitle>
                <CardDescription>Banner ustidagi statistika kartochkasi</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tajriba matni</Label>
                  <Input 
                    value={heroStatsData.experienceText} 
                    onChange={(e) => setHeroStatsData({ ...heroStatsData, experienceText: e.target.value })}
                    placeholder="5+ Yillik Tajriba"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mijozlar matni</Label>
                  <Input 
                    value={heroStatsData.clientsText} 
                    onChange={(e) => setHeroStatsData({ ...heroStatsData, clientsText: e.target.value })}
                    placeholder="1000+ Mijozlar"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5" />
                  Kategoriyalar bo'limi
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sarlavha</Label>
                  <Input 
                    value={categoriesSectionData.title} 
                    onChange={(e) => setCategoriesSectionData({ ...categoriesSectionData, title: e.target.value })}
                    placeholder="Kategoriyalar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <Input 
                    value={categoriesSectionData.subtitle} 
                    onChange={(e) => setCategoriesSectionData({ ...categoriesSectionData, subtitle: e.target.value })}
                    placeholder="Sizga kerak bo'lgan mahsulotlarni toping"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Mahsulotlar bo'limi
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Sarlavha</Label>
                  <Input 
                    value={productsSectionData.title} 
                    onChange={(e) => setProductsSectionData({ ...productsSectionData, title: e.target.value })}
                    placeholder="Eng Ko'p Sotiladigan Mahsulotlar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <Input 
                    value={productsSectionData.subtitle} 
                    onChange={(e) => setProductsSectionData({ ...productsSectionData, subtitle: e.target.value })}
                    placeholder="Mijozlarimizning sevimlilari"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tugma matni</Label>
                  <Input 
                    value={productsSectionData.buttonText} 
                    onChange={(e) => setProductsSectionData({ ...productsSectionData, buttonText: e.target.value })}
                    placeholder="Barcha Mahsulotlar"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Features Section */}
            <Card>
              <CardHeader>
                <CardTitle>Nima Uchun Bizni Tanlaysiz?</CardTitle>
                <CardDescription>Afzalliklar ro'yxati</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bo'lim sarlavhasi</Label>
                  <Input 
                    value={featuresData.title} 
                    onChange={(e) => setFeaturesData({ ...featuresData, title: e.target.value })}
                    placeholder="Nima Uchun Bizni Tanlaysiz?"
                  />
                </div>
                <div className="space-y-4">
                  <Label>Afzalliklar</Label>
                  {featuresData.items.map((feature, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Afzallik {index + 1}</span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeFeature(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Ikona</Label>
                          <Select 
                            value={feature.icon} 
                            onValueChange={(value) => updateFeature(index, 'icon', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ICON_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Sarlavha</Label>
                          <Input 
                            value={feature.title} 
                            onChange={(e) => updateFeature(index, 'title', e.target.value)}
                            placeholder="Sifat Kafolati"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tavsif</Label>
                          <Input 
                            value={feature.description} 
                            onChange={(e) => updateFeature(index, 'description', e.target.value)}
                            placeholder="Barcha mahsulotlar sertifikatlangan..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addFeature} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Afzallik qo'shish
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Mijozlar fikrlari
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bo'lim sarlavhasi</Label>
                  <Input 
                    value={reviewsData.title} 
                    onChange={(e) => setReviewsData({ ...reviewsData, title: e.target.value })}
                    placeholder="Mijozlarimiz Fikri"
                  />
                </div>
                <div className="space-y-4">
                  <Label>Sharhlar</Label>
                  {reviewsData.items.map((review, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Sharh {index + 1}</span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeReview(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Ism</Label>
                          <Input 
                            value={review.name} 
                            onChange={(e) => updateReview(index, 'name', e.target.value)}
                            placeholder="Aziza Karimova"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Reyting (1-5)</Label>
                          <Input 
                            type="number"
                            min={1}
                            max={5}
                            value={review.rating} 
                            onChange={(e) => updateReview(index, 'rating', parseInt(e.target.value) || 5)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Sharh matni</Label>
                          <Textarea 
                            value={review.text} 
                            onChange={(e) => updateReview(index, 'text', e.target.value)}
                            placeholder="Juda sifatli mahsulotlar..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addReview} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Sharh qo'shish
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Chaqiruv bo'limi (CTA)
                </CardTitle>
                <CardDescription>Sahifa pastidagi ko'k banner</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Sarlavha</Label>
                  <Input 
                    value={ctaData.title} 
                    onChange={(e) => setCtaData({ ...ctaData, title: e.target.value })}
                    placeholder="Buyurtma Berishga Tayyormisiz?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <Input 
                    value={ctaData.subtitle} 
                    onChange={(e) => setCtaData({ ...ctaData, subtitle: e.target.value })}
                    placeholder="Hoziroq katalogni ko'rib chiqing..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tugma matni</Label>
                  <Input 
                    value={ctaData.buttonText} 
                    onChange={(e) => setCtaData({ ...ctaData, buttonText: e.target.value })}
                    placeholder="Katalogni Ko'rish"
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={saveHomePage} 
              disabled={isUpdating}
              className="gap-2"
              size="lg"
            >
              <Save className="w-4 h-4" />
              Bosh sahifani saqlash
            </Button>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="mt-6 space-y-6">
            {/* Hero Section */}
            <Card>
              <CardHeader>
                <CardTitle>Hero Bo'limi</CardTitle>
                <CardDescription>Sahifa boshi - sarlavha va tavsif</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sarlavha</Label>
                  <Input 
                    value={aboutData.heroTitle} 
                    onChange={(e) => setAboutData({ ...aboutData, heroTitle: e.target.value })}
                    placeholder="Biz Haqimizda"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <Textarea 
                    value={aboutData.heroSubtitle} 
                    onChange={(e) => setAboutData({ ...aboutData, heroSubtitle: e.target.value })}
                    placeholder="Kompaniya haqida qisqa ma'lumot..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mission Section */}
            <Card>
              <CardHeader>
                <CardTitle>Maqsadimiz Bo'limi</CardTitle>
                <CardDescription>Kompaniya maqsadi haqida</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sarlavha</Label>
                  <Input 
                    value={aboutData.missionTitle} 
                    onChange={(e) => setAboutData({ ...aboutData, missionTitle: e.target.value })}
                    placeholder="Bizning Maqsadimiz"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Matn (paragraflar orasiga bo'sh qator qo'shing)</Label>
                  <Textarea 
                    value={aboutData.missionContent} 
                    onChange={(e) => setAboutData({ ...aboutData, missionContent: e.target.value })}
                    placeholder="Kompaniya maqsadi haqida ma'lumot..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Values Section */}
            <Card>
              <CardHeader>
                <CardTitle>Qadriyatlarimiz Bo'limi</CardTitle>
                <CardDescription>Kompaniya qadriyatlari ro'yxati</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sarlavha</Label>
                  <Input 
                    value={aboutData.valuesTitle} 
                    onChange={(e) => setAboutData({ ...aboutData, valuesTitle: e.target.value })}
                    placeholder="Bizning Qadriyatlarimiz"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Qadriyatlar</Label>
                  {aboutData.values.map((value, index) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        value={value.text} 
                        onChange={(e) => updateValue(index, e.target.value)}
                        placeholder="Qadriyat matni..."
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => removeValue(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addValue} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Qadriyat qo'shish
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Section */}
            <Card>
              <CardHeader>
                <CardTitle>Yutuqlarimiz Bo'limi</CardTitle>
                <CardDescription>Statistika va raqamlar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sarlavha</Label>
                  <Input 
                    value={aboutData.statsTitle} 
                    onChange={(e) => setAboutData({ ...aboutData, statsTitle: e.target.value })}
                    placeholder="Bizning Yutuqlarimiz"
                  />
                </div>
                <div className="space-y-4">
                  <Label>Statistika elementlari</Label>
                  {aboutData.stats.map((stat, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Element {index + 1}</span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeStat(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Qiymat</Label>
                          <Input 
                            value={stat.value} 
                            onChange={(e) => updateStat(index, 'value', e.target.value)}
                            placeholder="5+"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Nomi</Label>
                          <Input 
                            value={stat.label} 
                            onChange={(e) => updateStat(index, 'label', e.target.value)}
                            placeholder="Yillik Tajriba"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tavsif</Label>
                          <Input 
                            value={stat.description} 
                            onChange={(e) => updateStat(index, 'description', e.target.value)}
                            placeholder="Bozorda barqaror faoliyat"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addStat} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Statistika qo'shish
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advantages Section */}
            <Card>
              <CardHeader>
                <CardTitle>Ustunliklarimiz Bo'limi</CardTitle>
                <CardDescription>Kompaniya afzalliklari</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sarlavha</Label>
                  <Input 
                    value={aboutData.advantagesTitle} 
                    onChange={(e) => setAboutData({ ...aboutData, advantagesTitle: e.target.value })}
                    placeholder="Bizning Ustunliklarimiz"
                  />
                </div>
                <div className="space-y-4">
                  <Label>Ustunliklar</Label>
                  {aboutData.advantages.map((advantage, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Ustunlik {index + 1}</span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeAdvantage(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Sarlavha</Label>
                        <Input 
                          value={advantage.title} 
                          onChange={(e) => updateAdvantage(index, 'title', e.target.value)}
                          placeholder="Sifatli Mahsulotlar"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Tavsif</Label>
                        <Textarea 
                          value={advantage.description} 
                          onChange={(e) => updateAdvantage(index, 'description', e.target.value)}
                          placeholder="Faqat sertifikatlangan va tasdiqlangan brendlarni taqdim etamiz..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addAdvantage} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Ustunlik qo'shish
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => updateContent({ section: 'about', data: aboutData })} 
              disabled={isUpdating}
              className="gap-2"
              size="lg"
            >
              <Save className="w-4 h-4" />
              Barchasini saqlash
            </Button>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-6 space-y-6">
            {/* Hero Section */}
            <Card>
              <CardHeader>
                <CardTitle>Sahifa sarlavhasi</CardTitle>
                <CardDescription>Aloqa sahifasining bosh qismi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sarlavha</Label>
                    <Input 
                      value={contactData.heroTitle} 
                      onChange={(e) => setContactData({ ...contactData, heroTitle: e.target.value })}
                      placeholder="Biz Bilan Bog'laning"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tavsif</Label>
                    <Input 
                      value={contactData.heroSubtitle} 
                      onChange={(e) => setContactData({ ...contactData, heroSubtitle: e.target.value })}
                      placeholder="Savollaringiz bormi? Buyurtma bermoqchimisiz?"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Section Header */}
            <Card>
              <CardHeader>
                <CardTitle>Ma'lumotlar bo'limi</CardTitle>
                <CardDescription>Chap tomondagi ma'lumotlar bo'limi sarlavhalari</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bo'lim sarlavhasi</Label>
                    <Input 
                      value={contactData.infoTitle} 
                      onChange={(e) => setContactData({ ...contactData, infoTitle: e.target.value })}
                      placeholder="Aloqa Ma'lumotlari"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bo'lim tavsifi</Label>
                    <Input 
                      value={contactData.infoSubtitle} 
                      onChange={(e) => setContactData({ ...contactData, infoSubtitle: e.target.value })}
                      placeholder="Quyidagi usullar orqali biz bilan bog'lanishingiz mumkin"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Aloqa ma'lumotlari</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Telefon 1</Label>
                      <Input 
                        value={contactData.phone} 
                        onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                        placeholder="+998 90 123 45 67"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefon 2</Label>
                      <Input 
                        value={contactData.phone2} 
                        onChange={(e) => setContactData({ ...contactData, phone2: e.target.value })}
                        placeholder="+998 91 234 56 78"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email 1</Label>
                      <Input 
                        type="email"
                        value={contactData.email} 
                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                        placeholder="info@xojalikmollari.uz"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email 2</Label>
                      <Input 
                        type="email"
                        value={contactData.email2} 
                        onChange={(e) => setContactData({ ...contactData, email2: e.target.value })}
                        placeholder="support@xojalikmollari.uz"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Manzil (1-qator)</Label>
                    <Input 
                      value={contactData.address} 
                      onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                      placeholder="Toshkent shahar, Chilonzor tumani"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Manzil (2-qator)</Label>
                    <Input 
                      value={contactData.addressLine2} 
                      onChange={(e) => setContactData({ ...contactData, addressLine2: e.target.value })}
                      placeholder="Kichik halqa yo'li 1-uy"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Working Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Ish vaqtlari
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Dushanba - Shanba</Label>
                    <Input 
                      value={contactData.workingHours.weekdays} 
                      onChange={(e) => setContactData({ 
                        ...contactData, 
                        workingHours: { ...contactData.workingHours, weekdays: e.target.value }
                      })}
                      placeholder="9:00 - 20:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Yakshanba</Label>
                    <Input 
                      value={contactData.workingHours.sunday} 
                      onChange={(e) => setContactData({ 
                        ...contactData, 
                        workingHours: { ...contactData.workingHours, sunday: e.target.value }
                      })}
                      placeholder="10:00 - 18:00"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form & Map Settings */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Forma sozlamalari</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Forma sarlavhasi</Label>
                    <Input 
                      value={contactData.formTitle} 
                      onChange={(e) => setContactData({ ...contactData, formTitle: e.target.value })}
                      placeholder="Xabar Yuborish"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tugma matni</Label>
                    <Input 
                      value={contactData.submitButtonText} 
                      onChange={(e) => setContactData({ ...contactData, submitButtonText: e.target.value })}
                      placeholder="Xabar Yuborish"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Xarita sozlamalari</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Xarita sarlavhasi</Label>
                    <Input 
                      value={contactData.mapTitle} 
                      onChange={(e) => setContactData({ ...contactData, mapTitle: e.target.value })}
                      placeholder="Bizning Joylashuvimiz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Google Maps embed URL</Label>
                    <Textarea 
                      value={contactData.mapUrl} 
                      onChange={(e) => setContactData({ ...contactData, mapUrl: e.target.value })}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={() => updateContent({ section: 'contact', data: contactData })} 
              disabled={isUpdating}
              className="gap-2"
              size="lg"
            >
              <Save className="w-4 h-4" />
              Barchasini saqlash
            </Button>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ijtimoiy tarmoqlar</CardTitle>
                <CardDescription>Ijtimoiy tarmoq havolalarini kiriting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input 
                      value={socialData.instagram} 
                      onChange={(e) => setSocialData({ ...socialData, instagram: e.target.value })}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telegram</Label>
                    <Input 
                      value={socialData.telegram} 
                      onChange={(e) => setSocialData({ ...socialData, telegram: e.target.value })}
                      placeholder="https://t.me/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook</Label>
                    <Input 
                      value={socialData.facebook} 
                      onChange={(e) => setSocialData({ ...socialData, facebook: e.target.value })}
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube</Label>
                    <Input 
                      value={socialData.youtube} 
                      onChange={(e) => setSocialData({ ...socialData, youtube: e.target.value })}
                      placeholder="https://youtube.com/@channel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input 
                      value={socialData.whatsapp} 
                      onChange={(e) => setSocialData({ ...socialData, whatsapp: e.target.value })}
                      placeholder="+998901234567"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => updateContent({ section: 'social', data: socialData })} 
                  disabled={isUpdating}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Saqlash
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO sozlamalari</CardTitle>
                <CardDescription>Qidiruv tizimlari uchun optimizatsiya</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input 
                    value={seoData.metaTitle} 
                    onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
                    placeholder="Sayt nomi - Qisqa tavsif"
                  />
                  <p className="text-xs text-muted-foreground">{seoData.metaTitle.length}/60 belgi</p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea 
                    value={seoData.metaDescription} 
                    onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
                    placeholder="Sayt haqida qisqa tavsif..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">{seoData.metaDescription.length}/160 belgi</p>
                </div>
                <div className="space-y-2">
                  <Label>Kalit so'zlar</Label>
                  <Textarea 
                    value={seoData.keywords} 
                    onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
                    placeholder="kalit, so'z, vergul, bilan"
                    rows={2}
                  />
                </div>
                <Button 
                  onClick={() => updateContent({ section: 'seo', data: seoData })} 
                  disabled={isUpdating}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Saqlash
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Ko'p so'raladigan savollar</CardTitle>
                <CardDescription>FAQ bo'limini tahrirlash</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqData.items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Savol {index + 1}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => removeFaqItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Savol</Label>
                      <Input 
                        value={item.question} 
                        onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                        placeholder="Savol matni..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Javob</Label>
                      <Textarea 
                        value={item.answer} 
                        onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                        placeholder="Javob matni..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addFaqItem} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Savol qo'shish
                </Button>
                <div className="pt-4">
                  <Button 
                    onClick={() => updateContent({ section: 'faq', data: faqData })} 
                    disabled={isUpdating}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Saqlash
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value="footer" className="mt-6 space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Kompaniya ma'lumotlari</CardTitle>
                <CardDescription>Logo yonidagi ma'lumotlar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kompaniya nomi</Label>
                    <Input 
                      value={footerData.companyName} 
                      onChange={(e) => setFooterData({ ...footerData, companyName: e.target.value })}
                      placeholder="Xojalik Mollari"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slogan</Label>
                    <Input 
                      value={footerData.slogan} 
                      onChange={(e) => setFooterData({ ...footerData, slogan: e.target.value })}
                      placeholder="Sifat va ishonch"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <Textarea 
                    value={footerData.description} 
                    onChange={(e) => setFooterData({ ...footerData, description: e.target.value })}
                    placeholder="Sifatli va arzon xojalik mollari. Sizning uyingiz uchun eng yaxshi mahsulotlar."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card>
              <CardHeader>
                <CardTitle>CTA bo'limi</CardTitle>
                <CardDescription>Footer ustidagi ko'k banner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sarlavha</Label>
                    <Input 
                      value={footerData.ctaTitle} 
                      onChange={(e) => setFooterData({ ...footerData, ctaTitle: e.target.value })}
                      placeholder="Savollaringiz bormi?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tugma matni</Label>
                    <Input 
                      value={footerData.ctaButtonText} 
                      onChange={(e) => setFooterData({ ...footerData, ctaButtonText: e.target.value })}
                      placeholder="Bog'lanish"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <Input 
                    value={footerData.ctaSubtitle} 
                    onChange={(e) => setFooterData({ ...footerData, ctaSubtitle: e.target.value })}
                    placeholder="Biz bilan bog'laning - yordam berishdan mamnunmiz!"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section Titles */}
            <Card>
              <CardHeader>
                <CardTitle>Bo'lim sarlavhalari</CardTitle>
                <CardDescription>Footer bo'limlarining nomlari</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Sahifalar</Label>
                  <Input 
                    value={footerData.pagesTitle} 
                    onChange={(e) => setFooterData({ ...footerData, pagesTitle: e.target.value })}
                    placeholder="Sahifalar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aloqa</Label>
                  <Input 
                    value={footerData.contactTitle} 
                    onChange={(e) => setFooterData({ ...footerData, contactTitle: e.target.value })}
                    placeholder="Aloqa"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ish vaqti</Label>
                  <Input 
                    value={footerData.workingHoursTitle} 
                    onChange={(e) => setFooterData({ ...footerData, workingHoursTitle: e.target.value })}
                    placeholder="Ish Vaqti"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ijtimoiy tarmoqlar</Label>
                  <Input 
                    value={footerData.socialTitle} 
                    onChange={(e) => setFooterData({ ...footerData, socialTitle: e.target.value })}
                    placeholder="Ijtimoiy Tarmoqlar"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bottom Bar */}
            <Card>
              <CardHeader>
                <CardTitle>Pastki qism</CardTitle>
                <CardDescription>Copyright va huquqiy havolalar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Copyright matni</Label>
                  <Input 
                    value={footerData.copyright} 
                    onChange={(e) => setFooterData({ ...footerData, copyright: e.target.value })}
                    placeholder="© 2024 Xojalik Mollari. Barcha huquqlar himoyalangan."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maxfiylik siyosati</Label>
                    <Input 
                      value={footerData.privacyText} 
                      onChange={(e) => setFooterData({ ...footerData, privacyText: e.target.value })}
                      placeholder="Maxfiylik siyosati"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Foydalanish shartlari</Label>
                    <Input 
                      value={footerData.termsText} 
                      onChange={(e) => setFooterData({ ...footerData, termsText: e.target.value })}
                      placeholder="Foydalanish shartlari"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => updateContent({ section: 'footer', data: footerData })} 
              disabled={isUpdating}
              className="gap-2"
              size="lg"
            >
              <Save className="w-4 h-4" />
              Barchasini saqlash
            </Button>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Logo va Favicon
                </CardTitle>
                <CardDescription>Sayt logosi va favicon rasmlarini yuklang</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Section */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Logo</Label>
                  <div className="flex items-center gap-4">
                    {brandingData.logo ? (
                      <img 
                        src={brandingData.logo} 
                        alt="Logo" 
                        className="h-16 object-contain rounded-lg border bg-background p-2"
                      />
                    ) : (
                      <div className="h-16 w-32 border rounded-lg flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground text-sm">Logo yo'q</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      Logo yuklash
                    </Button>
                    {brandingData.logo && (
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => setBrandingData({ ...brandingData, logo: '' })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tavsiya: PNG yoki SVG format, shaffof fon bilan. Optimal o'lcham: 200x50 piksel
                  </p>
                </div>

                {/* Favicon Section */}
                <div className="space-y-4 pt-6 border-t">
                  <Label className="text-lg font-semibold">Favicon</Label>
                  <div className="flex items-center gap-4">
                    {brandingData.favicon ? (
                      <img 
                        src={brandingData.favicon} 
                        alt="Favicon" 
                        className="h-12 w-12 object-contain rounded-lg border bg-background p-1"
                      />
                    ) : (
                      <div className="h-12 w-12 border rounded-lg flex items-center justify-center bg-muted">
                        <span className="text-muted-foreground text-xs">Yo'q</span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={faviconInputRef}
                      onChange={handleFaviconUpload}
                      accept="image/*,.ico"
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={uploadingFavicon}
                    >
                      {uploadingFavicon ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      Favicon yuklash
                    </Button>
                    {brandingData.favicon && (
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => setBrandingData({ ...brandingData, favicon: '' })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tavsiya: ICO, PNG yoki SVG format. Optimal o'lcham: 32x32 yoki 64x64 piksel
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => updateContent({ section: 'branding', data: brandingData })} 
              disabled={isUpdating}
              className="gap-2"
              size="lg"
            >
              <Save className="w-4 h-4" />
              Saqlash
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;