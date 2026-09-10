/**
 * Kinetic — generativeArt
 * Deterministic, seeded pixel-block composition on canvas — same idea as
 * cookiekiller's per-project generative covers: a mulberry32 PRNG keyed by
 * a string seed means the same project/card always renders the exact same
 * artwork, with no layout shift between renders/reloads and no image asset
 * required at all.
 *
 * Usage:
 *   <canvas class="kx-gen-art" data-seed="project-14" data-hue="#4f7cff"></canvas>
 *   import { initGenerativeArt } from 'kinetic/effects/webgl/generativeArt.js';
 *   const destroy = initGenerativeArt('.kx-gen-art', { cols: 7, rows: 6, density: 0.62 });
 */
import { mulberry32, hashSeed } from '../../core/math.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

function shade(hex, amt = 0.35) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((n >> 16) & 255) + 255 * amt);
  const g = Math.min(255, ((n >> 8) & 255) + 255 * amt);
  const b = Math.min(255, (n & 255) + 255 * amt);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

export function initGenerativeArt(selectorOrEls = '.kx-gen-art', { cols = 7, rows = 6, density = 0.62, paperColor = 'rgba(241,240,236,.5)' } = {}) {
  const canvases = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const cleanups = canvases.map(canvas => initOne(canvas, cols, rows, density, paperColor));
  return () => cleanups.forEach(fn => fn());
}

function initOne(canvas, COLS, ROWS, density, paperColor) {
  const ctx = canvas.getContext('2d');
  const RM = prefersReducedMotion();
  const seed = canvas.dataset.seed || canvas.id || 'kinetic';
  const hue = canvas.dataset.hue || '#4f7cff';
  const seedValue = hashSeed(String(seed));
  const light = shade(hue);
  let w = 0, h = 0, cells = [], visible = true, intervalId = null;

  function build() {
    // Recreate the PRNG from the same seed on every call — `rand` must not
    // keep advancing across resizes, or the "same seed always renders the
    // same artwork" guarantee breaks the moment a ResizeObserver fires.
    const rand = mulberry32(seedValue);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    if (!w || !h) return;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cw = w / COLS, ch = h / ROWS;
    cells = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const roll = rand();
        if (roll < 1 - density) continue;
        const isPaper = roll > .93;
        const isLight = !isPaper && roll > .78;
        const big = !isPaper && rand() < .1 && c < COLS - 1 && r < ROWS - 1;
        cells.push({
          x: c * cw, y: r * ch, w: (big ? 2 : 1) * cw, h: (big ? 2 : 1) * ch,
          fill: isPaper ? paperColor : isLight ? light : hue,
          phase: rand() * Math.PI * 2
        });
      }
    }
  }
  function draw(t) {
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    for (const cell of cells) {
      ctx.globalAlpha = RM ? .85 : .68 + Math.sin(t / 2200 + cell.phase) * .17;
      ctx.fillStyle = cell.fill;
      ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
    }
    ctx.globalAlpha = 1;
  }

  build(); draw(0);
  const io = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { threshold: 0 });
  io.observe(canvas);
  if (!RM) intervalId = setInterval(() => { if (visible) draw(performance.now()); }, 100);
  const ro = new ResizeObserver(() => { build(); draw(performance.now()); });
  ro.observe(canvas);

  return () => { if (intervalId) clearInterval(intervalId); io.disconnect(); ro.disconnect(); };
}
