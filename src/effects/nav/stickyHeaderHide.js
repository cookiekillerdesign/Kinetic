/**
 * Kinetic — stickyHeaderHide
 * Hides the header on scroll-down, reveals it on scroll-up — the pattern
 * that keeps a sticky header out of the way while reading but instantly
 * available the moment the user wants to navigate. Debounced via the
 * shared rAF ticker rather than a raw scroll listener doing work per event.
 *
 * Usage:
 *   import { initStickyHeaderHide } from 'kinetic/effects/nav/stickyHeaderHide.js';
 *   const destroy = initStickyHeaderHide('.site-header', { threshold: 8, revealAtTop: 40 });
 */
import { onTick } from '../../core/raf.js';

export function initStickyHeaderHide(selectorOrEl = '.site-header', { threshold = 8, revealAtTop = 40 } = {}) {
  const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
  if (!el) return () => {};

  let lastY = window.scrollY;
  const offTick = onTick(() => {
    const y = window.scrollY;
    const dy = y - lastY;
    if (y <= revealAtTop) { el.classList.remove('kx-header-hidden'); }
    else if (dy > threshold) { el.classList.add('kx-header-hidden'); }
    else if (dy < -threshold) { el.classList.remove('kx-header-hidden'); }
    lastY = y;
  });

  return offTick;
}
