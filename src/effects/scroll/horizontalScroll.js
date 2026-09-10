/**
 * Kinetic — horizontalScroll
 * Converts vertical scroll through a pinned section into horizontal motion
 * of its track — the "gallery that scrolls sideways as you scroll down"
 * pattern. Built on pinSection's progress callback, so it inherits the same
 * sticky-based pinning (no scroll-jank).
 *
 * Markup:
 *   <section class="kx-hscroll-outer" style="height: 300vh;">
 *     <div class="kx-hscroll-inner" style="position:sticky; top:0; height:100vh; overflow:hidden;">
 *       <div class="kx-hscroll-track" style="display:flex; will-change:transform;">
 *         <div class="panel">...</div><div class="panel">...</div>...
 *       </div>
 *     </div>
 *   </section>
 *
 * Usage:
 *   import { initHorizontalScroll } from 'kinetic/effects/scroll/horizontalScroll.js';
 *   const destroy = initHorizontalScroll('.kx-hscroll-outer');
 */
import { initPinSection } from './pinSection.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initHorizontalScroll(selectorOrEls = '.kx-hscroll-outer', { trackSelector = '.kx-hscroll-track' } = {}) {
  if (prefersReducedMotion()) return () => {};
  const outers = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];

  return initPinSection(outers, {
    onProgress: (p, outer) => {
      const track = outer.querySelector(trackSelector);
      if (!track) return;
      const max = track.scrollWidth - track.parentElement.clientWidth;
      track.style.transform = `translate3d(${-p * max}px,0,0)`;
    }
  });
}
