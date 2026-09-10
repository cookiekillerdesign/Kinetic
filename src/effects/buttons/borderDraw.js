/**
 * Kinetic — borderDraw
 * An SVG-outlined button whose border "draws itself" on hover via
 * stroke-dashoffset animation, instead of a plain background-color swap —
 * reads as the outline being traced in real time.
 *
 * Markup (rect stroke wraps the button; adjust rx for rounded corners):
 *   <button class="kx-draw-btn">
 *     <svg class="kx-draw-svg"><rect class="kx-draw-rect" rx="8"/></svg>
 *     <span>Explore work</span>
 *   </button>
 *
 * Usage:
 *   import { initBorderDraw } from 'kinetic/effects/buttons/borderDraw.js';
 *   const destroy = initBorderDraw('.kx-draw-btn');
 */
export function initBorderDraw(selectorOrEls = '.kx-draw-btn', { rectSelector = '.kx-draw-rect', svgSelector = '.kx-draw-svg' } = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];

  function sizeRect(el) {
    const rect = el.querySelector(rectSelector);
    const svg = el.querySelector(svgSelector);
    if (!rect || !svg) return;
    const w = el.offsetWidth, h = el.offsetHeight;
    svg.setAttribute('width', w); svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const rw = Math.max(0, w - 2), rh = Math.max(0, h - 2);
    rect.setAttribute('x', 1); rect.setAttribute('y', 1);
    rect.setAttribute('width', rw);
    rect.setAttribute('height', rh);
    // Account for rounded corners (`rx`, set by the consumer — see the
    // markup example above) when computing the traced path length. A flat
    // 2*(w+h) perimeter is only correct for square corners; a rounded
    // rect's four corners are arcs, not right angles, so that formula
    // overshoots the real outline length — noticeably so on buttons with a
    // generous border-radius — making the "draw" animation visibly overrun
    // past the actual corner before doubling back.
    const rx = Math.min(parseFloat(rect.getAttribute('rx')) || 0, rw / 2, rh / 2);
    const len = 2 * (rw + rh) - (8 - 2 * Math.PI) * rx;
    rect.style.strokeDasharray = String(len);
    rect.style.strokeDashoffset = String(len);
  }

  els.forEach(sizeRect);
  const ro = new ResizeObserver(entries => entries.forEach(e => sizeRect(e.target)));
  els.forEach(el => ro.observe(el));

  return () => ro.disconnect();
}
