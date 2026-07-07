import { useCallback, useEffect, useState } from "react";
import { storageGet, storageSet } from "../lib/storage";
import { TASBIH_PHASES } from "../lib/constants";

const STORAGE_KEY = "waqt_tasbih_v1";

export function useTasbih({ onComplete } = {}) {
  const [state, setState] = useState({ phase: 0, count: 0, bump: 0 });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await storageGet(STORAGE_KEY);
      if (saved) setState({ phase: saved.phase || 0, count: saved.count || 0, bump: 0 });
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    storageSet(STORAGE_KEY, { phase: state.phase, count: state.count });
  }, [state.phase, state.count, hydrated]);

  const tap = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(12);
    setState((prev) => {
      const target = TASBIH_PHASES[prev.phase].target;
      if (prev.count + 1 >= target) {
        if (prev.phase < TASBIH_PHASES.length - 1) {
          if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
          return { phase: prev.phase + 1, count: 0, bump: prev.bump + 1 };
        }
        if (navigator.vibrate) navigator.vibrate([60, 80, 60, 80, 60]);
        onComplete?.();
        return { phase: 0, count: 0, bump: prev.bump + 1 };
      }
      return { ...prev, count: prev.count + 1, bump: prev.bump + 1 };
    });
  }, [onComplete]);

  const reset = useCallback(() => setState({ phase: 0, count: 0, bump: 0 }), []);

  return { ...state, tap, reset };
}
