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

export interface AboutContent {
  title: string;
  content: string;
}

export interface ContactContent {
  phone: string;
  phone2: string;
  email: string;
  address: string;
  workingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
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
  description: string;
  copyright: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqContent {
  items: FaqItem[];
}

type SectionKey = 'home_banner' | 'about' | 'contact' | 'social' | 'seo' | 'footer' | 'faq';
type ContentData = BannerContent | AboutContent | ContactContent | SocialContent | SeoContent | FooterContent | FaqContent;

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
      const { error } = await supabase
        .from('site_content')
        .update({ data: data as unknown as Json })
        .eq('section', section);
      
      if (error) throw error;
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
    about: getContent<AboutContent>('about'),
    contact: getContent<ContactContent>('contact'),
    social: getContent<SocialContent>('social'),
    seo: getContent<SeoContent>('seo'),
    footer: getContent<FooterContent>('footer'),
    faq: getContent<FaqContent>('faq'),
  };
};
