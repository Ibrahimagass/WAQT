export const FALLBACK_CITIES = [
  { name: "Alfortville", lat: 48.7946, lon: 2.4139 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Marseille", lat: 43.2965, lon: 5.3698 },
  { name: "Lyon", lat: 45.764, lon: 4.8357 },
  { name: "Bruxelles", lat: 50.8503, lon: 4.3517 },
  { name: "Dakar", lat: 14.7167, lon: -17.4677 },
  { name: "Bamako", lat: 12.6392, lon: -8.0029 },
  { name: "Casablanca", lat: 33.5731, lon: -7.5898 },
];

export const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export const PERIOD_BY_PRAYER = {
  fajr: "dawn",
  dhuhr: "midday",
  asr: "afternoon",
  maghrib: "sunset",
  isha: "night",
};

export const HERO_GRADIENTS = {
  dark: {
    dawn: "linear-gradient(135deg,#12332C 0%,#3E3550 55%,#5A3D57 100%)",
    midday: "linear-gradient(135deg,#0C3B2A 0%,#14805A 60%,#1FA976 100%)",
    afternoon: "linear-gradient(135deg,#0F3A30 0%,#3D6B3B 60%,#8A6B2E 100%)",
    sunset: "linear-gradient(135deg,#14332E 0%,#4C3A50 55%,#8A4258 100%)",
    night: "linear-gradient(135deg,#0B2622 0%,#12343E 60%,#173A4F 100%)",
  },
  light: {
    dawn: "linear-gradient(135deg,#FFE8D6 0%,#F3D9E8 55%,#E7CDEE 100%)",
    midday: "linear-gradient(135deg,#D4F5E4 0%,#9FE8C4 60%,#6EDDA8 100%)",
    afternoon: "linear-gradient(135deg,#E9F5D6 0%,#D6EAB0 60%,#F0DA8E 100%)",
    sunset: "linear-gradient(135deg,#FFE3D6 0%,#F6D3E3 55%,#E4B9D6 100%)",
    night: "linear-gradient(135deg,#D9E6F2 0%,#C3D9EE 60%,#AFC9E8 100%)",
  },
};

export const TASBIH_PHASES = [
  { label: "subhanallah", target: 33 },
  { label: "alhamdulillah", target: 33 },
  { label: "allahuAkbar", target: 34 },
];
