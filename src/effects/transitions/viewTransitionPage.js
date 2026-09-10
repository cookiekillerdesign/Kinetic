/**
 * Kinetic — viewTransitionPage
 * Wraps the native View Transitions API (`document.startViewTransition`) for
 * SPA route changes — the current, standards-track replacement for a
 * hand-rolled overlay-cover/reveal (see pageTransition.js, which is the
 * manual fallback this API makes mostly unnecessary). The browser captures
 * before/after screenshots of the whole document and cross-fades them
 * automatically; tag individual elements with the same view-transition-name
 * on both pages for a shared-element morph (an image growing from a list
 * into a detail view, a title sliding into its new size).
 *
 * Falls back to running the update instantly when the API or
 * prefers-reduced-motion isn't available, so it is always safe to call.
 *
 * Usage (works with any router — React Router, plain history API, ...):
 *   import { runViewTransition, tagViewTransition } from 'kinetic/effects/transitions/viewTransitionPage.js';
 *   link.addEventListener('click', e => {
 *     e.preventDefault();
 *     runViewTransition(() => navigate(link.href));
 *   });
 *
 *   // opt an element into a shared-element morph across the transition —
 *   // give it the SAME name on the page it's leaving and the page it enters:
 *   tagViewTransition(heroImage, 'hero-image');
 *
 * CSS (optional — customize the default cross-fade):
 *   ::view-transition-old(root), ::view-transition-new(root) { animation-duration: .45s; }
 *   ::view-transition-old(hero-image), ::view-transition-new(hero-image) { animation-duration: .6s; animation-timing-function: var(--kx-ease-io); }
 *
 * For full page (MPA/multi-document) navigations, cross-document view
 * transitions need no JS at all — just opt in with CSS on both documents:
 *   @view-transition { navigation: auto; }
 */
import { prefersReducedMotion } from '../../core/reducedMotion.js';

/** true when the browser supports document.startViewTransition. */
export function supportsViewTransitions() {
  return typeof document !== 'undefined' && typeof document.startViewTransition === 'function';
}

/**
 * Runs `update()` (typically a route/state change) inside a native view
 * transition. Returns a promise that resolves once the transition's
 * animations have finished (or immediately, in the fallback path).
 */
export function runViewTransition(update, { classNames } = {}) {
  if (prefersReducedMotion() || !supportsViewTransitions()) {
    return Promise.resolve(update());
  }
  const names = classNames ? [].concat(classNames) : [];
  if (names.length) document.documentElement.classList.add(...names);
  let transition;
  try {
    transition = document.startViewTransition(update);
  } catch {
    return Promise.resolve(update());
  }
  const done = transition.finished.catch(() => {});
  if (names.length) done.then(() => document.documentElement.classList.remove(...names));
  return done;
}

/** Tags `el` with a view-transition-name so it morphs across a transition
 *  instead of merely cross-fading. Returns a function that clears it. */
export function tagViewTransition(el, name) {
  if (!el) return () => {};
  const prev = el.style.viewTransitionName;
  el.style.viewTransitionName = name;
  return () => { el.style.viewTransitionName = prev || ''; };
}
