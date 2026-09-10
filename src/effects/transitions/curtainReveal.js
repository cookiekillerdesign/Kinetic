/**
 * Kinetic — curtainReveal
 * A full-viewport "curtain" intro: one or more panels slide away to reveal
 * the page on load — the classic Awwwards preloader-to-hero handoff.
 * Fires a callback when fully revealed so you can kick off the hero's own
 * entrance animation right after.
 *
 * Markup:
 *   <div class="kx-curtain" aria-hidden="true">
 *     <div class="kx-curtain-panel"></div>
 *     <div class="kx-curtain-panel"></div>
 *   </div>
 *
 * Usage:
 *   import { runCurtainReveal } from 'kinetic/effects/transitions/curtainReveal.js';
 *   runCurtainReveal('.kx-curtain', { delay: 300, onDone: () => startHero() });
 */
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function runCurtainReveal(selector = '.kx-curtain', { delay = 200, panelStagger = 90, duration = 900, onDone = () => {} } = {}) {
  const root = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!root) { onDone(); return; }
  const panels = [...root.querySelectorAll('.kx-curtain-panel')];
  if (prefersReducedMotion()) { root.remove(); onDone(); return; }

  setTimeout(() => {
    panels.forEach((p, i) => {
      setTimeout(() => p.classList.add('is-open'), i * panelStagger);
    });
    setTimeout(() => { root.remove(); onDone(); }, panelStagger * panels.length + duration);
  }, delay);
}
