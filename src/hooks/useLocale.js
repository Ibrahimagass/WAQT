import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../store/useSettingsStore";

// Keeps i18next, <html lang>, and <html dir> (RTL for Arabic) in sync with
// the persisted locale setting.
export function useLocale() {
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale, i18n]);

  return { locale, setLocale, t };
}
