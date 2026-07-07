// Gemini implementation of the provider-agnostic AI interface.
// Contract: generateJSON({prompt, webSearch, maxTokens}) -> parsed object | null
//           verifyImage({prompt, imageBase64, maxTokens}) -> parsed object | null
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const REQUEST_TIMEOUT_MS = 15000;

function extractJSON(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return key;
}

async function callGemini(body, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": getApiKey() },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Gemini request failed (${res.status}): ${detail.slice(0, 300)}`);
    }
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    return parts.map((p) => p.text || "").join("");
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error(`Gemini request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function generateJSONOnce({ prompt, webSearch = false, maxTokens = 1000 }) {
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    // thinkingBudget 0: without it, 2.5-flash spends the output budget on
    // internal reasoning and can return an empty/truncated JSON payload.
    generationConfig: { maxOutputTokens: maxTokens, thinkingConfig: { thinkingBudget: 0 } },
  };
  if (webSearch) {
    body.tools = [{ google_search: {} }];
  } else {
    body.generationConfig.responseMimeType = "application/json";
  }
  const text = await callGemini(body);
  return extractJSON(text);
}

async function generateJSON({ prompt, webSearch = false, maxTokens = 1000 }) {
  const attempts = webSearch ? [true, false] : [false];
  let lastErr;
  for (const useWebSearch of attempts) {
    try {
      const result = await generateJSONOnce({ prompt, webSearch: useWebSearch, maxTokens });
      if (result) return result;
      lastErr = new Error("Gemini returned an empty response");
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

async function verifyImage({ prompt, imageBase64, maxTokens = 300 }) {
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ inlineData: { mimeType: "image/jpeg", data: imageBase64 } }, { text: prompt }],
      },
    ],
    generationConfig: {
      maxOutputTokens: maxTokens,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
    },
  };
  const text = await callGemini(body);
  return extractJSON(text);
}

export default { generateJSON, verifyImage };
