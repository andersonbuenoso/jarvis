import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./themeContextValue";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("jarvis.theme") as Theme) || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("jarvis.theme", theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark"),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
