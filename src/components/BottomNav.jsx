import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Home, Landmark, Compass, BarChart3, Settings as SettingsIcon } from "lucide-react";

const TABS = [
  { key: "home", Icon: Home },
  { key: "mosques", Icon: Landmark },
  { key: "qibla", Icon: Compass },
  { key: "stats", Icon: BarChart3 },
  { key: "settings", Icon: SettingsIcon },
];

export default function BottomNav({ view, onChange }) {
  const { t } = useTranslation();
  // sub-views reached from a tab (e.g. calendar from home) keep that tab lit
  const effectiveView = view === "calendar" ? "home" : view;
  const index = Math.max(0, TABS.findIndex((tab) => tab.key === effectiveView));

  return (
    <div
      className="fixed right-0 left-0 bottom-0"
      style={{
        zIndex: 2,
        padding: "10px 14px max(14px, env(safe-area-inset-bottom))",
        background: "linear-gradient(0deg, var(--bg), transparent)",
      }}
    >
      <div
        className="relative flex w-full"
        style={{
          borderRadius: 999,
          padding: 5,
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(18px)",
        }}
      >
        <motion.div
          className="absolute"
          style={{
            top: 5,
            bottom: 5,
            width: "calc(20% - 3px)",
            insetInlineStart: 4,
            borderRadius: 999,
            background: "rgba(52,211,153,0.14)",
            border: "1px solid var(--em)",
          }}
          animate={{ x: `${index * 100}%` }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
        {TABS.map(({ key, Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="press relative flex flex-1 flex-col items-center gap-0.5"
            style={{
              padding: "7px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: effectiveView === key ? "var(--em)" : "var(--mut)",
              zIndex: 1,
              fontFamily: "inherit",
            }}
          >
            <Icon size={17} />
            <span style={{ fontSize: 9 }}>{t(`nav.${key}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
