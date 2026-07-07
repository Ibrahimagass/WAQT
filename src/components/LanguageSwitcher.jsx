const LANGUAGES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export default function LanguageSwitcher({ locale, onChange }) {
  return (
    <div className="flex gap-2">
      {LANGUAGES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className="press flex-1"
          style={{
            padding: "10px 6px",
            borderRadius: 12,
            fontSize: 12.5,
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: 600,
            background: locale === value ? "rgba(52,211,153,0.1)" : "var(--card2)",
            border: `1px solid ${locale === value ? "var(--em)" : "var(--line2)"}`,
            color: locale === value ? "var(--em)" : "var(--txt)",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
