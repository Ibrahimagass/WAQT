import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Camera as CameraIcon, Clock } from "lucide-react";
import { CornerStar } from "./ornaments/Ornaments";

export default function AlarmModal({ alarm, mode, passesLeft, onOpenCamera, onUsePass, onCancelTest }) {
  const { t } = useTranslation();
  if (!alarm) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
      style={{
        zIndex: 10,
        background: `radial-gradient(600px 440px at 50% 18%, rgba(52,211,153,0.16), transparent), var(--bg)`,
        borderRadius: "var(--radius-xl)",
      }}
    >
      <CornerStar size={150} opacity={0.1} style={{ top: -40, insetInlineEnd: -50 }} />
      <CornerStar size={110} opacity={0.08} style={{ bottom: -30, insetInlineStart: -36 }} />
      <div
        className="pulse relative mb-6 flex items-center justify-center"
        style={{ width: 124, height: 124, borderRadius: 9999, border: "1.5px solid var(--em)" }}
      >
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--em)" strokeWidth="1.6">
          <path d="M12 3c-3.5 2.2-5.5 5.6-5.5 9.2 0 4.7 3.8 8.5 8.5 8.3-3.6-1.1-6-4.5-6-8.3 0-3.6 1.4-6.8 3-9.2z" />
        </svg>
      </div>
      <div className="mb-2 text-center" style={{ fontSize: 25, fontWeight: 800 }}>
        {t("alarm.title", { prayer: t(`prayers.${alarm.prayer}`) })}
      </div>
      <p className="mb-5 text-center" style={{ fontSize: 13.5, color: "var(--mut)", lineHeight: 1.6, maxWidth: 300 }}>
        {t("alarm.instructions")}
      </p>
      <div className="mb-5 flex gap-2.5" style={{ maxWidth: 300, width: "100%" }}>
        <div className="card text-center" style={{ flex: 1, padding: "12px 8px" }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--em)"
            strokeWidth="1.6"
            style={{ margin: "0 auto 5px" }}
          >
            <path d="M7 21h10M9 3h6l1 6a4 4 0 01-8 0l1-6z" />
            <path d="M12 13v4" />
          </svg>
          <div style={{ fontSize: 11, color: "var(--mut)" }}>{t("alarm.wudu")}</div>
        </div>
        <div className="card text-center" style={{ flex: 1, padding: "12px 8px" }}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--em)"
            strokeWidth="1.6"
            style={{ margin: "0 auto 5px" }}
          >
            <rect x="4" y="6" width="16" height="12" rx="2" />
            <path d="M12 6v12M4 12h16" />
          </svg>
          <div style={{ fontSize: 11, color: "var(--mut)" }}>{t("alarm.mat")}</div>
        </div>
      </div>
      <button onClick={onOpenCamera} className="press btn-em">
        <CameraIcon size={16} /> {t("alarm.openCamera")}
      </button>
      {mode === "voyage" && passesLeft > 0 && !alarm.isTest && (
        <button onClick={onUsePass} className="press btn-gh mt-3" style={{ fontSize: 12.5, padding: "10px 16px" }}>
          <Clock size={13} /> {t("alarm.postpone", { count: passesLeft })}
        </button>
      )}
      {alarm.isTest && (
        <button
          onClick={onCancelTest}
          className="mt-4"
          style={{ background: "none", border: "none", color: "var(--mut)", fontSize: 12.5, textDecoration: "underline", cursor: "pointer", fontFamily: "inherit" }}
        >
          {t("alarm.cancelTest")}
        </button>
      )}
    </motion.div>
  );
}
