import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { fmtHours } from "../lib/time";
import { useSettingsStore } from "../store/useSettingsStore";

function formatTimeParts(hour, minute) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parseTimeValue(raw, fallback) {
  const source = raw || fallback;
  const match = String(source).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return { hour: 0, minute: 0 };
  return {
    hour: Math.min(23, Math.max(0, parseInt(match[1], 10))),
    minute: Math.min(59, Math.max(0, parseInt(match[2], 10))),
  };
}

export default function PrayerCard({ prayerKey, time, isCurrent, index }) {
  const { t } = useTranslation();
  const setPrayerOverride = useSettingsStore((s) => s.setPrayerOverride);
  const prayerOverrides = useSettingsStore((s) => s.prayerOverrides || {});
  const [isOpen, setIsOpen] = useState(false);
  const [picker, setPicker] = useState(parseTimeValue(prayerOverrides[prayerKey], fmtHours(time).label));

  const openPicker = () => {
    setPicker(parseTimeValue(prayerOverrides[prayerKey], fmtHours(time).label));
    setIsOpen(true);
  };

  const applyPicker = () => {
    setPrayerOverride(prayerKey, formatTimeParts(picker.hour, picker.minute));
    setIsOpen(false);
  };

  const clearPicker = () => {
    setPrayerOverride(prayerKey, "");
    setIsOpen(false);
  };

  const currentLabel = fmtHours(time).label;

  return (
    <>
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
        <button
          type="button"
          onClick={openPicker}
          className="press"
          style={{
            border: "1px solid var(--line2)",
            background: "linear-gradient(135deg, rgba(52,211,153,0.14), rgba(14,165,233,0.10))",
            padding: "8px 12px",
            borderRadius: 999,
            color: "var(--txt)",
            fontFamily: "inherit",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
          }}
        >
          <span className="mono" style={{ fontSize: 15.5, fontWeight: 700 }}>
            {prayerOverrides[prayerKey] ? prayerOverrides[prayerKey] : currentLabel}
          </span>
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(2,6,23,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "min(92vw, 360px)", borderRadius: 24, padding: 18, background: "var(--card)", border: "1px solid var(--line2)", boxShadow: "0 24px 70px rgba(2,6,23,0.25)" }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>{t("timePicker.title", { prayer: t(`prayers.${prayerKey}`) })}</div>
              <div style={{ fontSize: 12.5, color: "var(--mut)", marginBottom: 12 }}>{t("timePicker.subtitle")}</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
                <select
                  value={picker.hour}
                  onChange={(e) => setPicker((prev) => ({ ...prev, hour: Number(e.target.value) }))}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line2)", background: "var(--card2)", color: "var(--txt)", fontFamily: "inherit" }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                  ))}
                </select>
                <span style={{ fontSize: 18, fontWeight: 700 }}>:</span>
                <select
                  value={picker.minute}
                  onChange={(e) => setPicker((prev) => ({ ...prev, minute: Number(e.target.value) }))}
                  style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line2)", background: "var(--card2)", color: "var(--txt)", fontFamily: "inherit" }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={clearPicker} className="press" style={{ flex: 1, padding: "10px 12px", borderRadius: 12, fontWeight: 700, fontFamily: "inherit" }}>
                  {t("timePicker.clear")}
                </button>
                <button onClick={applyPicker} className="press btn-gh" style={{ flex: 1, padding: "10px 12px", borderRadius: 12, fontWeight: 700, fontFamily: "inherit" }}>
                  {t("timePicker.apply")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
