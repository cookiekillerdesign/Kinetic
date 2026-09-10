/**
 * Kinetic — imageRevealMask
 * Reveals an image with an animated clip-path sweep when it scrolls into
 * view — the "curtain pulls back" hero/gallery image entrance. Pure CSS
 * transition on `clip-path`, triggered once via IntersectionObserver.
 *
 * Markup:
 *   <div class="kx-reveal-mask"><img src="..."></div>
 * CSS (utilities.css):
 *   .kx-reveal-mask { clip-path: inset(0 0 100% 0); transition: clip-path 1.1s var(--kx-ease); }
 *   .kx-reveal-mask.in { clip-path: inset(0 0 0% 0); }
 *
 * Usage:
 *   import { initImageRevealMask } from 'kinetic/effects/transitions/imageRevealMask.js';
 *   const destroy = initImageRevealMask('.kx-reveal-mask');
 */
import { observeOnce } from '../../core/observer.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initImageRevealMask(selectorOrEls = '.kx-reveal-mask', { threshold = 0.2, direction = 'up' } = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const reduce = prefersReducedMotion();
  els.forEach(el => el.dataset.kxDirection = direction);
  if (reduce) { els.forEach(el => el.classList.add('in')); return () => {}; }
  const cleanups = els.map(el => observeOnce(el, () => el.classList.add('in'), { threshold }));
  return () => cleanups.forEach(fn => fn());
}
