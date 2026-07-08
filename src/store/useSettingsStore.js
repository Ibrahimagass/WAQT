import { create } from "zustand";
import { storageGet, storageSet } from "../lib/storage";

const STORAGE_KEY = "waqt_settings_v1";

function persistedFields(state) {
  const { loc, method, asr, mode, mosque, theme, locale, onboarded, favorites, notifEnabled, prayerOverrides } = state;
  return { loc, method, asr, mode, mosque, theme, locale, onboarded, favorites, notifEnabled, prayerOverrides };
}

export const useSettingsStore = create((set, get) => ({
  loc: null, // { lat, lon, label }
  method: "MWL",
  asr: "STANDARD",
  mode: "focus", // 'focus' | 'voyage'
  mosque: null, // { nom, adresse, horaires, source }
  theme: "auto", // 'light' | 'dark' | 'auto'
  locale: "fr", // 'fr' | 'en' | 'ar'
  onboarded: false,
  favorites: [], // mosquées favorites [{nom, adresse, horaires, source}]
  notifEnabled: false,
  prayerOverrides: {}, // { fajr: '05:30', dhuhr: '13:00', ... }
  hydrated: false,

  hydrate: async () => {
    const saved = await storageGet(STORAGE_KEY);
    set({ ...(saved || {}), hydrated: true });
  },

  setLoc: (loc) => {
    set({ loc, mosque: null, onboarded: true });
    storageSet(STORAGE_KEY, persistedFields(get()));
  },
  setMosque: (mosque) => {
    set({ mosque });
    storageSet(STORAGE_KEY, persistedFields(get()));
  },
  setMethod: (method) => {
    set({ method });
    storageSet(STORAGE_KEY, persistedFields(get()));
  },
  setAsr: (asr) => {
    set({ asr });
    storageSet(STORAGE_KEY, persistedFields(get()));
  },
  setMode: (mode) => {
    set({ mode });
    storageSet(STORAGE_KEY, persistedFields(get()));
  },
  setTheme: (theme) => {
    set({ theme });
    storageSet(STORAGE_KEY, persistedFields(get()));
  },
  setLocale: (locale) => {
    set({ locale });
    storageSet(STORAGE_KEY, persistedFields(get()));
  },
  toggleFavorite: (mosque) => {
    const favs = get().favorites || [];
    const exists = favs.some((f) => f.nom === mosque.nom);
    set({ favorites: exists ? favs.filter((f) => f.nom !== mosque.nom) : [...favs, mosque] });
    storageSet(STORAGE_KEY, persistedFields(get()));
    return !exists;
  },
  setNotifEnabled: (notifEnabled) => {
    set({ notifEnabled });
    storageSet(STORAGE_KEY, persistedFields(get()));
  },
  setPrayerOverride: (prayer, value) => {
    const prev = get().prayerOverrides || {};
    const next = { ...prev };
    if (value && String(value).trim()) next[prayer] = String(value).trim();
    else delete next[prayer];
    set({ prayerOverrides: next });
    storageSet(STORAGE_KEY, persistedFields(get()));
  },
}));
