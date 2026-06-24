"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { t as translate } from "@/lib/i18n";

type Locale = "en" | "zh";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
});

const STORAGE_KEY = "talk_forge_locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Always start at "en" so SSR and first client render match.
  // Then sync from localStorage after hydration.
  const [locale, setLocaleState] = useState<Locale>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "zh") {
        setLocaleState(stored);
      } else if (navigator.language.startsWith("zh")) {
        setLocaleState("zh");
      }
    } catch {}
    setHydrated(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  const tFn = useCallback(
    (key: string, replacements?: Record<string, string>) => translate(locale, key, replacements),
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: tFn }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
