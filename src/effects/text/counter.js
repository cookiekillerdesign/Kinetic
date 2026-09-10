/**
 * Kinetic — counter
 * Animates a number counting up from 0 (or a start value) when it scrolls
 * into view, with an eased curve rather than a linear tick — reads as a
 * confident "arrival" instead of a slot-machine spin.
 *
 * Usage:
 *   <span class="kx-counter" data-to="248" data-suffix="+">0</span>
 *   import { initCounters } from 'kinetic/effects/text/counter.js';
 *   const destroy = initCounters('.kx-counter', { duration: 1400 });
 */
import { observeOnce } from '../../core/observer.js';
import { easeOutExpo } from '../../core/easing.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initCounters(selectorOrEls = '.kx-counter', { duration = 1400, easing = easeOutExpo } = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const reduce = prefersReducedMotion();
  const cleanups = [];

  els.forEach(el => {
    const to = parseFloat(el.dataset.to ?? el.textContent) || 0;
    const from = parseFloat(el.dataset.from ?? '0');
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const prefix = el.dataset.prefix ?? '';
    const suffix = el.dataset.suffix ?? '';

    const run = () => {
      if (reduce) { el.textContent = `${prefix}${to.toFixed(decimals)}${suffix}`; return; }
      const t0 = performance.now();
      const step = now => {
        const t = Math.min((now - t0) / duration, 1);
        const v = from + (to - from) * easing(t);
        el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const off = observeOnce(el, run, { threshold: 0.4 });
    cleanups.push(off);
  });

  return () => cleanups.forEach(fn => fn());
}
