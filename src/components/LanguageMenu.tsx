// Language switcher: a small dropdown listing the available locales by their
// own name. Used in both the desktop nav and the mobile menu.
import { useEffect, useRef, useState } from "react";
import { Languages, Check } from "lucide-react";
import { useI18n, LOCALES, LANGUAGE_NAMES, type Locale } from "../i18n";

export function LanguageMenu({ onPick }: { onPick?: () => void }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-content/70 hover:bg-content/5 hover:text-content"
      >
        <Languages className="h-4 w-4" />
        {LANGUAGE_NAMES[locale]}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-32 overflow-hidden rounded-lg border border-content/20 bg-surface shadow-lg">
          {LOCALES.map((l: Locale) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setLocale(l);
                setOpen(false);
                onPick?.();
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-content hover:bg-content/5"
            >
              {LANGUAGE_NAMES[l]}
              {l === locale && <Check className="h-3.5 w-3.5 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
