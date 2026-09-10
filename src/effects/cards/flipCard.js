/**
 * Kinetic — flipCard
 * A 3D card flip (front/back faces) triggered by click, hover, or a
 * programmatic call — used for certification badges, before/after reveals,
 * bio cards. CSS handles the actual 3D transform (`transform-style:
 * preserve-3d`); this just toggles the state class and exposes an API.
 *
 * Markup:
 *   <div class="kx-flip"><div class="kx-flip-inner">
 *     <div class="kx-flip-front">...</div>
 *     <div class="kx-flip-back">...</div>
 *   </div></div>
 *
 * Usage:
 *   import { initFlipCard } from 'kinetic/effects/cards/flipCard.js';
 *   const destroy = initFlipCard('.kx-flip', { trigger: 'click' }); // or 'hover'
 */
export function initFlipCard(selectorOrEls = '.kx-flip', { trigger = 'click' } = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];

  const cleanups = els.map(el => {
    if (trigger === 'hover') {
      const on = () => el.classList.add('is-flipped');
      const off = () => el.classList.remove('is-flipped');
      el.addEventListener('mouseenter', on);
      el.addEventListener('mouseleave', off);
      return () => { el.removeEventListener('mouseenter', on); el.removeEventListener('mouseleave', off); };
    }
    const toggle = () => el.classList.toggle('is-flipped');
    el.addEventListener('click', toggle);
    el.setAttribute('role', el.getAttribute('role') || 'button');
    el.setAttribute('tabindex', el.getAttribute('tabindex') || '0');
    const onKey = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
    el.addEventListener('keydown', onKey);
    return () => { el.removeEventListener('click', toggle); el.removeEventListener('keydown', onKey); };
  });

  return () => cleanups.forEach(fn => fn());
}
