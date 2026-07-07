import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronRight, Star } from "lucide-react";
import { PRAYER_ORDER } from "../lib/constants";

export default function MosqueCard({ mosque, index, onSelect, isFavorite, onToggleFavorite }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="card mb-2"
      style={{ padding: "14px 15px" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{mosque.nom}</div>
          <div style={{ fontSize: 12, color: "var(--mut)", marginTop: 2 }}>
            {mosque.adresse}
            {mosque.distance ? " · " + mosque.distance : ""}
          </div>
        </div>
        <div className="flex items-center gap-1.5" style={{ flexShrink: 0 }}>
          <span
            className="chip"
            style={{
              background: mosque.horaires ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.1)",
              color: mosque.horaires ? "var(--em)" : "var(--bad)",
            }}
          >
            {mosque.horaires ? t("mosques.timesFound") : t("mosques.timesNotFound")}
          </span>
          <button
            onClick={() => onToggleFavorite(mosque)}
            className="press flex items-center justify-center"
            aria-label={t("mosques.favorite")}
            aria-pressed={!!isFavorite}
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              background: "var(--card2)",
              border: `1px solid ${isFavorite ? "#D9B45B" : "var(--line2)"}`,
              color: isFavorite ? "#D9B45B" : "var(--mut)",
              cursor: "pointer",
            }}
          >
            <Star size={14} fill={isFavorite ? "#D9B45B" : "none"} />
          </button>
        </div>
      </div>
      {mosque.horaires && (
        <>
          <div
            className="mt-3 mb-3 flex justify-between"
            style={{ background: "var(--card2)", borderRadius: 12, padding: "10px 12px" }}
          >
            {PRAYER_ORDER.map((k) => (
              <div key={k} className="text-center">
                <div style={{ fontSize: 9.5, color: "var(--mut)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t(`prayers.${k}`)}
                </div>
                <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>
                  {mosque.horaires[k] || "--"}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onSelect(mosque)} className="press btn-gh w-full" style={{ padding: "10px", fontSize: 13 }}>
            {t("mosques.use")} <ChevronRight size={14} />
          </button>
        </>
      )}
    </motion.div>
  );
}
