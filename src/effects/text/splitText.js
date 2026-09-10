/**
 * Kinetic — splitText
 * Splits text into per-character (or per-word) spans that rise into place
 * with a staggered delay — the hero-title reveal used across the whole
 * cookiekiller site. Purely CSS-driven (transition-delay per span), so the
 * actual animation is defined in utilities.css (.kx-split .ch) and can be
 * restyled without touching this file.
 *
 * Usage:
 *   import { initSplitText } from 'kinetic/effects/text/splitText.js';
 *   const destroy = initSplitText('.hero-title', { by: 'chars', step: 0.026 });
 */
import { observeOnce } from '../../core/observer.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initSplitText(selectorOrEls = '.kx-split', {
  by = 'chars',        // 'chars' | 'words'
  baseDelay = 0.05,
  step = 0.026,
  triggerOnScroll = true,
  threshold = 0.2
} = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const reduce = prefersReducedMotion();
  const cleanups = [];

  els.forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    el.classList.add('kx-split');
    let idx = 0;
    const units = by === 'words' ? text.split(/(\s+)/) : [...text];
    units.forEach(u => {
      const isSpace = /^\s+$/.test(u);
      const span = document.createElement('span');
      span.className = isSpace ? 'sp' : 'ch';
      span.textContent = u;
      if (!isSpace) span.style.transitionDelay = reduce ? '0s' : (baseDelay + (idx++) * step).toFixed(3) + 's';
      el.appendChild(span);
    });

    const reveal = () => el.classList.add('in');
    if (reduce || !triggerOnScroll) { reveal(); return; }
    const off = observeOnce(el, reveal, { threshold, rootMargin: '0px 0px -40px 0px' });
    cleanups.push(off);
  });

  return () => cleanups.forEach(fn => fn());
}
