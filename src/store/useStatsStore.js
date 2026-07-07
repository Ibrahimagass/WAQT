import { create } from "zustand";
import { storageGet, storageSet } from "../lib/storage";
import { weekKey } from "../lib/time";

const STORAGE_KEY = "waqt_stats_v1";

const HISTORY_MAX = 200;

function freshWeek() {
  return { streak: 0, total: 0, daily: {}, week: weekKey(new Date()), passesLeft: 3, history: [] };
}

function persistedFields(state) {
  const { streak, total, daily, week, passesLeft, history } = state;
  return { streak, total, daily, week, passesLeft, history };
}

export const useStatsStore = create((set, get) => ({
  ...freshWeek(),
  hydrated: false,

  hydrate: async () => {
    const saved = await storageGet(STORAGE_KEY);
    const wk = weekKey(new Date());
    if (saved) {
      const fixed = saved.week === wk ? saved : { ...saved, week: wk, passesLeft: 3 };
      set({ ...fixed, hydrated: true });
      if (saved.week !== wk) storageSet(STORAGE_KEY, fixed);
    } else {
      set({ ...freshWeek(), hydrated: true });
    }
  },

  // Bug fix: passesLeft used to only reset on app boot. Call this from the
  // app's 1s clock tick so it also resets if the app stays open across a
  // week boundary.
  ensureCurrentWeek: () => {
    const wk = weekKey(new Date());
    if (get().week !== wk) {
      set({ week: wk, passesLeft: 3 });
      storageSet(STORAGE_KEY, persistedFields(get()));
    }
  },

  recordPrayer: (prayerKey) => {
    const today = new Date().toDateString();
    const daily = { ...get().daily, [today]: (get().daily[today] || 0) + 1 };
    const history = [{ ts: Date.now(), prayer: prayerKey || null }, ...(get().history || [])].slice(0, HISTORY_MAX);
    set({ streak: get().streak + 1, total: get().total + 1, daily, history });
    storageSet(STORAGE_KEY, persistedFields(get()));
  },

  spendPass: () => {
    if (get().passesLeft <= 0) return false;
    set({ passesLeft: get().passesLeft - 1 });
    storageSet(STORAGE_KEY, persistedFields(get()));
    return true;
  },

  reset: () => {
    const fresh = freshWeek();
    set({ ...fresh });
    storageSet(STORAGE_KEY, fresh);
  },
}));
