// OpenRouter provider implementation.
// Contract: generateJSON({prompt, webSearch, maxTokens}) -> parsed object | null
//           verifyImage({prompt, imageBase64, maxTokens}) -> parsed object | null
const API_BASE = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

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
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured");
  return key;
}

async function callOpenRouter(body, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
        "HTTP-Referer": "https://waqt-nu.vercel.app",
        "X-Title": "Waqt",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`OpenRouter request failed (${res.status}): ${detail.slice(0, 300)}`);
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error(`OpenRouter request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function generateJSON({ prompt, webSearch = false, maxTokens = 1000 }) {
  const body = {
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant. Reply only with strict JSON matching the user's schema."
      },
      { role: "user", content: prompt },
    ],
    max_tokens: maxTokens,
    temperature: 0,
  };
  if (webSearch) {
    body.models = [MODEL];
  }
  const text = await callOpenRouter(body);
  return extractJSON(text);
}

async function verifyImage({ prompt, imageBase64, maxTokens = 300 }) {
  const body = {
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant. Reply only with strict JSON matching the user's schema."
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      },
    ],
    max_tokens: maxTokens,
    temperature: 0,
  };
  const text = await callOpenRouter(body);
  return extractJSON(text);
}

export default { generateJSON, verifyImage };
