/**
 * Kinetic — raf.js
 * A single shared requestAnimationFrame ticker that every effect engine
 * subscribes to, instead of each one calling its own rAF. This keeps dozens
 * of simultaneous effects (cursor + magnetics + parallax + shaders) on one
 * frame callback rather than N competing ones, and makes it trivial to
 * pause everything at once (tab hidden, reduced-motion toggled mid-session).
 */

const listeners = new Set();
let rafId = null;
let last = 0;

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 0.05) : 0; // clamp dt so a tab-switch stall doesn't jump-cut an animation
  last = now;
  for (const fn of listeners) fn(now, dt);
  rafId = listeners.size ? requestAnimationFrame(tick) : null;
}

/** Subscribe fn(now, dt) to the shared ticker. Returns an unsubscribe fn. */
export function onTick(fn) {
  listeners.add(fn);
  if (rafId == null) { last = 0; rafId = requestAnimationFrame(tick); }
  return () => {
    listeners.delete(fn);
    if (!listeners.size && rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    // Reset `last` on return so the first frame back doesn't report a huge dt.
    if (document.visibilityState === 'visible') last = 0;
  });
}
