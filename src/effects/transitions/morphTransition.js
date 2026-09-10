/**
 * Kinetic — morphTransition
 * FLIP-based shared-element morph: animates an element from its old
 * bounding box to its new one whenever its layout position changes (a grid
 * item expanding into a detail view, a card moving to the top of a list).
 * "FLIP" = First, Last, Invert, Play — we snapshot the box before the DOM
 * change, let the browser lay out the new state, then animate the visual
 * delta back to zero so it reads as one continuous morph.
 *
 * Usage:
 *   import { flip } from 'kinetic/effects/transitions/morphTransition.js';
 *   const play = flip(cardEl);       // 1. snapshot BEFORE the layout change
 *   moveCardToNewPosition(cardEl);   // 2. make the DOM/layout change synchronously
 *   play();                          // 3. animate from old box to new box
 */
import { prefersReducedMotion } from '../../core/reducedMotion.js';
import { cssEasing } from '../../core/easing.js';

export function flip(el, { duration = 500, easing = cssEasing.inOutExpo || cssEasing.inOut, properties = ['transform'] } = {}) {
  const first = el.getBoundingClientRect();
  return function play() {
    const last = el.getBoundingClientRect();
    if (prefersReducedMotion()) return Promise.resolve();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = first.width / (last.width || 1);
    const sy = first.height / (last.height || 1);
    el.style.transformOrigin = 'top left';
    el.style.transform = `translate(${dx}px,${dy}px) scale(${sx},${sy})`;
    el.style.transition = 'none';
    // force a reflow so the browser commits the "from" transform before we animate it away
    el.getBoundingClientRect();
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        el.style.transition = properties.map(p => `${p} ${duration}ms ${easing}`).join(',');
        el.style.transform = '';
        // `transitionend` never fires when the "from" and "to" computed
        // values end up identical (e.g. a grid item that didn't actually
        // move), when `duration` is 0, or when `properties` is empty — any
        // of which would otherwise hang this promise and leak the listener
        // forever. A duration-based fallback guarantees `done` always runs.
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          el.style.transition = '';
          el.removeEventListener('transitionend', done);
          clearTimeout(fallback);
          resolve();
        };
        const fallback = setTimeout(done, duration + 60);
        el.addEventListener('transitionend', done);
      });
    });
  };
}
