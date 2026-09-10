/**
 * Kinetic — skeletonShimmer
 * Content-placeholder blocks with a moving light-sweep gradient, shown
 * while real content loads and swapped out once it's ready. The shimmer
 * itself is a CSS animation (see utilities.css .kx-skeleton); this module
 * just handles the swap/toggle so real markup can already exist underneath.
 *
 * Markup:
 *   <div class="kx-skeleton-wrap">
 *     <div class="kx-skeleton" style="height:220px;border-radius:12px;"></div>
 *     <div class="kx-content" hidden>...</div>
 *   </div>
 *
 * Usage:
 *   import { resolveSkeleton } from 'kinetic/effects/loaders/skeletonShimmer.js';
 *   fetchData().then(() => resolveSkeleton('.kx-skeleton-wrap'));
 */
export function resolveSkeleton(selectorOrEls) {
  const wraps = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  wraps.forEach(wrap => {
    const skeleton = wrap.querySelector('.kx-skeleton');
    const content = wrap.querySelector('.kx-content');
    if (skeleton) { skeleton.classList.add('is-done'); setTimeout(() => skeleton.remove(), 350); }
    if (content) { content.hidden = false; requestAnimationFrame(() => content.classList.add('in')); }
  });
}
