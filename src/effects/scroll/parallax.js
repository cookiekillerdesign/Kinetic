/**
 * Kinetic — parallax
 * Translates elements at a fraction of scroll speed (data-kx-speed, default
 * 0.3) for depth. Reads scroll position from one shared ticker rather than
 * a `scroll` listener per element, and only touches elements currently near
 * the viewport (cheap visibility check) to stay fast with many layers.
 *
 * Usage:
 *   <img data-kx-parallax data-kx-speed="0.4" src="...">
 *   import { initParallax } from 'kinetic/effects/scroll/parallax.js';
 *   const destroy = initParallax('[data-kx-parallax]');
 */
import { onTick } from '../../core/raf.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initParallax(selectorOrEls = '[data-kx-parallax]', { axis = 'y' } = {}) {
  if (prefersReducedMotion()) return () => {};
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const items = els.map(el => ({ el, speed: parseFloat(el.dataset.kxSpeed || '0.3') }));

  const offTick = onTick(() => {
    const vh = innerHeight;
    for (const { el, speed } of items) {
      const box = el.getBoundingClientRect();
      if (box.bottom < -200 || box.top > vh + 200) continue; // skip off-screen work
      const centerOffset = box.top + box.height / 2 - vh / 2;
      const shift = -centerOffset * speed;
      el.style.transform = axis === 'x' ? `translateX(${shift}px)` : `translateY(${shift}px)`;
    }
  });

  return offTick;
}
