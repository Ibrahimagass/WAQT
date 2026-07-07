import { useCallback, useState } from "react";
import { useSettingsStore } from "../store/useSettingsStore";
import { searchAddress as geocodeSearch, reverseGeocode } from "../lib/geocodeClient";
import { FALLBACK_CITIES } from "../lib/constants";

// Bug fix: the prototype resolved GPS coordinates and free-text addresses
// into place names by asking an LLM with web search — slow and prone to
// hallucination. This uses real geocoding (Nominatim) via /api/geocode.
export function useLocation() {
  const setLoc = useSettingsStore((s) => s.setLoc);
  const locale = useSettingsStore((s) => s.locale);
  const [busy, setBusy] = useState(false);
  const [messageKey, setMessageKey] = useState("");

  const locateByGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setMessageKey("geoUnavailable");
      return;
    }
    setBusy(true);
    setMessageKey("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        let label = `GPS ${lat.toFixed(3)}, ${lon.toFixed(3)}`;
        try {
          const r = await reverseGeocode(lat, lon, locale);
          if (r?.ok && r.label) label = r.label;
        } catch {
          // keep the GPS-coordinate fallback label
        }
        setLoc({ lat, lon, label });
        setBusy(false);
        setMessageKey("");
      },
      () => {
        setBusy(false);
        setMessageKey("locationDenied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setLoc, locale]);

  const search = useCallback(
    async (query) => {
      const q = query.trim();
      if (!q) return;
      setBusy(true);
      setMessageKey("searching");
      try {
        const r = await geocodeSearch(q, locale);
        if (r?.ok) {
          setLoc({ lat: r.lat, lon: r.lon, label: r.label || q });
          setMessageKey("");
        } else {
          setMessageKey("notFound");
        }
      } catch {
        setMessageKey("searchFailed");
      } finally {
        setBusy(false);
      }
    },
    [setLoc, locale]
  );

  const selectCity = useCallback(
    (index) => {
      const c = FALLBACK_CITIES[index];
      if (!c) return;
      setLoc({ lat: c.lat, lon: c.lon, label: c.name });
    },
    [setLoc]
  );

  return { busy, messageKey, locateByGPS, search, selectCity };
}
