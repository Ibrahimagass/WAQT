import { useTranslation } from "react-i18next";
import { Clock, CalendarDays, Share2 } from "lucide-react";
import HeroCard from "../components/HeroCard";
import PrayerCard from "../components/PrayerCard";
import { PRAYER_ORDER } from "../lib/constants";

export default function Home({
  times,
  nextInfo,
  currentKey,
  period,
  themeResolved,
  dateStrings,
  mosque,
  mode,
  passesLeft,
  weather,
  onTestReminder,
  onOpenCalendar,
  onShare,
}) {
  const { t } = useTranslation();
  return (
    <div key="home" className="rise">
      <HeroCard
        times={times}
        nextInfo={nextInfo}
        period={period}
        themeResolved={themeResolved}
        dateStrings={dateStrings}
        mosque={mosque}
        weather={weather}
      />
      <div className="mt-3 flex flex-col gap-2">
        {PRAYER_ORDER.map((key, i) => (
          <PrayerCard key={key} prayerKey={key} time={times[key]} isCurrent={key === currentKey} index={i} />
        ))}
      </div>
      {mode === "voyage" && (
        <div className="chip mt-3" style={{ background: "var(--card2)", color: "var(--mut)", border: "1px solid var(--line2)" }}>
          <Clock size={12} color="var(--em)" /> {t("home.travelMode", { count: passesLeft })}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <button onClick={onOpenCalendar} className="press btn-gh flex-1" style={{ fontSize: 13 }}>
          <CalendarDays size={15} /> {t("home.calendar")}
        </button>
        <button onClick={onShare} className="press btn-gh flex-1" style={{ fontSize: 13 }}>
          <Share2 size={15} /> {t("home.share")}
        </button>
      </div>
      <button onClick={onTestReminder} className="press btn-gh mt-2 w-full">
        {t("home.testReminder")}
      </button>
    </div>
  );
}
