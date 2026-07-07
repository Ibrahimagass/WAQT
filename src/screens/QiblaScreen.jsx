import { useTranslation } from "react-i18next";
import QiblaCompass from "../components/QiblaCompass";
import TasbihCounter from "../components/TasbihCounter";

export default function QiblaScreen({ loc, qiblaState, tasbih }) {
  const { t } = useTranslation();
  return (
    <div key="qibla" className="rise">
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>{t("qibla.title")}</h2>
      <QiblaCompass loc={loc} {...qiblaState} />

      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>{t("tasbih.title")}</h2>
      <TasbihCounter phase={tasbih.phase} count={tasbih.count} bump={tasbih.bump} onTap={tasbih.tap} onReset={tasbih.reset} />
    </div>
  );
}
