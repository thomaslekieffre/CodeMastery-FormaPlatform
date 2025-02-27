"use client";

import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();

  const isDark =
    theme === "dark" || (theme === "system" && systemTheme === "dark");
  const currentTheme = theme === "system" ? systemTheme : theme;

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return {
    theme: currentTheme,
    isDark,
    setTheme,
    toggleTheme,
  };
}
