/**
 * Kinetic — gridMorph
 * Animates a layout switch (e.g. grid → list view, or filtering a
 * collection) so items that persist across both states glide to their new
 * position instead of jump-cutting, using the FLIP technique from
 * morphTransition. Items that enter/exit fade separately.
 *
 * Usage:
 *   import { morphLayout } from 'kinetic/effects/grid/gridMorph.js';
 *   const play = morphLayout(gridEl, '.item'); // 1. snapshot before
 *   applyNewLayoutClasses(gridEl);              // 2. change classes/DOM order synchronously
 *   play();                                     // 3. animate every item from old box to new box
 */
import { flip } from '../transitions/morphTransition.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function morphLayout(root, itemSelector = ':scope > *', opts = {}) {
  if (prefersReducedMotion()) return () => {};
  const items = [...root.querySelectorAll(itemSelector)];
  const players = items.map(el => flip(el, opts));
  return () => players.forEach(play => play());
}
