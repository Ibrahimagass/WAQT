import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Loader2, MapPin } from "lucide-react";

import { useSettingsStore } from "./store/useSettingsStore";
import { useStatsStore } from "./store/useStatsStore";
import { useClock } from "./hooks/useClock";
import { usePrayerTimes } from "./hooks/usePrayerTimes";
import { useTheme } from "./hooks/useTheme";
import { useLocale } from "./hooks/useLocale";
import { useQibla } from "./hooks/useQibla";
import { useTasbih } from "./hooks/useTasbih";
import { useWeather } from "./hooks/useWeather";
import { useNotifications } from "./hooks/useNotifications";

import { hijriToday, HIJRI_MONTH_KEYS } from "./lib/hijri";
import { fmtHours } from "./lib/time";
import { PRAYER_ORDER } from "./lib/constants";
import { askJSON } from "./lib/aiClient";
import { storageGet, storageSet } from "./lib/storage";

import BottomNav from "./components/BottomNav";
import Toast from "./components/Toast";
import AlarmModal from "./components/AlarmModal";
import CameraModal from "./components/CameraModal";
import { PatternField, OrnamentCluster } from "./components/ornaments/Ornaments";

import Onboarding from "./screens/Onboarding";
import Home from "./screens/Home";
import Mosques from "./screens/Mosques";
import QiblaScreen from "./screens/QiblaScreen";
import Settings from "./screens/Settings";

// Recharts is the single heaviest dependency in the bundle and is only
// needed on the stats tab — split it into its own chunk. Same for the
// month calendar, which recomputes 30 days of times.
const Stats = lazy(() => import("./screens/Stats"));
const CalendarScreen = lazy(() => import("./screens/CalendarScreen"));

const MOSQUE_CACHE_KEY = "waqt_mosques_cache_v1";

const LOCALE_TAGS = { fr: "fr-FR", en: "en-US", ar: "ar" };

function buildMosquePrompt(loc) {
  return (
    `Search the web (prioritize mawaqit.net) for the mosques nearest to "${loc.label}" ` +
    `(coordinates ${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}). For each one, if you find today's prayer times ` +
    "(adhan) on Mawaqit or its own website, include them. Reply ONLY with strict JSON, no other text: " +
    '{"mosquees":[{"nom":"","adresse":"","distance":"~1.2 km","source":"mawaqit.net"|"site"|"inconnu",' +
    '"horaires":{"fajr":"05:12","dhuhr":"13:45","asr":"17:30","maghrib":"21:40","isha":"23:05"} or null}]} ' +
    "— maximum 5 mosques, nearest first."
  );
}

export default function App() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const { resolved: themeResolved, theme, setTheme } = useTheme();

  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const loc = useSettingsStore((s) => s.loc);
  const method = useSettingsStore((s) => s.method);
  const asr = useSettingsStore((s) => s.asr);
  const mode = useSettingsStore((s) => s.mode);
  const mosque = useSettingsStore((s) => s.mosque);
  const onboarded = useSettingsStore((s) => s.onboarded);
  const setMosque = useSettingsStore((s) => s.setMosque);
  const setMethod = useSettingsStore((s) => s.setMethod);
  const setAsr = useSettingsStore((s) => s.setAsr);
  const setMode = useSettingsStore((s) => s.setMode);
  const favorites = useSettingsStore((s) => s.favorites);
  const toggleFavorite = useSettingsStore((s) => s.toggleFavorite);

  const statsHydrated = useStatsStore((s) => s.hydrated);
  const hydrateStats = useStatsStore((s) => s.hydrate);
  const streak = useStatsStore((s) => s.streak);
  const total = useStatsStore((s) => s.total);
  const daily = useStatsStore((s) => s.daily);
  const passesLeft = useStatsStore((s) => s.passesLeft);
  const ensureCurrentWeek = useStatsStore((s) => s.ensureCurrentWeek);
  const recordPrayer = useStatsStore((s) => s.recordPrayer);
  const spendPass = useStatsStore((s) => s.spendPass);
  const resetStats = useStatsStore((s) => s.reset);
  const stats = useMemo(() => ({ streak, total, daily, passesLeft }), [streak, total, daily, passesLeft]);

  const [view, setView] = useState("onboarding");
  const [toastMsg, setToastMsg] = useState(null);
  const [alarm, setAlarm] = useState(null); // { prayer, isTest }
  const [camOpen, setCamOpen] = useState(false);
  const [mosques, setMosques] = useState(null);
  const [mosqueBusy, setMosqueBusy] = useState(false);
  const [mosqueMsg, setMosqueMsg] = useState("");
  const [mosquesFromCache, setMosquesFromCache] = useState(false);

  const toastTimer = useRef(null);
  const audioCtxRef = useRef(null);
  const chimeRef = useRef(null);
  const trigRef = useRef({ dk: null, done: {}, pre: {} });

  const booted = settingsHydrated && statsHydrated;
  const now = useClock(1000);

  useEffect(() => {
    hydrateSettings();
    hydrateStats();
  }, [hydrateSettings, hydrateStats]);

  useEffect(() => {
    if (settingsHydrated && onboarded) setView("home");
  }, [settingsHydrated, onboarded]);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const { times, currentKey, period, nextInfo, nowDec } = usePrayerTimes({ now, loc, method, asr, mosque });
  const qiblaState = useQibla(loc, view === "qibla");
  const tasbih = useTasbih({ onComplete: () => toast(t("tasbih.complete")) });
  const weather = useWeather(loc);
  const notifications = useNotifications();

  // Offline: restore the last mosque search results so they stay usable
  // without network. Refreshed on every successful search.
  useEffect(() => {
    (async () => {
      const cached = await storageGet(MOSQUE_CACHE_KEY);
      if (cached?.mosquees?.length) {
        setMosques(cached.mosquees);
        setMosquesFromCache(true);
      }
    })();
  }, []);

  function startChime() {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const play = () => {
        if (ctx.state === "suspended") ctx.resume();
        [880, 660].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.value = f;
          const t0 = ctx.currentTime + i * 0.28;
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.exponentialRampToValueAtTime(0.15, t0 + 0.05);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
          o.connect(g).connect(ctx.destination);
          o.start(t0);
          o.stop(t0 + 0.55);
        });
      };
      play();
      chimeRef.current = setInterval(play, 2600);
    } catch {
      // audio unavailable — the reminder still shows visually
    }
  }
  function stopChime() {
    if (chimeRef.current) clearInterval(chimeRef.current);
    chimeRef.current = null;
  }
  function openAlarm(prayer, isTest) {
    setAlarm({ prayer, isTest });
    startChime();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }
  function closeAlarm() {
    stopChime();
    setAlarm(null);
  }

  useEffect(() => () => stopChime(), []);

  // Prayer trigger + 10-minute pre-alert + weekly pass reset (bug fix: this
  // used to only reset passesLeft on app boot).
  useEffect(() => {
    ensureCurrentWeek();
    if (!times || alarm) return;
    const dk = now.toDateString();
    if (trigRef.current.dk !== dk) trigRef.current = { dk, done: {}, pre: {} };
    const nowMin = Math.floor(nowDec * 60);
    for (const key of PRAYER_ORDER) {
      const dec = fmtHours(times[key]).dec;
      if (dec === null) continue;
      const pMin = Math.floor(dec * 60);
      if (pMin >= 10 && nowMin === pMin - 10 && !trigRef.current.pre[key]) {
        trigRef.current.pre[key] = true;
        const msg = t("toast.prayerSoon", { prayer: t(`prayers.${key}`) });
        toast(msg);
        notifications.notify(t("common.appName"), msg);
      }
      if (nowMin === pMin && !trigRef.current.done[key]) {
        trigRef.current.done[key] = true;
        notifications.notify(t("common.appName"), t("alarm.title", { prayer: t(`prayers.${key}`) }));
        openAlarm(key, false);
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  function handleUsePass() {
    const ok = spendPass();
    if (ok) {
      closeAlarm();
      toast(t("toast.reminderPostponed", { count: useStatsStore.getState().passesLeft }));
    }
  }

  function handleVerified(isTest) {
    const prayerKey = alarm?.prayer;
    setCamOpen(false);
    closeAlarm();
    if (isTest) {
      toast(t("toast.testSuccess"));
    } else {
      recordPrayer(prayerKey);
      toast(t("toast.prayerConfirmed"));
    }
  }

  async function findMosques() {
    if (!loc) return;
    setMosqueBusy(true);
    setMosqueMsg("");
    try {
      const result = await askJSON({ prompt: buildMosquePrompt(loc), webSearch: true, maxTokens: 2000 });
      if (result && Array.isArray(result.mosquees) && result.mosquees.length > 0) {
        setMosques(result.mosquees);
        setMosquesFromCache(false);
        storageSet(MOSQUE_CACHE_KEY, { mosquees: result.mosquees, loc: loc.label, ts: Date.now() });
      } else {
        setMosqueMsg(t("mosques.none"));
      }
    } catch (e) {
      // network/AI failure — keep whatever cached results are on screen
      setMosqueMsg(e?.notConfigured ? t("ai.notConfigured") : t("mosques.failed"));
    } finally {
      setMosqueBusy(false);
    }
  }

  async function shareTimes() {
    if (!times) return;
    const lines = PRAYER_ORDER.map((k) => `${t(`prayers.${k}`)} — ${fmtHours(times[k]).label}`);
    const text = `${t("share.header", { place: loc?.label, date: dateStrings.gregorian })}\n${lines.join("\n")}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: t("common.appName"), text });
      } catch {
        // user cancelled the share sheet — nothing to do
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast(t("share.copied"));
    } catch {
      // clipboard API blocked — legacy textarea + execCommand fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) toast(t("share.copied"));
    }
  }
  function selectMosque(m) {
    if (!m.horaires) return;
    setMosque(m);
    toast(t("toast.mosqueActivated", { name: m.nom }));
    setView("home");
  }
  function clearMosque() {
    setMosque(null);
    toast(t("toast.mosqueCleared"));
  }

  function changeMethod(m) {
    setMethod(m);
    toast(t("toast.methodUpdated"));
  }
  function changeAsr(a) {
    setAsr(a);
    toast(t("toast.asrUpdated"));
  }
  function changeMode(md) {
    setMode(md);
    toast(md === "focus" ? t("toast.modeFocus") : t("toast.modeVoyage"));
  }
  function handleResetStats() {
    resetStats();
    toast(t("toast.statsReset"));
  }
  function handleToggleFavorite(m) {
    const added = toggleFavorite(m);
    toast(added ? t("mosques.favAdded", { name: m.nom }) : t("mosques.favRemoved", { name: m.nom }));
  }

  const dateStrings = useMemo(() => {
    const hij = hijriToday(now);
    const tag = LOCALE_TAGS[locale] || "fr-FR";
    const g = now.toLocaleDateString(tag, { weekday: "long", day: "numeric", month: "long" });
    return {
      gregorian: g.charAt(0).toUpperCase() + g.slice(1),
      hijri: `${hij.day} ${t(`hijriMonths.${HIJRI_MONTH_KEYS[hij.month - 1]}`)} ${hij.year} H`,
    };
  }, [now, locale, t]);

  if (!booted) {
    return (
      <div className="wq flex items-center justify-center" style={{ minHeight: 560, borderRadius: 26 }}>
        <Loader2 className="animate-spin" size={22} color="var(--em)" />
      </div>
    );
  }

  return (
    <div
      className="wq"
      style={{ borderRadius: 26, minHeight: 700, maxWidth: 420, margin: "0 auto", paddingBottom: view === "onboarding" ? 26 : 92 }}
    >
      {/* decorative layer — faint geometric field + floating paper-cut stars */}
      <PatternField opacity={themeResolved === "light" ? 0.05 : 0.04} />
      <OrnamentCluster
        opacity={themeResolved === "light" ? 0.32 : 0.2}
        scale={0.85}
        style={{ top: -34, insetInlineEnd: -30, width: 200, height: 320 }}
      />
      <div className="relative px-4 pt-5" style={{ zIndex: 1 }}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                background: "linear-gradient(135deg,#0E9F6E,#34D399)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3c-3.5 2.2-5.5 5.6-5.5 9.2 0 4.7 3.8 8.5 8.5 8.3-3.6-1.1-6-4.5-6-8.3 0-3.6 1.4-6.8 3-9.2z"
                  fill="#05211A"
                />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em" }}>{t("common.appName")}</div>
              <div style={{ fontSize: 10.5, color: "var(--mut)", marginTop: -2 }}>{dateStrings.hijri}</div>
            </div>
          </div>
          {loc && (
            <button
              onClick={() => setView("settings")}
              className="press chip"
              style={{ background: "var(--card2)", border: "1px solid var(--line2)", color: "var(--mut)", cursor: "pointer" }}
            >
              <MapPin size={12} color="var(--em)" />{" "}
              <span style={{ maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loc.label}</span>
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === "onboarding" && <Onboarding onLocated={() => setView("home")} />}

            {view === "home" && times && nextInfo && (
              <Home
                times={times}
                nextInfo={nextInfo}
                currentKey={currentKey}
                period={period}
                themeResolved={themeResolved}
                dateStrings={dateStrings}
                mosque={mosque}
                mode={mode}
                passesLeft={stats.passesLeft}
                weather={weather}
                onTestReminder={() => openAlarm(currentKey || "dhuhr", true)}
                onOpenCalendar={() => setView("calendar")}
                onShare={shareTimes}
              />
            )}

            {view === "calendar" && (
              <Suspense fallback={<Loader2 className="animate-spin" size={22} color="var(--em)" />}>
                <CalendarScreen loc={loc} method={method} asr={asr} locale={locale} onBack={() => setView("home")} />
              </Suspense>
            )}

            {view === "mosques" && (
              <Mosques
                loc={loc}
                mosque={mosque}
                mosques={mosques}
                favorites={favorites}
                busy={mosqueBusy}
                message={mosqueMsg}
                offline={mosquesFromCache}
                onSearch={findMosques}
                onSelect={selectMosque}
                onClear={clearMosque}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {view === "qibla" && <QiblaScreen loc={loc} qiblaState={qiblaState} tasbih={tasbih} />}

            {view === "stats" && (
              <Suspense fallback={<Loader2 className="animate-spin" size={22} color="var(--em)" />}>
                <Stats stats={stats} mode={mode} locale={locale} />
              </Suspense>
            )}

            {view === "settings" && (
              <Settings
                loc={loc}
                mosque={mosque}
                mode={mode}
                method={method}
                asr={asr}
                theme={theme}
                locale={locale}
                notifications={notifications}
                onChangeMode={changeMode}
                onChangeMethod={changeMethod}
                onChangeAsr={changeAsr}
                onChangeTheme={setTheme}
                onChangeLocale={setLocale}
                onResetStats={handleResetStats}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {view !== "onboarding" && <BottomNav view={view} onChange={setView} />}

      <AlarmModal
        alarm={alarm}
        mode={mode}
        passesLeft={stats.passesLeft}
        onOpenCamera={() => setCamOpen(true)}
        onUsePass={handleUsePass}
        onCancelTest={closeAlarm}
      />

      <CameraModal open={camOpen} isTest={!!alarm?.isTest} locale={locale} onClose={() => setCamOpen(false)} onVerified={handleVerified} />

      <Toast message={toastMsg} bottom={view === "onboarding" ? 20 : 98} />
    </div>
  );
}
