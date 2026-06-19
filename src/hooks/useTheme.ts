import { useCallback, useState } from "react";

/** Dark/light toggle. The initial class is applied synchronously by the inline
 *  script in index.html (no flash); this hook just flips it and remembers the
 *  choice in localStorage. */
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
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        /* private browsing / quota — ignore */
      }
      return next;
    });
  }, []);

  return { dark, toggle };
}
