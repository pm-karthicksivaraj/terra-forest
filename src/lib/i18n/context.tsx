'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationKey;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'vi',
  setLang: () => {},
  t: translations.vi,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('vi');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('terra-forest-lang') as Language;
      if (saved && (saved === 'vi' || saved === 'en')) {
        setLangState(saved);
        document.documentElement.lang = saved;
      } else {
        document.documentElement.lang = 'vi';
      }
    }
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('terra-forest-lang', newLang);
      document.documentElement.lang = newLang;
    }
  }, []);

  const t = translations[lang];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
