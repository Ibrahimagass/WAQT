import { getProvider } from "./_lib/providers/index.js";

// Single entry point for every AI request in the app. Keeps the API key
// server-side and lets us swap providers via the AI_PROVIDER env var.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { action, prompt, imageBase64, webSearch, maxTokens } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing prompt" });
    return;
  }
  if (action === "vision" && !imageBase64) {
    res.status(400).json({ error: "Missing imageBase64 for vision action" });
    return;
  }

  try {
    const provider = getProvider();
    const result =
      action === "vision"
        ? await provider.verifyImage({ prompt, imageBase64, maxTokens: maxTokens || 300 })
        : await provider.generateJSON({ prompt, webSearch: !!webSearch, maxTokens: maxTokens || 1000 });
    res.status(200).json({ result });
  } catch (err) {
    console.error("AI request error:", err);
    if (String(err?.message).includes("not configured")) {
      res.status(503).json({ error: "ai_not_configured" });
      return;
    }
    const status = String(err?.message).includes("timed out") ? 504 : 502;
    res.status(status).json({ error: "AI provider request failed", details: String(err?.message || "") });
  }
}
