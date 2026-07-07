import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import LocationEditor from "../components/LocationEditor";
import { CornerStar } from "../components/ornaments/Ornaments";

export default function Onboarding({ onLocated }) {
  const { t } = useTranslation();
  return (
    <div className="rise card relative overflow-hidden" style={{ padding: 20 }}>
      <CornerStar size={120} opacity={0.09} style={{ top: -44, insetInlineEnd: -40 }} />
      <div className="mb-3 flex justify-center">
        <div className="pulse relative flex items-center justify-center" style={{ width: 60, height: 60, borderRadius: 9999 }}>
          <MapPin size={26} color="var(--em)" />
        </div>
      </div>
      <p className="mb-5 text-center" style={{ fontSize: 14, lineHeight: 1.55, color: "var(--mut)" }}>
        {t("onboarding.description")}
      </p>
      <LocationEditor fromSettings={false} onDone={onLocated} />
    </div>
  );
}
