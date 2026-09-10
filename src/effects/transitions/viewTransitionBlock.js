/**
 * Kinetic — viewTransitionBlock
 * The native View Transitions API applied to a local DOM update — filtering
 * a grid, switching a tab, reordering a list — instead of a full page nav.
 * Where `startViewTransition` isn't supported, falls back to this library's
 * own FLIP implementation (see morphTransition.js) so persisting elements
 * still glide to their new position rather than jump-cutting: every caller
 * gets a real morph either way, just via a different engine.
 *
 * Usage:
 *   <div class="grid" id="grid"><div class="item" data-vt="i1">...</div>...</div>
 *   import { transitionBlock } from 'kinetic/effects/transitions/viewTransitionBlock.js';
 *   filterBtn.addEventListener('click', () => {
 *     transitionBlock(grid, () => applyNewFilterClasses(grid), { itemSelector: '.item' });
 *   });
 *
 * For the native path, give persisting items a stable view-transition-name
 * (e.g. `element.style.viewTransitionName = 'item-' + id`) so the browser
 * morphs each one individually instead of cross-fading the whole container.
 */
import { prefersReducedMotion } from '../../core/reducedMotion.js';
import { flip } from './morphTransition.js';

export function transitionBlock(container, update, { itemSelector = null, duration = 450 } = {}) {
  if (prefersReducedMotion()) { update(); return Promise.resolve(); }

  if (typeof document.startViewTransition === 'function') {
    let transition;
    try { transition = document.startViewTransition(() => update()); }
    catch { update(); return Promise.resolve(); }
    return transition.finished.catch(() => {});
  }

  // Fallback: FLIP every matched item across the update.
  const items = itemSelector ? [...container.querySelectorAll(itemSelector)] : [];
  const plays = items.map(el => flip(el, { duration }));
  update();
  plays.forEach(play => play());
  return Promise.resolve();
}
