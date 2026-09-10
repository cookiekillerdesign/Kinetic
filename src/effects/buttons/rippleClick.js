/**
 * Kinetic — rippleClick
 * Material-style expanding ripple from the exact click point, implemented
 * as a short-lived absolutely-positioned span with a CSS scale+fade
 * animation — no per-click canvas or WebGL needed for this one.
 *
 * Usage:
 *   import { initRippleClick } from 'kinetic/effects/buttons/rippleClick.js';
 *   const destroy = initRippleClick('.kx-ripple-btn', { color: 'rgba(255,255,255,.5)' });
 * Required CSS: .kx-ripple-btn { position:relative; overflow:hidden; }
 */
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initRippleClick(selectorOrEls = '.kx-ripple-btn', { color = 'rgba(255,255,255,.45)', duration = 600 } = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const reduce = prefersReducedMotion();

  const handlers = els.map(el => {
    const onClick = e => {
      if (reduce) return;
      const box = el.getBoundingClientRect();
      const size = Math.max(box.width, box.height) * 2;
      const span = document.createElement('span');
      Object.assign(span.style, {
        position: 'absolute', left: `${e.clientX - box.left - size / 2}px`, top: `${e.clientY - box.top - size / 2}px`,
        width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: color,
        pointerEvents: 'none', transform: 'scale(0)', opacity: '1',
        transition: `transform ${duration}ms cubic-bezier(.25,1,.5,1), opacity ${duration}ms ease-out`
      });
      el.appendChild(span);
      requestAnimationFrame(() => { span.style.transform = 'scale(1)'; span.style.opacity = '0'; });
      setTimeout(() => span.remove(), duration + 50);
    };
    el.addEventListener('pointerdown', onClick);
    return () => el.removeEventListener('pointerdown', onClick);
  });

  return () => handlers.forEach(fn => fn());
}
