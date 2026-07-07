import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Navigation, Search } from "lucide-react";
import { useLocation } from "../hooks/useLocation";
import { FALLBACK_CITIES } from "../lib/constants";

export default function LocationEditor({ fromSettings, onDone }) {
  const { t } = useTranslation();
  const { busy, messageKey, locateByGPS, search, selectCity } = useLocation();
  const [searchText, setSearchText] = useState("");
  const [cityIdx, setCityIdx] = useState(0);

  async function handleGPS() {
    await locateByGPS();
    onDone?.();
  }
  async function handleSearch() {
    await search(searchText);
    setSearchText("");
    onDone?.();
  }
  function handleCity() {
    selectCity(cityIdx);
    onDone?.();
  }

  return (
    <div>
      <button onClick={handleGPS} disabled={busy} className="press btn-em mb-3 w-full">
        {busy ? <Loader2 className="animate-spin" size={16} /> : <Navigation size={16} />}
        {t("locationEditor.gpsButton")}
      </button>
      <div className="lbl mb-2 block">{t("locationEditor.searchLabel")}</div>
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          placeholder={t("locationEditor.searchPlaceholder")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button
          onClick={handleSearch}
          disabled={busy}
          className="press btn-gh"
          style={{ padding: "0 16px" }}
          aria-label={t("locationEditor.searchAria")}
        >
          <Search size={17} />
        </button>
      </div>
      {messageKey && <div style={{ fontSize: 12.5, color: "var(--mut)", marginBottom: 8 }}>{t(`messages.${messageKey}`)}</div>}
      {!fromSettings && (
        <>
          <div className="lbl mb-2 mt-3 block">{t("locationEditor.cityLabel")}</div>
          <div className="flex gap-2">
            <select value={cityIdx} onChange={(e) => setCityIdx(parseInt(e.target.value, 10))}>
              {FALLBACK_CITIES.map((c, i) => (
                <option key={c.name} value={i} style={{ color: "#111" }}>
                  {c.name}
                </option>
              ))}
            </select>
            <button onClick={handleCity} className="press btn-gh" style={{ padding: "0 16px" }}>
              {t("locationEditor.cityConfirm")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
