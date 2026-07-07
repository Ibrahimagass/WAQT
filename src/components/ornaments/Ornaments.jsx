import { motion } from "framer-motion";

// Recreates the paper-cut Islamic 8-pointed star motif (gold / white /
// emerald layers) as pure SVG — scalable, theme-aware and animatable,
// instead of shipping raster images.

// Union outline of two squares rotated 45°: outer vertices at radius R every
// 45°, inner vertices at 22.5° offsets at R·cos(45°)/cos(22.5°) ≈ 0.7654·R.
function starPoints(cx, cy, R) {
  const pts = [];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    pts.push(`${(cx + R * Math.sin(a)).toFixed(2)},${(cy - R * Math.cos(a)).toFixed(2)}`);
    const b = a + Math.PI / 8;
    const r = R * 0.7654;
    pts.push(`${(cx + r * Math.sin(b)).toFixed(2)},${(cy - r * Math.cos(b)).toFixed(2)}`);
  }
  return pts.join(" ");
}

let gradSeq = 0;

export function Star8({ size = 120, className, style }) {
  // unique gradient ids so multiple stars can coexist in one document
  const uid = ++gradSeq;
  const goldId = `wq-gold-${uid}`;
  const emId = `wq-em-${uid}`;
  const whiteId = `wq-white-${uid}`;
  const c = 60;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={goldId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3E3B4" />
          <stop offset="45%" stopColor="#D9B45B" />
          <stop offset="100%" stopColor="#A9812F" />
        </linearGradient>
        <linearGradient id={whiteId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E6EDEA" />
        </linearGradient>
        <linearGradient id={emId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#12805C" />
          <stop offset="100%" stopColor="#0B5C42" />
        </linearGradient>
      </defs>
      <polygon points={starPoints(c, c, 58)} fill={`url(#${goldId})`} />
      <polygon points={starPoints(c, c, 54)} fill={`url(#${whiteId})`} />
      <polygon points={starPoints(c, c, 36)} fill={`url(#${goldId})`} />
      <polygon points={starPoints(c, c, 33)} fill={`url(#${emId})`} />
    </svg>
  );
}

// Floating cluster of stars, like the reference artwork: one large star,
// one medium below, one small between them. Purely decorative.
export function OrnamentCluster({ opacity = 0.5, scale = 1, style }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", pointerEvents: "none", opacity, ...style }}>
      <motion.div
        animate={{ y: [0, -7, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: 0, insetInlineEnd: 0 }}
      >
        <Star8 size={150 * scale} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 6, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        style={{ position: "absolute", top: 148 * scale, insetInlineEnd: 116 * scale }}
      >
        <Star8 size={54 * scale} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        style={{ position: "absolute", top: 172 * scale, insetInlineEnd: -14 * scale }}
      >
        <Star8 size={104 * scale} />
      </motion.div>
    </div>
  );
}

// Faint repeating geometric field behind the whole app.
export function PatternField({ opacity = 0.04 }) {
  return (
    <svg
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity }}
    >
      <defs>
        <pattern id="wq-star-field" width="96" height="96" patternUnits="userSpaceOnUse">
          <polygon points={starPoints(24, 24, 14)} fill="none" stroke="currentColor" strokeWidth="1" />
          <polygon points={starPoints(72, 72, 14)} fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="72" cy="24" r="2" fill="currentColor" />
          <circle cx="24" cy="72" r="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wq-star-field)" style={{ color: "var(--em)" }} />
    </svg>
  );
}

// Single half-clipped star for card corners (hero, alarm...).
export function CornerStar({ size = 130, opacity = 0.14, style }) {
  return (
    <motion.div
      aria-hidden="true"
      animate={{ rotate: [0, 6, 0] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "absolute", pointerEvents: "none", opacity, ...style }}
    >
      <Star8 size={size} />
    </motion.div>
  );
}
