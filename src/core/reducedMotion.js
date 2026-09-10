/**
 * Kinetic — reducedMotion.js
 * Every effect engine in this library checks this before doing anything
 * expressive. Ship motion that respects the OS setting by default, not as
 * an afterthought bolted on per-component.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia(QUERY).matches;
}

/** Subscribes to changes (user can flip this OS setting live). Returns an
 *  unsubscribe function. Fires immediately with the current value too. */
export function onReducedMotionChange(cb) {
  if (typeof matchMedia !== 'function') { cb(false); return () => {}; }
  const mq = matchMedia(QUERY);
  cb(mq.matches);
  const handler = e => cb(e.matches);
  mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
  return () => (mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler));
}

export function isFinePointer() {
  return typeof matchMedia === 'function' && matchMedia('(hover:hover) and (pointer:fine)').matches;
}

export function isTouchDevice() {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}
