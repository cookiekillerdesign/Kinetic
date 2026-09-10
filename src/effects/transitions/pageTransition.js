/**
 * Kinetic — pageTransition
 * A router-agnostic SPA page-transition helper: wraps a navigation action
 * in an out/in animation on a fixed overlay (or a wrapper element), so you
 * get a proper "wipe/fade between routes" instead of an instant swap.
 * Works with React Router, plain history API, or anything else — you call
 * `runTransition(navigateFn)` at the moment you'd otherwise navigate.
 *
 * Usage:
 *   <div class="kx-transition-overlay" aria-hidden="true"></div>
 *   import { initPageTransition } from 'kinetic/effects/transitions/pageTransition.js';
 *   const { runTransition, destroy } = initPageTransition({ duration: 600 });
 *   link.addEventListener('click', e => {
 *     e.preventDefault();
 *     runTransition(() => navigate(e.currentTarget.href));
 *   });
 */
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initPageTransition({
  overlaySelector = '.kx-transition-overlay',
  duration = 600,
  midPoint = 0.5 // fraction of duration at which the actual navigation fires (overlay fully covers by then)
} = {}) {
  const overlay = document.querySelector(overlaySelector);
  const reduce = prefersReducedMotion();

  // Tracks the pending timers/raf of the currently in-flight transition (if
  // any), so a second runTransition() call fired before the first finishes
  // (a user double-clicking a nav link) — or destroy() itself — can cancel
  // it cleanly instead of leaving orphaned timers to fire later and race
  // with the newer transition's class toggles. Previously `destroy` was a
  // literal no-op despite the module scheduling multiple nested timers.
  let pending = null;

  function cancelPending() {
    if (!pending) return;
    clearTimeout(pending.t1);
    clearTimeout(pending.t2);
    cancelAnimationFrame(pending.raf);
    pending.resolve();
    pending = null;
  }

  function runTransition(navigate) {
    if (reduce || !overlay) { navigate(); return Promise.resolve(); }
    cancelPending();
    return new Promise(resolve => {
      const state = { t1: 0, t2: 0, raf: 0, resolve };
      pending = state;
      overlay.classList.add('is-covering');
      state.t1 = setTimeout(() => {
        navigate();
        overlay.classList.add('is-covered');
        state.raf = requestAnimationFrame(() => {
          overlay.classList.remove('is-covering');
          overlay.classList.remove('is-covered');
          overlay.classList.add('is-revealing');
          state.t2 = setTimeout(() => {
            overlay.classList.remove('is-revealing');
            if (pending === state) pending = null;
            resolve();
          }, duration * (1 - midPoint));
        });
      }, duration * midPoint);
    });
  }

  return {
    runTransition,
    destroy: () => {
      cancelPending();
      if (overlay) overlay.classList.remove('is-covering', 'is-covered', 'is-revealing');
    }
  };
}
