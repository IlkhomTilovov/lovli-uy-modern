import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const LANGUAGE_KEY = 'site_language';
const CACHE_KEY = 'translation_cache';

export type Language = 'uz' | 'ru' | 'kk' | 'tg' | 'tk' | 'ky' | 'fa';

interface TranslationCache {
  [key: string]: {
    [lang: string]: string;
  };
}

// Get cached translations from localStorage
const getCache = (): TranslationCache => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

// Save translations to localStorage cache
const saveCache = (cache: TranslationCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors
  }
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    const validLanguages: Language[] = ['uz', 'ru', 'kk', 'tg', 'tk', 'ky', 'fa'];
    return validLanguages.includes(saved as Language) ? (saved as Language) : 'uz';
  });
  const [cache, setCache] = useState<TranslationCache>(getCache);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener);
  }, []);
  const translateText = useCallback(async (text: string, originalLang: Language = 'uz'): Promise<string> => {
    if (!text || text.trim() === '') return text;
    
    // If current language matches original, return as is
    if (language === originalLang) return text;

    // Check cache first
    const cacheKey = text.substring(0, 100); // Use first 100 chars as key
    if (cache[cacheKey]?.[language]) {
      return cache[cacheKey][language];
    }

    try {
      setIsTranslating(true);
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { text, targetLanguage: language }
      });

      if (error) {
        console.error('Translation error:', error);
        return text;
      }

      const translatedText = data?.translatedText || text;

      // Update cache
      const newCache = {
        ...cache,
        [cacheKey]: {
          ...cache[cacheKey],
          [originalLang]: text,
          [language]: translatedText
        }
      };
      setCache(newCache);
      saveCache(newCache);

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [language, cache]);

  const translateObject = useCallback(async <T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[],
    originalLang: Language = 'uz'
  ): Promise<T> => {
    if (language === originalLang) return obj;

    const translatedObj = { ...obj };
    
    for (const field of fields) {
      const value = obj[field];
      if (typeof value === 'string' && value.trim() !== '') {
        (translatedObj as any)[field] = await translateText(value, originalLang);
      }
    }

    return translatedObj;
  }, [language, translateText]);

  return {
    language,
    isTranslating,
    translateText,
    translateObject
  };
};
