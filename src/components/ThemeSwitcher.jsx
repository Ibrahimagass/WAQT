import { useTranslation } from "react-i18next";
import { Sun, Moon, MonitorSmartphone } from "lucide-react";

const OPTIONS = [
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
  { value: "auto", Icon: MonitorSmartphone },
];

export default function ThemeSwitcher({ theme, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ value, Icon }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className="press flex flex-1 flex-col items-center gap-1.5"
          style={{
            padding: "12px 6px",
            borderRadius: 14,
            cursor: "pointer",
            fontFamily: "inherit",
            background: theme === value ? "rgba(52,211,153,0.1)" : "var(--card2)",
            border: `1px solid ${theme === value ? "var(--em)" : "var(--line2)"}`,
            color: theme === value ? "var(--em)" : "var(--txt)",
          }}
        >
          <Icon size={16} />
          <span style={{ fontSize: 11.5, fontWeight: 600 }}>{t(`settings.themeOptions.${value}`)}</span>
        </button>
      ))}
    </div>
  );
}
