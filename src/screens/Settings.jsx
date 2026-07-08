import { useTranslation } from "react-i18next";
import { MapPin, Bell, BellOff } from "lucide-react";
import LocationEditor from "../components/LocationEditor";
import ThemeSwitcher from "../components/ThemeSwitcher";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { METHODS } from "../lib/prayerMath";

export default function Settings({
  loc,
  mosque,
  mode,
  method,
  asr,
  theme,
  locale,
  notifications,
  onChangeMode,
  onChangeMethod,
  onChangeAsr,
  onChangeTheme,
  onChangeLocale,
  onResetStats,
}) {
  const { t } = useTranslation();

  return (
    <div key="settings" className="rise">
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px" }}>{t("settings.title")}</h2>

      <div className="card mb-3" style={{ padding: 16 }}>
        <div className="lbl mb-1 block">{t("settings.currentPosition")}</div>
        <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 10 }}>
          <MapPin size={13} style={{ display: "inline", marginInlineEnd: 5 }} color="var(--em)" />
          {loc?.label}
        </div>
        <LocationEditor fromSettings={true} />
      </div>

      <div className="card mb-3" style={{ padding: 16 }}>
        <div className="lbl mb-2 block">{t("settings.reminderMode")}</div>
        <div className="flex gap-2">
          {["focus", "voyage"].map((val) => (
            <button
              key={val}
              onClick={() => onChangeMode(val)}
              className="press flex-1 text-start"
              style={{
                padding: 12,
                borderRadius: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                background: mode === val ? "rgba(52,211,153,0.1)" : "var(--card2)",
                border: `1px solid ${mode === val ? "var(--em)" : "var(--line2)"}`,
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700, color: mode === val ? "var(--em)" : "var(--txt)" }}>
                {t(`mode.${val}.label`)}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--mut)", marginTop: 3, lineHeight: 1.4 }}>{t(`mode.${val}.desc`)}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card mb-3" style={{ padding: 16 }}>
        <div className="lbl mb-2 block">{t("settings.calcMethod")}</div>
        <select value={method} onChange={(e) => onChangeMethod(e.target.value)}>
          {Object.keys(METHODS).map((k) => (
            <option key={k} value={k} style={{ color: "#111" }}>
              {t(`methods.${k}`)}
            </option>
          ))}
        </select>
        {mosque && (
          <div style={{ fontSize: 11.5, color: "var(--mut)", marginTop: 8, lineHeight: 1.5 }}>
            {t("settings.mosqueNote", { name: mosque.nom })}
          </div>
        )}
      </div>

      <div className="card mb-3" style={{ padding: 16 }}>
        <div className="lbl mb-2 block">{t("settings.asrMethod")}</div>
        <div className="flex gap-2">
          {["STANDARD", "HANAFI"].map((val) => (
            <button
              key={val}
              onClick={() => onChangeAsr(val)}
              className="press flex-1"
              style={{
                padding: "10px 6px",
                borderRadius: 12,
                fontSize: 12.5,
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
                background: asr === val ? "rgba(52,211,153,0.1)" : "var(--card2)",
                border: `1px solid ${asr === val ? "var(--em)" : "var(--line2)"}`,
                color: asr === val ? "var(--em)" : "var(--txt)",
              }}
            >
              {t(`asr.${val}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="card mb-3" style={{ padding: 16 }}>
        <div className="lbl mb-2 block">{t("settings.notifications")}</div>
        <div className="flex items-center justify-between gap-3">
          <div style={{ fontSize: 12, color: "var(--mut)", lineHeight: 1.45, flex: 1 }}>
            {notifications.supported
              ? notifications.permission === "denied"
                ? t("settings.notifDenied")
                : t("settings.notifDesc")
              : t("settings.notifUnsupported")}
          </div>
          <button
            onClick={() => (notifications.enabled ? notifications.disable() : notifications.enable())}
            disabled={!notifications.supported || notifications.permission === "denied"}
            className="press"
            aria-pressed={notifications.enabled}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: notifications.enabled ? "rgba(52,211,153,0.1)" : "var(--card2)",
              border: `1px solid ${notifications.enabled ? "var(--em)" : "var(--line2)"}`,
              color: notifications.enabled ? "var(--em)" : "var(--txt)",
              opacity: !notifications.supported || notifications.permission === "denied" ? 0.5 : 1,
            }}
          >
            {notifications.enabled ? <Bell size={14} /> : <BellOff size={14} />}
            {notifications.enabled ? t("settings.notifOn") : t("settings.notifOff")}
          </button>
        </div>
      </div>

      <div className="card mb-3" style={{ padding: 16 }}>
        <div className="lbl mb-2 block">{t("settings.theme")}</div>
        <ThemeSwitcher theme={theme} onChange={onChangeTheme} />
      </div>

      <div className="card mb-3" style={{ padding: 16 }}>
        <div className="lbl mb-2 block">{t("settings.language")}</div>
        <LanguageSwitcher locale={locale} onChange={onChangeLocale} />
      </div>

      <div className="card mb-4" style={{ padding: 14, fontSize: 12, color: "var(--mut)", lineHeight: 1.55 }}>
        {t("settings.privacy")}
      </div>

      <button onClick={onResetStats} className="press btn-gh w-full" style={{ fontSize: 13.5 }}>
        {t("settings.resetStats")}
      </button>
    </div>
  );
}
