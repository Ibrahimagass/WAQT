// Proxies Nominatim (OpenStreetMap) so the client never has to deal with
// CORS or the mandatory User-Agent header, and so requests can be rate
// limited/cached server-side later if needed.
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
// Nominatim's usage policy requires a real identifying User-Agent — update
// the contact before going to production traffic.
const USER_AGENT = "WaqtApp/1.0 (contact: set-a-real-contact-before-launch)";

function shortLabel(place) {
  const a = place.address || {};
  const parts = [
    a.suburb || a.neighbourhood || a.city_district || a.quarter,
    a.city || a.town || a.village || a.municipality || a.county,
  ].filter(Boolean);
  if (parts.length) return parts.join(", ");
  if (place.display_name) return place.display_name.split(",").slice(0, 2).join(",").trim();
  return place.name || "Position";
}

async function fetchNominatim(path, lang) {
  const res = await fetch(`${NOMINATIM_BASE}${path}`, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": lang || "fr" },
  });
  if (!res.ok) throw new Error(`Nominatim request failed (${res.status})`);
  return res.json();
}

export default async function handler(req, res) {
  const { mode, q, lat, lon, lang } = req.query;

  try {
    if (mode === "search") {
      if (!q) {
        res.status(400).json({ ok: false, reason: "Missing query" });
        return;
      }
      const results = await fetchNominatim(
        `/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(q)}`,
        lang
      );
      if (!Array.isArray(results) || results.length === 0) {
        res.status(200).json({ ok: false, reason: "Lieu introuvable." });
        return;
      }
      const top = results[0];
      res.status(200).json({ ok: true, label: shortLabel(top), lat: parseFloat(top.lat), lon: parseFloat(top.lon) });
      return;
    }

    if (mode === "reverse") {
      if (!lat || !lon) {
        res.status(400).json({ ok: false, reason: "Missing coordinates" });
        return;
      }
      const place = await fetchNominatim(`/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, lang);
      res.status(200).json({ ok: true, label: shortLabel(place) });
      return;
    }

    res.status(400).json({ ok: false, reason: "Invalid mode" });
  } catch (err) {
    console.error("Geocode error:", err);
    res.status(502).json({ ok: false, reason: "Service de localisation indisponible pour le moment." });
  }
}
