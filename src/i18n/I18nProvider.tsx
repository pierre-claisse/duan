// Tiny i18n layer (no dependency). Holds the current locale, persists the
// choice, and exposes `t(key, params)` for string lookups with `{placeholder}`
// substitution. Default locale is Taiwanese Mandarin.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  messages,
  type Locale,
  type MsgKey,
} from "./translations";

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MsgKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

/** BCP-47 tag used for the <html lang> attribute and Intl date formatting. */
export function intlLocale(locale: Locale): string {
  return locale === "zh-TW" ? "zh-Hant-TW" : "en";
}

function readInitial(): Locale {
  try {
    const stored = localStorage.getItem("locale");
    if (stored && (LOCALES as string[]).includes(stored)) return stored as Locale;
  } catch {
    /* private browsing / quota — ignore */
  }
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitial);

  useEffect(() => {
    document.documentElement.lang = locale === "zh-TW" ? "zh-Hant" : "en";
    document.title = messages[locale].brand;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("locale", l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: MsgKey, params?: Record<string, string | number>) => {
      let s = messages[locale][key] ?? messages[DEFAULT_LOCALE][key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return s;
    },
    [locale],
  );

  const value = useMemo<I18nValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
