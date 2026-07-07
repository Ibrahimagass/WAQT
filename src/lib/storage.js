// Thin wrapper around the persistence backend. Swap the implementation of
// these three functions to move to Capacitor `Preferences` (or any other
// native storage) later without touching call sites.
export async function storageGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private browsing quota, etc.) — fail silently
  }
}

export async function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
