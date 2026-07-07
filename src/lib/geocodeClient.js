// Real geocoding (Nominatim/OpenStreetMap) via a serverless proxy, replacing
// the prototype's fragile LLM-based "guess the coordinates" approach.
export async function searchAddress(query, lang = "fr") {
  const res = await fetch(`/api/geocode?mode=search&q=${encodeURIComponent(query)}&lang=${lang}`);
  if (!res.ok) throw new Error("geocode search failed");
  return res.json(); // { ok, label, lat, lon } | { ok:false, reason }
}

export async function reverseGeocode(lat, lon, lang = "fr") {
  const res = await fetch(`/api/geocode?mode=reverse&lat=${lat}&lon=${lon}&lang=${lang}`);
  if (!res.ok) throw new Error("geocode reverse failed");
  return res.json(); // { ok, label }
}
