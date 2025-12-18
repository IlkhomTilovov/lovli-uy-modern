import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface BannerContent {
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
}

export interface HeroStatsContent {
  experienceText: string;
  experienceValue: string;
  clientsText: string;
  clientsValue: string;
}

export interface CategoriesSectionContent {
  title: string;
  subtitle: string;
}

export interface ProductsSectionContent {
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

export interface FeaturesContent {
  title: string;
  items: FeatureItem[];
}

export interface ReviewItem {
  name: string;
  rating: number;
  text: string;
}

export interface ReviewsContent {
  title: string;
  items: ReviewItem[];
}

export interface CtaContent {
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface AboutValue {
  text: string;
}

export interface AboutStat {
  value: string;
  label: string;
  description: string;
}

export interface AboutAdvantage {
  title: string;
  description: string;
}

export interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  missionTitle: string;
  missionContent: string;
  valuesTitle: string;
  values: AboutValue[];
  statsTitle: string;
  stats: AboutStat[];
  advantagesTitle: string;
  advantages: AboutAdvantage[];
}

export interface ContactContent {
  heroTitle: string;
  heroSubtitle: string;
  infoTitle: string;
  infoSubtitle: string;
  formTitle: string;
  phone: string;
  phone2: string;
  email: string;
  email2: string;
  address: string;
  addressLine2: string;
  workingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  mapTitle: string;
  mapUrl: string;
  submitButtonText: string;
}

export interface SocialContent {
  instagram: string;
  telegram: string;
  facebook: string;
  youtube: string;
  whatsapp: string;
}

export interface SeoContent {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export interface FooterContent {
  companyName: string;
  slogan: string;
  description: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  pagesTitle: string;
  contactTitle: string;
  workingHoursTitle: string;
  socialTitle: string;
  copyright: string;
  privacyText: string;
  termsText: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqContent {
  items: FaqItem[];
}

export interface BrandingContent {
  logo: string;
  favicon: string;
}

type SectionKey = 'home_banner' | 'home_hero_stats' | 'home_categories' | 'home_products' | 'home_features' | 'home_reviews' | 'home_cta' | 'about' | 'contact' | 'social' | 'seo' | 'footer' | 'faq' | 'branding';
type ContentData = BannerContent | HeroStatsContent | CategoriesSectionContent | ProductsSectionContent | FeaturesContent | ReviewsContent | CtaContent | AboutContent | ContactContent | SocialContent | SeoContent | FooterContent | FaqContent | BrandingContent;

export const useSiteContent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: siteContent, isLoading } = useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ section, data }: { section: SectionKey; data: ContentData }) => {
      // First try to update
      const { data: existingData, error: selectError } = await supabase
        .from('site_content')
        .select('id')
        .eq('section', section)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('site_content')
          .update({ data: data as unknown as Json })
          .eq('section', section);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('site_content')
          .insert({ section, data: data as unknown as Json });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast({ title: 'Saqlandi', description: "Ma'lumotlar muvaffaqiyatli yangilandi" });
    },
    onError: (error) => {
      toast({ 
        title: 'Xatolik', 
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const getContent = <T>(section: SectionKey): T | null => {
    const item = siteContent?.find(c => c.section === section);
    return item?.data as T || null;
  };

  return {
    siteContent,
    isLoading,
    updateContent: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    getContent,
    banner: getContent<BannerContent>('home_banner'),
    heroStats: getContent<HeroStatsContent>('home_hero_stats'),
    categoriesSection: getContent<CategoriesSectionContent>('home_categories'),
    productsSection: getContent<ProductsSectionContent>('home_products'),
    features: getContent<FeaturesContent>('home_features'),
    reviews: getContent<ReviewsContent>('home_reviews'),
    cta: getContent<CtaContent>('home_cta'),
    about: getContent<AboutContent>('about'),
    contact: getContent<ContactContent>('contact'),
    social: getContent<SocialContent>('social'),
    seo: getContent<SeoContent>('seo'),
    footer: getContent<FooterContent>('footer'),
    faq: getContent<FaqContent>('faq'),
    branding: getContent<BrandingContent>('branding'),
  };
};
