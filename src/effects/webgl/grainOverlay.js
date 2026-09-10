/**
 * Kinetic — grainOverlay
 * A film-grain texture layered over the whole page (or a container) via a
 * tiny tiled CSS animation — no canvas/WebGL needed, this is the cheapest
 * possible version and matches the cookiekiller `.grain` layer exactly.
 * A canvas-based variant (`initAnimatedGrainCanvas`) is included for when
 * you want true per-frame random noise instead of a 4-position jitter.
 *
 * Usage (CSS version — recommended, near-zero cost):
 *   <div class="kx-grain" aria-hidden="true"></div>
 *   // styles are in css/utilities.css (.kx-grain + @keyframes kx-grain)
 *
 * Usage (canvas version — true noise, costs a bit more):
 *   <canvas class="kx-grain-canvas" aria-hidden="true"></canvas>
 *   import { initAnimatedGrainCanvas } from 'kinetic/effects/webgl/grainOverlay.js';
 *   const destroy = initAnimatedGrainCanvas('.kx-grain-canvas', { opacity: 0.05 });
 */
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initAnimatedGrainCanvas(selectorOrCanvas = '.kx-grain-canvas', { opacity = 0.05, tileSize = 128, fps = 12 } = {}) {
  const canvas = typeof selectorOrCanvas === 'string' ? document.querySelector(selectorOrCanvas) : selectorOrCanvas;
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  canvas.width = tileSize; canvas.height = tileSize;
  canvas.style.opacity = String(opacity);

  const reduce = prefersReducedMotion();
  const imageData = ctx.createImageData(tileSize, tileSize);

  function paint() {
    const buf = imageData.data;
    for (let i = 0; i < buf.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      buf[i] = buf[i + 1] = buf[i + 2] = v;
      buf[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }
  paint();
  if (reduce) return () => {};

  const interval = setInterval(paint, 1000 / fps);
  return () => clearInterval(interval);
}
