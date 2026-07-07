import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { computePrayerTimes } from "../lib/prayerMath";
import { fmtHours } from "../lib/time";
import { PRAYER_ORDER } from "../lib/constants";

const LOCALE_TAGS = { fr: "fr-FR", en: "en-US", ar: "ar" };

export default function CalendarScreen({ loc, method, asr, locale, onBack }) {
  const { t } = useTranslation();
  const today = new Date();
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const tag = LOCALE_TAGS[locale] || "fr-FR";
  const monthLabel = month.toLocaleDateString(tag, { month: "long", year: "numeric" });

  const rows = useMemo(() => {
    if (!loc) return [];
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const out = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(month.getFullYear(), month.getMonth(), d, 12);
      const times = computePrayerTimes(date, loc.lat, loc.lon, method, asr);
      out.push({
        day: d,
        isToday:
          d === today.getDate() && month.getMonth() === today.getMonth() && month.getFullYear() === today.getFullYear(),
        times: PRAYER_ORDER.map((k) => fmtHours(times[k]).label),
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc, method, asr, month]);

  function shiftMonth(delta) {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  return (
    <div key="calendar" className="rise">
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={onBack}
          className="press flex items-center justify-center"
          aria-label={t("common.close")}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: "var(--card2)",
            border: "1px solid var(--line2)",
            color: "var(--txt)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={16} style={{ transform: locale === "ar" ? "scaleX(-1)" : undefined }} />
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{t("calendar.title")}</h2>
      </div>

      <div className="card mb-3 flex items-center justify-between" style={{ padding: "10px 12px" }}>
        <button onClick={() => shiftMonth(-1)} className="press btn-gh" style={{ padding: "8px 10px" }} aria-label="-1">
          <ChevronLeft size={16} style={{ transform: locale === "ar" ? "scaleX(-1)" : undefined }} />
        </button>
        <div style={{ fontWeight: 800, fontSize: 15, textTransform: "capitalize" }}>{monthLabel}</div>
        <button onClick={() => shiftMonth(1)} className="press btn-gh" style={{ padding: "8px 10px" }} aria-label="+1">
          <ChevronRight size={16} style={{ transform: locale === "ar" ? "scaleX(-1)" : undefined }} />
        </button>
      </div>

      <div className="card" style={{ padding: "6px 0", overflow: "hidden" }}>
        <div
          className="flex items-center"
          style={{ padding: "8px 12px", borderBottom: "1px solid var(--line2)", fontSize: 10, color: "var(--mut)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          <span style={{ width: 30 }}></span>
          {PRAYER_ORDER.map((k) => (
            <span key={k} className="flex-1 text-center">
              {t(`prayers.${k}`)}
            </span>
          ))}
        </div>
        <div style={{ maxHeight: 420, overflowY: "auto" }}>
          {rows.map((r) => (
            <div
              key={r.day}
              className="flex items-center"
              style={{
                padding: "7px 12px",
                fontSize: 12,
                background: r.isToday ? "rgba(52,211,153,0.1)" : undefined,
                borderInlineStart: r.isToday ? "3px solid var(--em)" : "3px solid transparent",
              }}
            >
              <span className="mono" style={{ width: 27, fontWeight: r.isToday ? 800 : 600, color: r.isToday ? "var(--em)" : "var(--mut)" }}>
                {r.day}
              </span>
              {r.times.map((label, i) => (
                <span key={i} className="mono flex-1 text-center" style={{ fontWeight: r.isToday ? 700 : 500 }}>
                  {label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--mut)", lineHeight: 1.5, marginTop: 8 }}>{t("calendar.note")}</div>
    </div>
  );
}
