/**
 * Kinetic — infiniteMarqueeGrid
 * Multiple rows of a logo/skill/tag grid, each scrolling infinitely, with
 * alternating directions per row for the "wall of content" effect. Built on
 * the same duplicate-and-translate technique as marquee.js, applied to N
 * rows at once with a shared rAF tick instead of one interval per row.
 *
 * Markup:
 *   <div class="kx-marquee-grid">
 *     <div class="kx-marquee-row"><div class="kx-marquee-track">Logo Logo Logo </div></div>
 *     <div class="kx-marquee-row"><div class="kx-marquee-track">Logo Logo Logo </div></div>
 *   </div>
 *
 * Usage:
 *   import { initInfiniteMarqueeGrid } from 'kinetic/effects/grid/infiniteMarqueeGrid.js';
 *   const destroy = initInfiniteMarqueeGrid('.kx-marquee-grid', { speed: 30, alternate: true });
 */
import { onTick } from '../../core/raf.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initInfiniteMarqueeGrid(selector = '.kx-marquee-grid', { speed = 30, alternate = true, rowSelector = '.kx-marquee-row' } = {}) {
  if (prefersReducedMotion()) return () => {};
  const grid = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!grid) return () => {};

  const rows = [...grid.querySelectorAll(rowSelector)].map((row, i) => {
    const track = row.querySelector('.kx-marquee-track') || row.firstElementChild;
    if (track && !track.dataset.kxDup) {
      track.dataset.kxDup = '1';
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      row.appendChild(clone);
      row.style.display = 'flex';
      row.style.overflow = 'hidden';
      track.style.flex = '0 0 auto'; track.style.whiteSpace = 'nowrap';
      clone.style.flex = '0 0 auto'; clone.style.whiteSpace = 'nowrap';
    }
    return { row, track, x: 0, dir: alternate && i % 2 ? 1 : -1 };
  });

  const offTick = onTick((_, dt) => {
    for (const r of rows) {
      if (!r.track) continue;
      const w = r.track.offsetWidth || 1;
      r.x += r.dir * speed * dt;
      if (Math.abs(r.x) >= w) r.x = r.x % w;
      r.row.style.transform = `translateX(${r.x}px)`;
    }
  });

  return offTick;
}
