/**
 * Kinetic — staggerIn
 * Animates the children of a grid/list container in with an incremental
 * delay per item, triggered once the container scrolls into view. Delay is
 * set as a CSS custom property per child so the actual motion (opacity,
 * translateY/scale) stays defined in CSS and easy to restyle.
 *
 * Usage:
 *   <div class="kx-stagger"><div class="item">...</div>...</div>
 *   import { initStaggerIn } from 'kinetic/effects/grid/staggerIn.js';
 *   const destroy = initStaggerIn('.kx-stagger', { step: 60, childSelector: '.item' });
 */
import { observeOnce } from '../../core/observer.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initStaggerIn(selectorOrEls = '.kx-stagger', { step = 60, childSelector = ':scope > *', threshold = 0.15 } = {}) {
  const roots = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const reduce = prefersReducedMotion();

  const cleanups = roots.map(root => {
    const children = [...root.querySelectorAll(childSelector)];
    children.forEach((child, i) => {
      child.classList.add('kx-stagger-item');
      child.style.setProperty('--kx-stagger-delay', reduce ? '0ms' : `${i * step}ms`);
    });
    const reveal = () => root.classList.add('in');
    if (reduce) { reveal(); return () => {}; }
    return observeOnce(root, reveal, { threshold });
  });

  return () => cleanups.forEach(fn => fn());
}
