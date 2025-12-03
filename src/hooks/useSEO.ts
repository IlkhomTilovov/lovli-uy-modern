import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

export const useSEO = ({ title, description, image, url, type = 'website' }: SEOProps) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Helper to set meta tag
    const setMetaTag = (property: string, content: string, isOG = false) => {
      const attribute = isOG ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', description);

    // Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', type, true);
    
    if (image) {
      setMetaTag('og:image', image, true);
    }
    
    if (url) {
      setMetaTag('og:url', url, true);
    }

    // Twitter Card tags
    setMetaTag('twitter:card', image ? 'summary_large_image' : 'summary');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    
    if (image) {
      setMetaTag('twitter:image', image);
    }

    return () => {
      document.title = "Do'kon";
    };
  }, [title, description, image, url, type]);
};
