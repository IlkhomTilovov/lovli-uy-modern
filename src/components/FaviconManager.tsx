import { useEffect } from 'react';
import { useSiteContent } from '@/hooks/useSiteContent';

export const FaviconManager = () => {
  const { branding } = useSiteContent();

  useEffect(() => {
    if (branding?.favicon) {
      // Remove existing favicon
      const existingFavicon = document.querySelector("link[rel='icon']");
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Add new favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = branding.favicon;
      document.head.appendChild(link);
    }
  }, [branding?.favicon]);

  return null;
};
