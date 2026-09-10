/**
 * Kinetic — pinSection
 * Pins a section in place (position: sticky under the hood, not JS-driven
 * positioning — cheaper and scroll-jank-free) for the duration of a taller
 * scroll container, and reports progress (0..1) via a callback so you can
 * drive internal animation (a horizontal rail, a step-through story, a
 * canvas scrub) as the user scrolls through the pinned duration.
 *
 * Markup:
 *   <section class="kx-pin-outer" style="height: 400vh;">
 *     <div class="kx-pin-inner" style="position:sticky; top:0; height:100vh;">...</div>
 *   </section>
 *
 * Usage:
 *   import { initPinSection } from 'kinetic/effects/scroll/pinSection.js';
 *   const destroy = initPinSection('.kx-pin-outer', {
 *     onProgress: p => { rail.style.transform = `translateX(${-p * 100}%)`; }
 *   });
 */
import { onTick } from '../../core/raf.js';
import { clamp, map } from '../../core/math.js';

export function initPinSection(selectorOrEls = '.kx-pin-outer', { onProgress = () => {} } = {}) {
  const outers = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  if (!outers.length) return () => {};

  const offTick = onTick(() => {
    for (const outer of outers) {
      const box = outer.getBoundingClientRect();
      const total = box.height - innerHeight;
      const p = total > 0 ? clamp(map(-box.top, 0, total, 0, 1)) : 0;
      onProgress(p, outer);
    }
  });

  return offTick;
}
