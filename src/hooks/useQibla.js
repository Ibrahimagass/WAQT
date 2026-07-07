import { useCallback, useEffect, useMemo, useState } from "react";
import { qiblaBearing, angleDiff } from "../lib/qibla";

function needsIOSPermission() {
  return (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  );
}

// Bug fix: the prototype listened for deviceorientation events but never
// requested iOS's mandatory user-gesture permission, so the compass silently
// never worked on iPhone. `requestPermission()` here must be called from a
// click handler.
export function useQibla(loc, active) {
  const [heading, setHeading] = useState(null);
  const [permission, setPermission] = useState(needsIOSPermission() ? "prompt" : "granted");
  const [aligned, setAligned] = useState(false);

  const qibla = useMemo(() => (loc ? qiblaBearing(loc.lat, loc.lon) : null), [loc]);

  useEffect(() => {
    if (!active || permission !== "granted") return;
    const handler = (e) => {
      let h = null;
      if (typeof e.webkitCompassHeading === "number" && !Number.isNaN(e.webkitCompassHeading)) {
        h = e.webkitCompassHeading;
      } else if (typeof e.alpha === "number" && !Number.isNaN(e.alpha)) {
        h = 360 - e.alpha;
      }
      if (h !== null) setHeading(h);
    };
    window.addEventListener("deviceorientationabsolute", handler, true);
    window.addEventListener("deviceorientation", handler, true);
    return () => {
      window.removeEventListener("deviceorientationabsolute", handler, true);
      window.removeEventListener("deviceorientation", handler, true);
    };
  }, [active, permission]);

  useEffect(() => {
    if (qibla == null || heading == null) {
      setAligned(false);
      return;
    }
    const diff = Math.abs(angleDiff(heading, qibla));
    const isAligned = diff <= 3;
    setAligned((prev) => {
      if (isAligned && !prev && navigator.vibrate) navigator.vibrate(35);
      return isAligned;
    });
  }, [heading, qibla]);

  const requestPermission = useCallback(async () => {
    if (needsIOSPermission()) {
      try {
        const result = await DeviceOrientationEvent.requestPermission();
        setPermission(result === "granted" ? "granted" : "denied");
      } catch {
        setPermission("denied");
      }
    } else {
      setPermission("granted");
    }
  }, []);

  return { qibla, heading, aligned, permission, requestPermission };
}
