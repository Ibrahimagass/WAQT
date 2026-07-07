import { useCallback, useState } from "react";
import { useSettingsStore } from "../store/useSettingsStore";

// Local notifications while the app (or its tab/PWA window) is alive.
// True background push needs a push server — out of scope for now; on
// Capacitor this hook is the single place to swap in LocalNotifications.
export function useNotifications() {
  const enabled = useSettingsStore((s) => s.notifEnabled);
  const setEnabled = useSettingsStore((s) => s.setNotifEnabled);
  const supported = typeof window !== "undefined" && "Notification" in window;
  const [permission, setPermission] = useState(supported ? Notification.permission : "unsupported");

  const enable = useCallback(async () => {
    if (!supported) return false;
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    setPermission(perm);
    const ok = perm === "granted";
    setEnabled(ok);
    return ok;
  }, [supported, setEnabled]);

  const disable = useCallback(() => setEnabled(false), [setEnabled]);

  const notify = useCallback(
    (title, body) => {
      if (!supported || !enabled || Notification.permission !== "granted") return;
      try {
        new Notification(title, { body, icon: "/icons/icon.svg", silent: false });
      } catch {
        // some platforms (Android Chrome) require SW-based notifications; ignore
      }
    },
    [supported, enabled]
  );

  return { supported, permission, enabled, enable, disable, notify };
}
