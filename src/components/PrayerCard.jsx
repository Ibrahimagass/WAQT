import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fmtHours } from "../lib/time";

export default function PrayerCard({ prayerKey, time, isCurrent, index }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={"card flex items-center justify-between" + (isCurrent ? " glowRow" : "")}
      style={{
        padding: "13px 16px",
        borderRadius: "var(--radius-md)",
        borderColor: isCurrent ? "var(--em)" : undefined,
        background: isCurrent ? "var(--card2)" : "var(--card)",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 9999,
            background: isCurrent ? "var(--em)" : "var(--mut)",
            display: "inline-block",
          }}
        />
        <span style={{ fontSize: 15.5, fontWeight: isCurrent ? 800 : 600 }}>{t(`prayers.${prayerKey}`)}</span>
        {isCurrent && (
          <span className="chip" style={{ background: "rgba(52,211,153,0.12)", color: "var(--em)" }}>
            {t("home.current")}
          </span>
        )}
      </div>
      <span className="mono" style={{ fontSize: 15.5, fontWeight: 600 }}>
        {fmtHours(time).label}
      </span>
    </motion.div>
  );
}
