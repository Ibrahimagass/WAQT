import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Landmark, Sun, Cloud, CloudSun, CloudRain, CloudSnow, CloudFog, CloudLightning } from "lucide-react";
import { fmtHours } from "../lib/time";
import { HERO_GRADIENTS } from "../lib/constants";
import { weatherBucket } from "../hooks/useWeather";
import { CornerStar } from "./ornaments/Ornaments";

const RING_CIRC = 2 * Math.PI * 54;

const WEATHER_ICONS = {
  sun: Sun,
  cloud: Cloud,
  "cloud-sun": CloudSun,
  rain: CloudRain,
  snow: CloudSnow,
  fog: CloudFog,
  storm: CloudLightning,
};

export default function HeroCard({ times, nextInfo, period, themeResolved, dateStrings, mosque, weather }) {
  const { t } = useTranslation();
  const gradient = HERO_GRADIENTS[themeResolved]?.[period] || HERO_GRADIENTS.dark.night;
  const WeatherIcon = weather ? WEATHER_ICONS[weatherBucket(weather.code)] || Cloud : null;
  // the light-theme hero gradients are pastel — switch to dark ink there
  const light = themeResolved === "light";
  const ink = light ? "#0B3B2E" : "#E9F5EF";
  const inkSoft = light ? "rgba(11,59,46,0.75)" : "rgba(233,245,239,0.75)";
  const inkFaint = light ? "rgba(11,59,46,0.6)" : "rgba(233,245,239,0.65)";
  const ringTrack = light ? "rgba(11,59,46,0.15)" : "rgba(255,255,255,0.18)";
  const ringFill = light ? "#0B3B2E" : "#FFFFFF";

  return (
    <div
      className="relative overflow-hidden"
      style={{ borderRadius: "var(--radius-xl)", padding: "20px 18px", background: gradient, border: "1px solid var(--line)" }}
    >
      {/* paper-cut star peeking from the bottom corner, like the reference artwork */}
      <CornerStar size={140} opacity={0.16} style={{ bottom: -58, insetInlineEnd: -44 }} />
      <div className="relative flex items-center justify-between" style={{ color: ink }}>
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: inkSoft,
              fontWeight: 700,
            }}
          >
            {t("home.nextPrayer")}
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", margin: "2px 0" }}>
            {t(`prayers.${nextInfo.key}`)}
          </div>
          <div key={nextInfo.label} className="mono tick" style={{ fontSize: 16, color: inkSoft }}>
            {nextInfo.label}
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: 11.5, color: inkFaint, marginTop: 4 }}>
            <span>{dateStrings.gregorian}</span>
            {weather && WeatherIcon && (
              <span className="flex items-center gap-1">
                · <WeatherIcon size={12} /> {weather.temp}°
              </span>
            )}
          </div>
        </div>
        <div className="relative" style={{ width: 124, height: 124 }}>
          <svg viewBox="0 0 124 124" width="124" height="124">
            <circle cx="62" cy="62" r="54" fill="none" stroke={ringTrack} strokeWidth="7" />
            <motion.circle
              cx="62"
              cy="62"
              r="54"
              fill="none"
              stroke={ringFill}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              animate={{ strokeDashoffset: RING_CIRC * (1 - nextInfo.progress) }}
              transition={{ duration: 1, ease: "linear" }}
              transform="rotate(-90 62 62)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="mono" style={{ fontSize: 19, fontWeight: 700 }}>
              {fmtHours(times[nextInfo.key]).label}
            </span>
            <span style={{ fontSize: 9.5, color: inkFaint, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {Math.round(nextInfo.progress * 100)}%
            </span>
          </div>
        </div>
      </div>
      {mosque && (
        <div
          className="chip relative mt-3"
          style={{ background: light ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.25)", color: light ? "#0B3B2E" : "#DFFCEF" }}
        >
          <Landmark size={12} /> {t("home.mosqueTimesActive", { name: mosque.nom })}
        </div>
      )}
    </div>
  );
}
