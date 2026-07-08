import gemini from "./gemini.js";
import openrouter from "./openrouter.js";

// Adding a provider = adding one file here that exports
// { generateJSON, verifyImage } and registering it below.
// No frontend code needs to change when swapping providers.
const providers = { gemini, openrouter };

export function getProvider() {
  const name = process.env.AI_PROVIDER || "gemini";
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown AI_PROVIDER: "${name}"`);
  return provider;
}
