/**
 * Kinetic — spotlightHover
 * A soft radial-gradient "flashlight" that follows the cursor inside a
 * container, revealing a lighter/tinted layer only around the pointer.
 * Pure CSS custom-properties driven — cheap, GPU-friendly, no canvas.
 *
 * Usage:
 *   import { initSpotlightHover } from 'kinetic/effects/cursor/spotlightHover.js';
 *   const destroy = initSpotlightHover('.spotlight-card', { radius: 260 });
 *
 * CSS (see utilities.css for the full version):
 *   .kx-spotlight { position:relative; overflow:hidden; }
 *   .kx-spotlight::before {
 *     content:''; position:absolute; inset:0; pointer-events:none;
 *     background:radial-gradient(var(--kx-spot-r,260px) circle at var(--kx-spot-x,50%) var(--kx-spot-y,50%),
 *                 rgba(255,255,255,.12), transparent 70%);
 *     opacity:var(--kx-spot-o,0); transition:opacity .3s;
 *   }
 *   .kx-spotlight:hover::before { --kx-spot-o:1; }
 */
export function initSpotlightHover(selectorOrEls = '.kx-spotlight', { radius = 260 } = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const cleanups = els.map(el => {
    el.style.setProperty('--kx-spot-r', `${radius}px`);
    const onMove = e => {
      const box = el.getBoundingClientRect();
      el.style.setProperty('--kx-spot-x', `${e.clientX - box.left}px`);
      el.style.setProperty('--kx-spot-y', `${e.clientY - box.top}px`);
    };
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  });
  return () => cleanups.forEach(fn => fn());
}
