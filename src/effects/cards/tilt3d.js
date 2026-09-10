/**
 * Kinetic — tilt3d
 * Cursor-driven 3D tilt on hover cards — rotateX/Y proportional to pointer
 * offset from center, with a subtle translateZ "lift" and an optional glare
 * layer. Uses the shared pointer tracker + damping so the tilt settles
 * smoothly instead of snapping on mouseleave.
 *
 * Markup:
 *   <div class="kx-tilt"><div class="kx-tilt-inner">...<div class="kx-tilt-glare"></div></div></div>
 * (perspective is set on `.kx-tilt` in utilities.css)
 *
 * Usage:
 *   import { initTilt3d } from 'kinetic/effects/cards/tilt3d.js';
 *   const destroy = initTilt3d('.kx-tilt', { max: 12, glare: true });
 */
import { onTick } from '../../core/raf.js';
import { damp } from '../../core/math.js';
import { prefersReducedMotion, isFinePointer } from '../../core/reducedMotion.js';

export function initTilt3d(selectorOrEls = '.kx-tilt', { max = 12, scale = 1.02, glare = true, lambda = 14 } = {}) {
  if (!isFinePointer() || prefersReducedMotion()) return () => {};
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];

  const cleanups = els.map(el => {
    const inner = el.querySelector('.kx-tilt-inner') || el;
    const glareEl = glare ? el.querySelector('.kx-tilt-glare') : null;
    let rx = 0, ry = 0, trx = 0, try_ = 0, active = false, rect = null;

    const onEnter = () => { active = true; rect = el.getBoundingClientRect(); };
    const onMove = e => {
      if (!rect) rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      try_ = (px - 0.5) * max * 2;
      trx = -(py - 0.5) * max * 2;
      if (glareEl) glareEl.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,.25), transparent 60%)`;
    };
    const onLeave = () => { active = false; trx = 0; try_ = 0; };
    const onResize = () => { rect = null; };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onResize);

    const offTick = onTick((_, dt) => {
      rx = damp(rx, trx, lambda, dt);
      ry = damp(ry, try_, lambda, dt);
      const s = active ? scale : 1;
      inner.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${s})`;
    });

    return () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
      offTick();
    };
  });

  return () => cleanups.forEach(fn => fn());
}
