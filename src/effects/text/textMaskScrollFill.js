/**
 * Kinetic — textMaskScrollFill
 * The "text fills with color as you scroll" effect: a dim base layer and a
 * bright overlay layer share the same text, and the overlay's clip-path
 * (or background-clip width) advances with scroll progress through the
 * element. Pure CSS custom property driven from one scroll listener.
 *
 * Markup:
 *   <p class="kx-fill-text" data-kx-fill>
 *     <span class="base">Design is how it works, not just how it looks.</span>
 *     <span class="fill" aria-hidden="true">Design is how it works, not just how it looks.</span>
 *   </p>
 * CSS (utilities.css):
 *   .kx-fill-text { position:relative; }
 *   .kx-fill-text .fill { position:absolute; inset:0; color:var(--kx-accent);
 *     clip-path: inset(0 calc(100% - var(--kx-fill,0%)) 0 0); }
 *
 * Usage:
 *   import { initTextMaskScrollFill } from 'kinetic/effects/text/textMaskScrollFill.js';
 *   const destroy = initTextMaskScrollFill('[data-kx-fill]');
 */
import { onTick } from '../../core/raf.js';
import { clamp, map } from '../../core/math.js';

export function initTextMaskScrollFill(selectorOrEls = '[data-kx-fill]', { start = 0.85, end = 0.35 } = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  if (!els.length) return () => {};

  const offTick = onTick(() => {
    const vh = innerHeight;
    for (const el of els) {
      const box = el.getBoundingClientRect();
      // progress: 0 when el.top is at `start`*vh, 1 when el.top is at `end`*vh
      const p = clamp(map(box.top, vh * start, vh * end, 0, 1));
      el.style.setProperty('--kx-fill', `${(p * 100).toFixed(1)}%`);
    }
  });

  return offTick;
}
