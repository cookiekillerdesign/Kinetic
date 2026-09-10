/**
 * Kinetic — math.js
 * Small numeric helpers shared by every effect engine.
 */

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a, b, t) => a + (b - a) * t;

/** Framerate-independent damping — interpolates toward `to` at a rate that
 *  stays visually consistent regardless of the actual frame delta. Use this
 *  instead of a fixed lerp factor for anything driven by rAF deltas. */
export const damp = (current, target, lambda, dt) => lerp(current, target, 1 - Math.exp(-lambda * dt));

export const map = (v, inMin, inMax, outMin, outMax) => {
  // A degenerate input range (inMin === inMax — a misconfigured startVh/endVh
  // pair, or innerHeight legitimately 0 in a hidden/headless context) divides
  // by zero below. The NaN that produces doesn't throw or warn anywhere —
  // it just silently flows into a `transform: translate(NaNpx, ...)` and the
  // element vanishes with zero console error, which is exactly the kind of
  // bug nobody can diagnose from a bug report. Treat a zero-width input
  // range as "already at the end of it" and resolve to outMax.
  if (inMax === inMin) return outMax;
  return outMin + ((clamp(v, Math.min(inMin, inMax), Math.max(inMin, inMax)) - inMin) / (inMax - inMin)) * (outMax - outMin);
};

export const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

export const round = (v, p = 0) => {
  const m = 10 ** p;
  return Math.round(v * m) / m;
};

/** Deterministic PRNG (mulberry32) — same seed always produces the same
 *  sequence, so generative visuals stay stable across re-renders/reloads. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h;
}
