import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { CheckCircle2 } from "lucide-react";

const LOCALE_TAGS = { fr: "fr-FR", en: "en-US", ar: "ar" };

export default function Stats({ stats, mode, locale }) {
  const { t } = useTranslation();
  const tag = LOCALE_TAGS[locale] || "fr-FR";

  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: "short" }).replace(".", ""),
        count: stats.daily[d.toDateString()] || 0,
      });
    }
    return days;
  }, [stats.daily]);

  return (
    <div key="stats" className="rise">
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px" }}>{t("stats.title")}</h2>
      <div className="mb-3 flex gap-2">
        {[
          [stats.streak, t("stats.streak")],
          [stats.total, t("stats.confirmed")],
          [mode === "voyage" ? stats.passesLeft : "—", t("stats.passes")],
        ].map(([n, l]) => (
          <div key={l} className="card text-center" style={{ flex: 1, padding: "15px 6px" }}>
            <div className="mono" style={{ fontSize: 23, fontWeight: 700, color: "var(--em)" }}>
              {n}
            </div>
            <div style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--mut)", marginTop: 2 }}>
              {l}
            </div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: "15px 8px 5px" }}>
        <div className="lbl mb-2 block" style={{ paddingInlineStart: 8 }}>
          {t("stats.last7")}
        </div>
        <ResponsiveContainer width="100%" height={165}>
          <BarChart data={last7} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--line2)" />
            <XAxis dataKey="label" tick={{ fill: "var(--mut)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "var(--mut)", fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
            <Tooltip
              contentStyle={{ background: "var(--card2)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 12 }}
              labelStyle={{ color: "var(--txt)" }}
              cursor={{ fill: "rgba(128,128,128,0.08)" }}
            />
            <Bar dataKey="count" name={t("stats.prayers")} fill="var(--em)" radius={[6, 6, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {(stats.history || []).length > 0 && (
        <div className="card mt-3" style={{ padding: "14px 14px 6px" }}>
          <div className="lbl mb-2 block">{t("stats.history")}</div>
          {(stats.history || []).slice(0, 8).map((h, i) => (
            <div
              key={h.ts + "-" + i}
              className="flex items-center justify-between"
              style={{ padding: "7px 0", borderBottom: i < Math.min(stats.history.length, 8) - 1 ? "1px solid var(--line2)" : "none" }}
            >
              <span className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600 }}>
                <CheckCircle2 size={14} color="var(--em)" />
                {h.prayer ? t(`prayers.${h.prayer}`) : t("stats.prayers")}
              </span>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--mut)" }}>
                {new Date(h.ts).toLocaleDateString(tag, { weekday: "short", day: "numeric", month: "short" })}{" "}
                {new Date(h.ts).toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="card mt-3" style={{ padding: 14, fontSize: 12.5, color: "var(--mut)", lineHeight: 1.55 }}>
        {t("stats.footer")}
      </div>
    </div>
  );
}
