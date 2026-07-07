import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { TASBIH_PHASES } from "../lib/constants";

const CIRC = 2 * Math.PI * 86;

export default function TasbihCounter({ phase, count, bump, onTap, onReset }) {
  const { t } = useTranslation();
  const target = TASBIH_PHASES[phase].target;
  const progress = count / target;

  return (
    <div className="card relative flex flex-col items-center" style={{ padding: "20px 16px" }}>
      <motion.button
        onClick={onTap}
        whileTap={{ scale: 0.94 }}
        className="press relative flex items-center justify-center"
        aria-label={t("tasbih.title")}
        style={{ width: 186, height: 186, borderRadius: 9999, background: "var(--card2)", border: "none", cursor: "pointer" }}
      >
        <svg viewBox="0 0 200 200" width="186" height="186" style={{ position: "absolute", inset: 0 }}>
          <circle cx="100" cy="100" r="86" fill="none" stroke="var(--line2)" strokeWidth="6" />
          <motion.circle
            cx="100"
            cy="100"
            r="86"
            fill="none"
            stroke="var(--em)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            animate={{ strokeDashoffset: CIRC * (1 - progress) }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className="relative text-center" style={{ zIndex: 1 }}>
          <motion.div key={bump} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="mono" style={{ fontSize: 42, fontWeight: 700 }}>
            {count}
          </motion.div>
          <div style={{ fontSize: 14.5, color: "var(--em)", fontWeight: 700 }}>{t(`tasbih.phases.${TASBIH_PHASES[phase].label}`)}</div>
          <div style={{ fontSize: 10.5, color: "var(--mut)", marginTop: 2 }}>{t("tasbih.instructions", { target })}</div>
        </div>
      </motion.button>
      <button
        onClick={onReset}
        className="press mt-3 flex items-center gap-1.5"
        style={{ background: "none", border: "none", color: "var(--mut)", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}
      >
        <RotateCcw size={13} /> {t("tasbih.reset")}
      </button>
    </div>
  );
}
