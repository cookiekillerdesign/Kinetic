/**
 * Kinetic — scrollReveal
 * The workhorse fade/rise-on-scroll effect: adds `.in` to any `.kx-reveal`
 * element once it crosses into the viewport, using ONE shared
 * IntersectionObserver for every element on the page (see core/observer.js).
 * Actual motion (opacity/transform) lives in CSS so it stays GPU-composited.
 *
 * Usage:
 *   import { initScrollReveal } from 'kinetic/effects/scroll/scrollReveal.js';
 *   const destroy = initScrollReveal(); // observes all .kx-reveal on the page
 */
import { observe } from '../../core/observer.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initScrollReveal(selector = '.kx-reveal:not(.in)', { threshold = 0.12, rootMargin = '0px 0px -40px 0px' } = {}) {
  const reduce = prefersReducedMotion();
  const els = [...document.querySelectorAll(selector)];
  if (reduce) { els.forEach(el => el.classList.add('in')); return () => {}; }

  const cleanups = els.map(el => {
    const off = observe(el, entry => {
      if (entry.isIntersecting) { el.classList.add('in'); off(); }
    }, { threshold, rootMargin });
    return off;
  });

  return () => cleanups.forEach(fn => fn());
}
