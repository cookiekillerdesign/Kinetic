/**
 * Kinetic — auroraGradient
 * A CSS-only (no WebGL) animated aurora backdrop: several large, blurred,
 * radial-gradient blobs drifting via CSS keyframes with mix-blend-mode. The
 * lightweight sibling to gradientMesh.js when you don't need shader-level
 * organic motion and want something that costs nothing but paint.
 *
 * Markup:
 *   <div class="kx-aurora"><span></span><span></span><span></span></div>
 *   (styles + @keyframes in css/utilities.css)
 *
 * Usage:
 *   import { initAuroraGradient } from 'kinetic/effects/backgrounds/auroraGradient.js';
 *   const destroy = initAuroraGradient('.kx-aurora', { colors: ['#4f7cff','#ff5f7e','#2be3b0'] });
 */
export function initAuroraGradient(selectorOrEl = '.kx-aurora', { colors = ['#4f7cff', '#ff5f7e', '#2be3b0'] } = {}) {
  const root = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
  if (!root) return () => {};
  const blobs = [...root.children];
  blobs.forEach((blob, i) => { blob.style.setProperty('--kx-aurora-color', colors[i % colors.length]); });
  return () => {};
}
