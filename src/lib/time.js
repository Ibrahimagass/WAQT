export function fmtHours(h) {
  if (h === null || h === undefined || Number.isNaN(h)) return { dec: null, label: "--:--" };
  let hv = ((h % 24) + 24) % 24;
  let hh = Math.floor(hv);
  let mm = Math.round((hv - hh) * 60);
  if (mm === 60) {
    mm = 0;
    hh = (hh + 1) % 24;
  }
  return { dec: hh + mm / 60, label: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}` };
}

export function parseHM(s) {
  if (typeof s !== "string") return null;
  const m = s.trim().match(/^(\d{1,2})[:hH](\d{2})$/);
  if (!m) return null;
  const hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  if (hh > 23 || mm > 59) return null;
  return hh + mm / 60;
}

export function weekKey(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const w1 = new Date(date.getFullYear(), 0, 4);
  return `${date.getFullYear()}-S${1 + Math.round(((date - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7)}`;
}
