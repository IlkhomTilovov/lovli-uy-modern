-- Create site_content table for storing all site configuration
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL UNIQUE,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view site content
CREATE POLICY "Anyone can view site content" 
ON public.site_content 
FOR SELECT 
USING (true);

-- Only admins can modify site content
CREATE POLICY "Only admins can insert site content" 
ON public.site_content 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update site content" 
ON public.site_content 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete site content" 
ON public.site_content 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content
INSERT INTO public.site_content (section, data) VALUES
('home_banner', '{"title": "Maishiy kimyo mahsulotlari ishlab chiqaruvchisi", "subtitle": "Vallerlar, cho''tkalar, pichoqlar, supurgilar va har kuni kerak bo''ladigan sifatli uskunalar.", "buttonText": "Katalogni ko''rish", "image": ""}'),
('about', '{"title": "Biz haqimizda", "content": "Kompaniyamiz 10 yildan ortiq vaqt davomida mijozlarga xizmat ko''rsatib kelmoqda."}'),
('contact', '{"phone": "+998 71 123 45 67", "phone2": "", "email": "info@xojalik.uz", "address": "Toshkent shahri, Yunusobod tumani", "workingHours": {"weekdays": "09:00 - 18:00", "saturday": "09:00 - 15:00", "sunday": "Dam olish"}}'),
('social', '{"instagram": "", "telegram": "", "facebook": "", "youtube": "", "whatsapp": ""}'),
('seo', '{"metaTitle": "Xojalik Mollari - Maishiy kimyo mahsulotlari", "metaDescription": "Sifatli maishiy kimyo mahsulotlari va xo''jalik mollari", "keywords": "xojalik, maishiy kimyo, tozalash vositalari"}'),
('footer', '{"companyName": "Xojalik Mollari", "description": "Sifatli maishiy kimyo mahsulotlari ishlab chiqaruvchisi", "copyright": "© 2024 Xojalik Mollari. Barcha huquqlar himoyalangan."}'),
('faq', '{"items": []}');