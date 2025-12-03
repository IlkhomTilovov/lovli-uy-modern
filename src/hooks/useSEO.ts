import { useEffect } from 'react';

interface ProductSchema {
  name: string;
  description?: string;
  image?: string;
  sku?: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock';
  brand?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  product?: ProductSchema;
  breadcrumbs?: BreadcrumbItem[];
}

export const useSEO = ({ title, description, image, url, type = 'website', product, breadcrumbs }: SEOProps) => {
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

    // JSON-LD Structured Data
    const existingJsonLd = document.querySelector('script[type="application/ld+json"][data-seo]');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    const jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.setAttribute('data-seo', 'true');

    const schemas: object[] = [];

    // Organization schema (always include)
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: "Do'kon",
      url: window.location.origin,
      logo: `${window.location.origin}/favicon.ico`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+998-90-123-45-67',
        contactType: 'customer service',
        areaServed: 'UZ',
        availableLanguage: 'uz'
      }
    });

    // Product schema
    if (type === 'product' && product) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || description,
        image: product.image || image,
        sku: product.sku,
        brand: {
          '@type': 'Brand',
          name: product.brand || "Do'kon"
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency || 'UZS',
          availability: product.availability === 'InStock' 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          url: url
        }
      });
    }

    // WebSite schema for homepage
    if (type === 'website') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: "Do'kon",
        url: window.location.origin,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${window.location.origin}/catalog?search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      });
    }

    // BreadcrumbList schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url
        }))
      });
    }

    jsonLdScript.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
    document.head.appendChild(jsonLdScript);

    return () => {
      document.title = "Do'kon";
      const script = document.querySelector('script[type="application/ld+json"][data-seo]');
      if (script) script.remove();
    };
  }, [title, description, image, url, type, product, breadcrumbs]);
};
