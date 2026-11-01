'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { defaultDictionaryEN } from '@/lib/translations-dictionary';

export type Language = 'id' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (idText: string, enText: string) => string;
  translations: Record<string, string>;
  registerTexts: (texts: (string | undefined | null)[]) => void;
}

const CACHE_KEY = 'geo_portfolio_translations_v2';

const LanguageContext = createContext<LanguageContextType>({
  lang: 'id',
  setLang: () => {},
  t: (idText) => idText,
  translations: defaultDictionaryEN,
  registerTexts: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('id');
  const [translations, setTranslations] = useState<Record<string, string>>(() => {
    return { ...defaultDictionaryEN };
  });

  const pendingTextsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved language and localStorage translations cache
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('geo_portfolio_lang') as Language;
      if (savedLang === 'id' || savedLang === 'en') {
        setLangState(savedLang);
      }

      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          setTranslations((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('geo_portfolio_lang', newLang);
    } catch {
      // ignore
    }
  };

  const t = (idText: string, enText: string) => {
    return lang === 'en' ? enText : idText;
  };

  // Batched translation fetcher
  const flushPendingTranslations = useCallback(async () => {
    if (pendingTextsRef.current.size === 0) return;

    const textsToTranslate = Array.from(pendingTextsRef.current);
    pendingTextsRef.current.clear();

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: textsToTranslate, from: 'id', to: 'en' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.translations && Object.keys(data.translations).length > 0) {
          setTranslations((prev) => {
            const updated = { ...prev, ...data.translations };
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
            } catch {
              // ignore
            }
            return updated;
          });
        }
      }
    } catch (err) {
      console.warn('Auto-translate error, using original text as fallback:', err);
    }
  }, []);

  // Register texts that should be translated when EN is active
  const registerTexts = useCallback(
    (texts: (string | undefined | null)[]) => {
      let hasNew = false;
      for (const text of texts) {
        if (!text || typeof text !== 'string') continue;
        const trimmed = text.trim();
        if (!trimmed || trimmed.length < 2) continue;

        // If not already in translations state or pending set
        if (!translations[trimmed] && !pendingTextsRef.current.has(trimmed)) {
          pendingTextsRef.current.add(trimmed);
          hasNew = true;
        }
      }

      if (hasNew) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          flushPendingTranslations();
        }, 150);
      }
    },
    [translations, flushPendingTranslations]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translations, registerTexts }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
