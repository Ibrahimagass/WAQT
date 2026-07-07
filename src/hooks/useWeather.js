import { useEffect, useState } from "react";

import { askJSON } from "../lib/aiClient";

// Weather is primarily decorative; we try Gemini first for a locale-aware estimate,
// then fall back to Open-Meteo if the AI route is unavailable.
const REFRESH_MS = 30 * 60 * 1000;

export function useWeather(loc) {
  const [weather, setWeather] = useState(null); // { temp, code }

  useEffect(() => {
    if (!loc) return undefined;
    let cancelled = false;

    async function load() {
      try {
        const prompt = [
          "You are a weather assistant.",
          `The user is currently near ${loc.label || `${loc.lat}, ${loc.lon}`}.`,
          `Coordinates: ${loc.lat}, ${loc.lon}.`,
          "Return strict JSON only with fields 'temp' (integer Celsius) and 'code' (WMO weather code).",
          "Use the best current estimate for this location and date, based on the available context.",
          'Example response: {"temp": 21, "code": 2}',
        ].join(" ");

        const aiResult = await askJSON({ prompt, webSearch: true, maxTokens: 300 });
        const aiTemp = Number(aiResult?.temp ?? aiResult?.temperature ?? aiResult?.tempC);
        const aiCode = Number(aiResult?.code ?? aiResult?.weatherCode ?? aiResult?.conditionCode);
        if (!cancelled && Number.isFinite(aiTemp) && Number.isFinite(aiCode)) {
          setWeather({ temp: Math.round(aiTemp), code: aiCode });
          return;
        }
      } catch {
        // fall through to the open-meteo fallback below
      }

      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.current) {
          setWeather({ temp: Math.round(data.current.temperature_2m), code: data.current.weather_code });
        }
      } catch {
        // weather is purely decorative — fail silently
      }
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [loc]);

  return weather;
}

// WMO weather code → lucide icon name bucket
export function weatherBucket(code) {
  if (code === 0) return "sun";
  if (code === 1 || code === 2) return "cloud-sun";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "cloud";
}
