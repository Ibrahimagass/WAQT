const toRad = (d) => (d * Math.PI) / 180;
const toDeg = (r) => (r * 180) / Math.PI;

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

export function qiblaBearing(lat, lon) {
  const p1 = toRad(lat);
  const p2 = toRad(KAABA_LAT);
  const dL = toRad(KAABA_LON - lon);
  return (
    (toDeg(Math.atan2(Math.sin(dL), Math.cos(p1) * Math.tan(p2) - Math.sin(p1) * Math.cos(dL))) + 360) % 360
  );
}

// Shortest signed angular distance from `a` to `b`, both in degrees [0,360).
export function angleDiff(a, b) {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}
