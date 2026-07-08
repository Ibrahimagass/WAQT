import { useMemo } from "react";
import { computePrayerTimes } from "../lib/prayerMath";
import { fmtHours, parseHM } from "../lib/time";
import { PRAYER_ORDER, PERIOD_BY_PRAYER } from "../lib/constants";
import { useSettingsStore } from "../store/useSettingsStore";

export function usePrayerTimes({ now, loc, method, asr, mosque }) {
  const prayerOverrides = useSettingsStore((s) => s.prayerOverrides || {});
  const solarTimes = useMemo(
    () => (loc ? computePrayerTimes(now, loc.lat, loc.lon, method, asr) : null),
    [now, loc, method, asr]
  );

  const times = useMemo(() => {
    if (!solarTimes) return null;
    const t = { ...solarTimes };
    for (const k of PRAYER_ORDER) {
      const override = parseHM(prayerOverrides[k]);
      if (override !== null) {
        t[k] = override;
        continue;
      }
      if (mosque?.horaires) {
        const v = parseHM(mosque.horaires[k]);
        if (v !== null) t[k] = v;
      }
    }
    return t;
  }, [solarTimes, mosque, prayerOverrides]);

  const nowDec = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

  // Chronological boundaries starting at Fajr. Isha's clock time is smaller
  // than Fajr's whenever it falls after midnight (e.g. 00:49) — push it (and
  // only it) 24h forward so every boundary after Fajr keeps increasing and
  // range comparisons stay correct across the midnight wraparound.
  const boundaries = useMemo(() => {
    if (!times) return null;
    const fajrDec = fmtHours(times.fajr).dec;
    if (fajrDec === null) return null;
    return PRAYER_ORDER.map((key) => {
      let dec = fmtHours(times[key]).dec;
      if (dec !== null && dec < fajrDec) dec += 24;
      return { key, dec };
    }).filter((b) => b.dec !== null);
  }, [times]);

  const currentKey = useMemo(() => {
    if (!boundaries || boundaries.length === 0) return null;
    const fajrDec = boundaries[0].dec;
    // Before today's Fajr we're still inside last night's Isha window.
    if (nowDec < fajrDec) return "isha";
    for (let i = 0; i < boundaries.length; i++) {
      const next = i < boundaries.length - 1 ? boundaries[i + 1].dec : boundaries[0].dec + 24;
      if (nowDec >= boundaries[i].dec && nowDec < next) return boundaries[i].key;
    }
    return "isha";
  }, [boundaries, nowDec]);

  const period = PERIOD_BY_PRAYER[currentKey] || "night";

  const nextInfo = useMemo(() => {
    if (!boundaries || boundaries.length === 0) return null;
    const fajrDec = boundaries[0].dec;
    const nowExt = nowDec < fajrDec ? nowDec + 24 : nowDec;

    let next = boundaries.find((b) => b.dec > nowExt);
    let prevDec;
    if (!next) {
      next = { key: "fajr", dec: fajrDec + 24 };
      prevDec = boundaries[boundaries.length - 1].dec;
    } else {
      const idx = boundaries.indexOf(next);
      prevDec = idx > 0 ? boundaries[idx - 1].dec : fajrDec - 24;
    }

    const totalSec = Math.max(0, Math.round((next.dec - nowExt) * 3600));
    const hh = Math.floor(totalSec / 3600);
    const mm = Math.floor((totalSec % 3600) / 60);
    const ss = totalSec % 60;
    const span = Math.max(0.01, next.dec - prevDec);
    const progress = Math.max(0, Math.min(1, (nowExt - prevDec) / span));
    return {
      key: next.key,
      label: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`,
      progress,
    };
  }, [boundaries, nowDec]);

  return { times, currentKey, period, nextInfo, nowDec };
}
