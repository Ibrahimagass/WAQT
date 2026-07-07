// Frontend contract for the AI layer. The actual provider (Gemini, and
// later Anthropic/OpenAI) is selected server-side in /api/ai — this file
// never talks to a provider directly and never sees an API key.
async function callAi(body) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
    err.notConfigured = text.includes("ai_not_configured");
    throw err;
  }
  return res.json();
}

// Ask for a strict JSON object back. `prompt` should instruct the model to
// respond with JSON only. Returns the parsed object, or null if parsing failed.
export async function askJSON({ prompt, webSearch = false, maxTokens = 1000 }) {
  const data = await callAi({ action: "json", prompt, webSearch, maxTokens });
  return data.result ?? null;
}

// Ask the model to look at a photo (base64, no data: prefix) and return a
// strict JSON verdict. Used for the ablution/prayer-mat verification flow.
export async function verifyImage({ prompt, imageBase64, maxTokens = 300 }) {
  const data = await callAi({ action: "vision", prompt, imageBase64, maxTokens });
  return data.result ?? null;
}
