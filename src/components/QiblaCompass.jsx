import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Navigation2 } from "lucide-react";

export default function QiblaCompass({ loc, qibla, heading, aligned, permission, requestPermission }) {
  const { t } = useTranslation();
  const rotation = (qibla ?? 0) - (heading ?? 0);

  return (
    <div className="card relative mb-4 flex flex-col items-center" style={{ padding: "18px 16px" }}>
      <svg viewBox="0 0 200 200" width="180" height="180">
        <circle cx="100" cy="100" r="92" fill="none" stroke="var(--line2)" strokeWidth="1.5" />
        {[0, 90, 180, 270].map((a) => (
          <text
            key={a}
            x={100 + 78 * Math.sin((a * Math.PI) / 180)}
            y={100 - 78 * Math.cos((a * Math.PI) / 180) + 4}
            textAnchor="middle"
            fill="var(--mut)"
            fontSize="11"
            fontWeight="600"
          >
            {["N", "E", "S", "O"][a / 90]}
          </text>
        ))}
        <motion.g
          style={{ transformOrigin: "100px 100px" }}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 90, damping: 14, mass: 0.6 }}
        >
          <path d="M100 24 L108 100 L100 92 L92 100 Z" fill={aligned ? "var(--em)" : "var(--mut)"} />
          <circle cx="100" cy="100" r="5" fill="var(--txt)" />
        </motion.g>
      </svg>

      <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--em)", marginTop: 4 }}>
        {qibla !== null ? Math.round(qibla) + "°" : "--"}
      </div>

      {aligned && heading !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="chip mt-2"
          style={{ background: "rgba(52,211,153,0.14)", color: "var(--em)" }}
        >
          <Navigation2 size={12} /> {t("qibla.aligned")}
        </motion.div>
      )}

      <div className="text-center" style={{ fontSize: 12.5, color: "var(--mut)", lineHeight: 1.5, maxWidth: 260, marginTop: 8 }}>
        {heading !== null ? t("qibla.liveHint") : t("qibla.staticHint", { place: loc?.label })}
      </div>

      {permission === "prompt" && (
        <button onClick={requestPermission} className="press btn-gh mt-4" style={{ fontSize: 13 }}>
          {t("qibla.enableCompass")}
        </button>
      )}
      {permission === "denied" && (
        <div className="mt-3 text-center" style={{ fontSize: 11.5, color: "var(--bad)", maxWidth: 260 }}>
          {t("qibla.permissionDenied")}
        </div>
      )}
    </div>
  );
}
