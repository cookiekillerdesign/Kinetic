/**
 * Kinetic — stackedScrollCards
 * A sticky "card stack": each card pins in place a little further down than
 * the one before it, so as you scroll each new card slides up and covers
 * the previous one, which gently scales down and dims underneath it. Pure
 * position:sticky under the hood — JS only sets the per-card offset once
 * and drives the cover-driven scale/opacity each frame.
 *
 * Markup:
 *   <div class="kx-stack">
 *     <div class="kx-stack-card">One</div>
 *     <div class="kx-stack-card">Two</div>
 *     <div class="kx-stack-card">Three</div>
 *   </div>
 *   .kx-stack-card { position: sticky; top: 0; } // top is set per-card by JS below
 *
 * Usage:
 *   import { initStackedScrollCards } from 'kinetic/effects/cards/stackedScrollCards.js';
 *   const destroy = initStackedScrollCards('.kx-stack', { offset: 24, scaleStep: 0.04 });
 */
import { onTick } from '../../core/raf.js';
import { clamp } from '../../core/math.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initStackedScrollCards(selectorOrEl, { cardSelector = '.kx-stack-card', offset = 24, scaleStep = 0.035, minScale = 0.85 } = {}) {
  const root = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
  if (!root) return () => {};
  const cards = [...root.querySelectorAll(cardSelector)];
  if (!cards.length) return () => {};

  cards.forEach((card, i) => {
    card.style.top = `${offset * i}px`;
    card.style.zIndex = String(i + 1);
    card.style.willChange = 'transform, opacity';
  });

  if (prefersReducedMotion()) return () => {
    cards.forEach(card => { card.style.top = card.style.zIndex = card.style.willChange = ''; });
  };

  const off = onTick(() => {
    for (let i = 0; i < cards.length - 1; i++) {
      const card = cards[i], next = cards[i + 1];
      const cardTop = card.getBoundingClientRect().top;
      const nextRect = next.getBoundingClientRect();
      const gap = nextRect.top - cardTop;
      const covered = clamp(1 - gap / Math.max(1, nextRect.height), 0, 1);
      const depth = cards.length - i;
      const scale = Math.max(minScale, 1 - covered * scaleStep * depth);
      card.style.transform = `scale(${scale})`;
      card.style.opacity = String(1 - covered * 0.35);
    }
  });

  return function destroy() {
    off();
    cards.forEach(card => {
      card.style.top = card.style.zIndex = card.style.transform = card.style.opacity = card.style.willChange = '';
    });
  };
}
