/**
 * Kinetic — noiseBackground
 * A slow-drifting simplex-noise field rendered to canvas as soft monochrome
 * clouds — an ambient, organic backdrop (distinct from grainOverlay's fine
 * static texture and gradientMesh's saturated color blobs).
 *
 * Usage:
 *   <canvas class="kx-noise-bg"></canvas>
 *   import { initNoiseBackground } from 'kinetic/effects/backgrounds/noiseBackground.js';
 *   const destroy = initNoiseBackground('.kx-noise-bg', { scale: 0.006, speed: 0.00015 });
 */
import { makeNoise2D } from '../../core/noise.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initNoiseBackground(selectorOrCanvas = '.kx-noise-bg', { scale = 0.006, speed = 0.00015, resolution = 3, color = '255,255,255' } = {}) {
  const canvas = typeof selectorOrCanvas === 'string' ? document.querySelector(selectorOrCanvas) : selectorOrCanvas;
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  const reduce = prefersReducedMotion();
  const noise = makeNoise2D(7);

  let w = 0, h = 0, cw = 0, ch = 0;
  function build() {
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    cw = Math.ceil(w / resolution); ch = Math.ceil(h / resolution);
    canvas.width = cw; canvas.height = ch;
    canvas.style.imageRendering = 'pixelated'; // upscale the low-res buffer via CSS width/height
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
  }
  build();
  const ro = new ResizeObserver(build);
  ro.observe(canvas);

  const img = () => ctx.createImageData(cw, ch);
  function paint(t) {
    const id = img();
    const [r, g, b] = color.split(',').map(Number);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const n = (noise(x * scale, y * scale + t) + 1) / 2;
        const i = (y * cw + x) * 4;
        id.data[i] = r; id.data[i + 1] = g; id.data[i + 2] = b;
        id.data[i + 3] = Math.round(n * 60); // low alpha — ambient, not a solid pattern
      }
    }
    ctx.putImageData(id, 0, 0);
  }
  paint(0);
  if (reduce) return () => ro.disconnect();

  let raf;
  function loop(now) { paint(now * speed); raf = requestAnimationFrame(loop); }
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); ro.disconnect(); };
}
