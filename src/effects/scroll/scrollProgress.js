/**
 * Kinetic — scrollProgress
 * Drives a --kx-progress CSS variable (0..1) on the target element from
 * page scroll position — wire it to a fixed top bar's `transform: scaleX()`,
 * a circular SVG stroke-dashoffset, or anything else purely in CSS.
 *
 * Usage:
 *   <div class="kx-progress-bar"></div>
 *   import { initScrollProgress } from 'kinetic/effects/scroll/scrollProgress.js';
 *   const destroy = initScrollProgress('.kx-progress-bar');
 * CSS:
 *   .kx-progress-bar { transform: scaleX(var(--kx-progress, 0)); transform-origin: left; }
 */
import { onTick } from '../../core/raf.js';

export function initScrollProgress(selectorOrEl = '.kx-progress-bar', { target = null } = {}) {
  const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
  if (!el) return () => {};

  const offTick = onTick(() => {
    let progress;
    if (target) {
      const box = target.getBoundingClientRect();
      const total = box.height - innerHeight;
      progress = total > 0 ? Math.min(1, Math.max(0, -box.top / total)) : 0;
    } else {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      progress = total > 0 ? doc.scrollTop / total : 0;
    }
    el.style.setProperty('--kx-progress', progress.toFixed(4));
  });

  return offTick;
}
