/**
 * Kinetic — scrollTimelineReveal
 * A reveal driven by native CSS scroll-driven animations
 * (`animation-timeline: view()`) instead of a JS scroll/observer loop — the
 * animation is scrubbed live by scroll position, entirely on the
 * compositor, rather than played once when a threshold is crossed (compare
 * scrollReveal.js, which is the IntersectionObserver-based equivalent).
 * Progressive enhancement: falls back to scrollReveal's one-shot IO reveal
 * on browsers without `animation-timeline` support.
 *
 * Usage:
 *   <p class="kx-timeline-reveal">Design is how it works.</p>
 *   import { initScrollTimelineReveal } from 'kinetic/effects/scroll/scrollTimelineReveal.js';
 *   const destroy = initScrollTimelineReveal('.kx-timeline-reveal', { range: 'entry 0% cover 40%' });
 *
 * Ships with a matching `@keyframes kx-timeline-in` in css/keyframes.css —
 * bring your own keyframes via `animationName` for a different motion.
 */
import { observe } from '../../core/observer.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

/** true when the browser supports `animation-timeline: view()`. */
export function supportsScrollTimeline() {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timeline', 'view()');
}

export function initScrollTimelineReveal(selectorOrEls = '.kx-timeline-reveal', { range = 'entry 0% cover 35%', animationName = 'kx-timeline-in' } = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  if (!els.length) return () => {};

  if (prefersReducedMotion()) { els.forEach(el => el.classList.add('in')); return () => {}; }

  if (!supportsScrollTimeline()) {
    // Fall back to the classic one-shot IntersectionObserver reveal.
    const cleanups = els.map(el => {
      el.classList.add('kx-reveal');
      const off = observe(el, entry => { if (entry.isIntersecting) { el.classList.add('in'); off(); } }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      return off;
    });
    return () => cleanups.forEach(fn => fn());
  }

  els.forEach(el => {
    el.style.animationName = animationName;
    el.style.animationTimeline = 'view()';
    el.style.animationRange = range;
    el.style.animationFillMode = 'both';
    el.style.animationTimingFunction = 'linear';
  });

  return () => els.forEach(el => {
    el.style.animationName = '';
    el.style.animationTimeline = '';
    el.style.animationRange = '';
  });
}
