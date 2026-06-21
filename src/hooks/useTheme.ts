import { useCallback, useState } from "react";

/** Dark/light toggle. The initial class is applied synchronously by the inline
 *  script in index.html (no flash); this hook just flips it and remembers the
 *  choice in localStorage.
 *
 *  The key is namespaced (`duan:theme`) because GitHub Pages project sites all
 *  share one origin (pierre-claisse.github.io), and localStorage is per-origin —
 *  a bare "theme" key would collide with the other apps hosted there. */
const THEME_KEY = "duan:theme";

export function useTheme(): { dark: boolean; toggle: () => void } {
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark"),
  );

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      } catch {
        /* private browsing / quota — ignore */
      }
      return next;
    });
  }, []);

  return { dark, toggle };
}
