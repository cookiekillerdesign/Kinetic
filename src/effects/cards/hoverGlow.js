/**
 * Kinetic — hoverGlow
 * A soft colored glow that follows the cursor behind/around a card border —
 * distinct from spotlightHover (which lights the surface) in that this
 * animates a box-shadow / border-image position, reading as an emissive
 * edge rather than an internal highlight. Cheap CSS-var driven.
 *
 * Markup:
 *   <div class="kx-glow-card">...</div>
 * CSS:
 *   .kx-glow-card { position:relative; }
 *   .kx-glow-card::after { content:''; position:absolute; inset:-1px; border-radius:inherit;
 *     background:radial-gradient(180px circle at var(--kx-glow-x,50%) var(--kx-glow-y,50%),
 *       var(--kx-glow-color,rgba(79,124,255,.5)), transparent 70%);
 *     opacity:var(--kx-glow-o,0); transition:opacity .35s; pointer-events:none; z-index:-1; filter:blur(6px); }
 *   .kx-glow-card:hover::after { --kx-glow-o:1; }
 *
 * Usage:
 *   import { initHoverGlow } from 'kinetic/effects/cards/hoverGlow.js';
 *   const destroy = initHoverGlow('.kx-glow-card');
 */
export function initHoverGlow(selectorOrEls = '.kx-glow-card', { size = 180 } = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const cleanups = els.map(el => {
    const onMove = e => {
      const box = el.getBoundingClientRect();
      el.style.setProperty('--kx-glow-x', `${e.clientX - box.left}px`);
      el.style.setProperty('--kx-glow-y', `${e.clientY - box.top}px`);
    };
    el.style.setProperty('--kx-glow-size', `${size}px`);
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  });
  return () => cleanups.forEach(fn => fn());
}
