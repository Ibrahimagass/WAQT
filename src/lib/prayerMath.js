const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

function sunPosition(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const N = Math.floor((date - start) / 86400000);
  const g = ((2 * Math.PI) / 365) * (N - 1);
  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));
  const decl =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  return { eqTime, decl };
}

function hourAngle(latDeg, decl, angleDeg) {
  const latRad = toRad(latDeg);
  const cosH =
    (Math.cos(toRad(angleDeg)) - Math.sin(latRad) * Math.sin(decl)) /
    (Math.cos(latRad) * Math.cos(decl));
  if (cosH > 1 || cosH < -1) return null;
  return toDeg(Math.acos(cosH)) / 15;
}

export const METHODS = {
  MWL: { key: "MWL", fajr: 18, isha: 17, ishaFixed: null },
  ISNA: { key: "ISNA", fajr: 15, isha: 15, ishaFixed: null },
  EGYPT: { key: "EGYPT", fajr: 19.5, isha: 17.5, ishaFixed: null },
  MAKKAH: { key: "MAKKAH", fajr: 18.5, isha: null, ishaFixed: 90 },
  KARACHI: { key: "KARACHI", fajr: 18, isha: 18, ishaFixed: null },
};

// Known limitation: uses the device's current timezone offset regardless of
// the chosen location. Correctly resolving a timezone from lat/lon requires
// a tz-boundary database, which is out of scope for now (documented in plan).
export function computePrayerTimes(date, lat, lon, methodKey, asrMethod) {
  const method = METHODS[methodKey] || METHODS.MWL;
  const { eqTime, decl } = sunPosition(date);
  const tz = -date.getTimezoneOffset() / 60;
  const noon = 12 - lon / 15 - eqTime / 60 + tz;
  const haSunrise = hourAngle(lat, decl, 90.833);
  const haFajr = hourAngle(lat, decl, 90 + method.fajr);
  const haIsha = method.ishaFixed ? null : hourAngle(lat, decl, 90 + method.isha);
  const latRad = toRad(lat);
  const shadow = asrMethod === "HANAFI" ? 2 : 1;
  const asrAlt = Math.atan(1 / (shadow + Math.tan(Math.abs(latRad - decl))));
  const haAsr = hourAngle(lat, decl, 90 - toDeg(asrAlt));
  const sunset = haSunrise !== null ? noon + haSunrise : null;
  return {
    fajr: haFajr !== null ? noon - haFajr : null,
    dhuhr: noon + 2 / 60,
    asr: haAsr !== null ? noon + haAsr : null,
    maghrib: sunset,
    isha: method.ishaFixed ? sunset + method.ishaFixed / 60 : haIsha !== null ? noon + haIsha : null,
  };
}
