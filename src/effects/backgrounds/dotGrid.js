/**
 * Kinetic — dotGrid
 * An evenly-spaced dot grid drawn on canvas where each dot's scale/opacity
 * responds to proximity to the cursor — a subtle "field reacting to you"
 * background, cheaper than particleField since dots don't move, only pulse.
 *
 * Usage:
 *   <canvas class="kx-dot-grid"></canvas>
 *   import { initDotGrid } from 'kinetic/effects/backgrounds/dotGrid.js';
 *   const destroy = initDotGrid('.kx-dot-grid', { gap: 34, radius: 1.4, influence: 140 });
 */
import { onTick } from '../../core/raf.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initDotGrid(selectorOrCanvas = '.kx-dot-grid', { gap = 34, radius = 1.4, influence = 140, maxScale = 2.4, color = '255,255,255' } = {}) {
  const canvas = typeof selectorOrCanvas === 'string' ? document.querySelector(selectorOrCanvas) : selectorOrCanvas;
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  const reduce = prefersReducedMotion();

  let w = 0, h = 0, dpr = 1, dots = [];
  function build() {
    // Re-read devicePixelRatio here (not once at init) so moving the window
    // to a display with a different DPR is picked up on the next resize.
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) dots.push({ x, y });
  }
  build();
  const ro = new ResizeObserver(build);
  ro.observe(canvas);

  let pointer = { x: -9999, y: -9999 };
  const onMove = e => { const box = canvas.getBoundingClientRect(); pointer = { x: e.clientX - box.left, y: e.clientY - box.top }; };
  const onLeave = () => { pointer = { x: -9999, y: -9999 }; };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  function paint() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = `rgba(${color},1)`;
    for (const d of dots) {
      const dist = Math.hypot(d.x - pointer.x, d.y - pointer.y);
      const t = Math.max(0, 1 - dist / influence);
      const s = 1 + t * (maxScale - 1);
      ctx.globalAlpha = 0.25 + t * 0.75;
      ctx.beginPath();
      ctx.arc(d.x, d.y, radius * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (reduce) { paint(); return () => ro.disconnect(); }
  const offTick = onTick(paint);
  return () => { offTick(); ro.disconnect(); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave); };
}
