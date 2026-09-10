/**
 * Kinetic — pointer.js
 * One shared pointer/mouse position tracker. Every effect that wants the
 * cursor position (magnetics, spotlight hovers, particle fields, custom
 * cursor) reads from this instead of attaching its own `mousemove` listener
 * to `window` — with 10+ effects on a page that's 10 listeners collapsed to 1.
 */

// Guarded so importing this module in SSR/Node (no `window`) doesn't throw —
// only `install()` (called lazily from onPointerMove/getPointer) touches the DOM.
// Reads via `window.innerWidth` (not the bare global) so this also works
// correctly in embedding contexts where `window` exists as an object but
// isn't literally the global scope (e.g. some non-browser DOM shims).
const hasWindow = typeof window !== 'undefined';
const state = {
  x: hasWindow ? window.innerWidth / 2 : 0, y: hasWindow ? window.innerHeight / 2 : 0,
  nx: 0.5, ny: 0.5, vx: 0, vy: 0, active: false
};
const subscribers = new Set();
let lastT = 0;
let installed = false;

function install() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const onMove = e => {
    const t = performance.now();
    const dt = lastT ? (t - lastT) / 1000 : 0.016;
    lastT = t;
    const nx = e.clientX, ny = e.clientY;
    state.vx = dt > 0 ? (nx - state.x) / dt : 0;
    state.vy = dt > 0 ? (ny - state.y) / dt : 0;
    state.x = nx; state.y = ny;
    state.nx = nx / innerWidth; state.ny = ny / innerHeight;
    state.active = true;
    for (const fn of subscribers) fn(state);
  };
  const onLeave = () => { state.active = false; };
  addEventListener('mousemove', onMove, { passive: true });
  addEventListener('mouseleave', onLeave, { passive: true });
}

/** Subscribe to every pointer move: fn(state). Returns an unsubscribe fn. */
export function onPointerMove(fn) {
  install();
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** Read the current pointer state synchronously (no subscription). */
export function getPointer() {
  install();
  return state;
}
