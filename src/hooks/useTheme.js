import { useEffect } from "react";
import { useSettingsStore } from "../store/useSettingsStore";

function resolveTheme(theme) {
  if (theme === "auto") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return theme;
}

export function useTheme() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  useEffect(() => {
    const apply = () => document.documentElement.setAttribute("data-theme", resolveTheme(theme));
    apply();
    if (theme !== "auto") return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  return { theme, setTheme, resolved: resolveTheme(theme) };
}
