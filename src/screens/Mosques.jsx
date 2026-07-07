import { useTranslation } from "react-i18next";
import { Loader2, Search, Landmark, Star } from "lucide-react";
import MosqueCard from "../components/MosqueCard";

export default function Mosques({
  loc,
  mosque,
  mosques,
  favorites,
  busy,
  message,
  offline,
  onSearch,
  onSelect,
  onClear,
  onToggleFavorite,
}) {
  const { t } = useTranslation();
  const favNames = new Set((favorites || []).map((f) => f.nom));
  const results = mosques || [];
  // favorites always shown on top, then fresh results not already listed
  const favList = favorites || [];
  const rest = results.filter((m) => !favNames.has(m.nom));

  return (
    <div key="mosques" className="rise">
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{t("mosques.title")}</h2>
      <p style={{ fontSize: 13, color: "var(--mut)", lineHeight: 1.55, margin: "0 0 14px" }}>
        {t("mosques.description", { place: loc?.label })}
      </p>

      <button onClick={onSearch} disabled={busy} className="press btn-em mb-3 w-full">
        {busy ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
        {busy ? t("mosques.searching") : t("mosques.searchButton")}
      </button>

      {offline && (
        <div className="chip mb-3" style={{ background: "var(--card2)", color: "var(--mut)", border: "1px solid var(--line2)" }}>
          {t("mosques.cached")}
        </div>
      )}
      {message && <div style={{ fontSize: 13, color: "var(--mut)", marginBottom: 10 }}>{message}</div>}

      {mosque && (
        <div className="card mb-3 flex items-center justify-between" style={{ padding: "12px 14px", borderColor: "var(--em)" }}>
          <div style={{ fontSize: 13.5 }}>
            <div style={{ fontWeight: 700 }}>
              <Landmark size={13} style={{ display: "inline", marginInlineEnd: 5 }} color="var(--em)" />
              {mosque.nom}
            </div>
            <div style={{ color: "var(--mut)", fontSize: 12 }}>{t("mosques.currentSource")}</div>
          </div>
          <button onClick={onClear} className="press btn-gh" style={{ padding: "8px 12px", fontSize: 12.5 }}>
            {t("mosques.disable")}
          </button>
        </div>
      )}

      {favList.length > 0 && (
        <>
          <div className="lbl mb-2 flex items-center gap-1.5" style={{ display: "flex" }}>
            <Star size={11} color="#D9B45B" fill="#D9B45B" /> {t("mosques.favorites")}
          </div>
          {favList.map((m, i) => (
            <MosqueCard key={"fav-" + m.nom} mosque={m} index={i} onSelect={onSelect} isFavorite onToggleFavorite={onToggleFavorite} />
          ))}
        </>
      )}

      {rest.length > 0 && favList.length > 0 && (
        <div className="lbl mb-2 mt-3" style={{ display: "block" }}>
          {t("mosques.results")}
        </div>
      )}
      {rest.map((m, i) => (
        <MosqueCard
          key={m.nom + i}
          mosque={m}
          index={i}
          onSelect={onSelect}
          isFavorite={false}
          onToggleFavorite={onToggleFavorite}
        />
      ))}

      {mosques && (
        <div style={{ fontSize: 11.5, color: "var(--mut)", lineHeight: 1.5, marginTop: 6 }}>{t("mosques.disclaimer")}</div>
      )}
    </div>
  );
}
