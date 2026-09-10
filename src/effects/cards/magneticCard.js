/**
 * Kinetic — magneticCard
 * Combines magnetic pull (whole card nudges toward the cursor) with tilt3d
 * (surface rotates) for a single, richer "the card comes alive" hover —
 * the two effects share one pointer sample per frame instead of each
 * running its own listener, which is why this exists as its own module
 * rather than "just use both at once".
 *
 * Usage:
 *   import { initMagneticCard } from 'kinetic/effects/cards/magneticCard.js';
 *   const destroy = initMagneticCard('.kx-magnetic-card', { pull: 0.15, tilt: 8 });
 */
import { onTick } from '../../core/raf.js';
import { damp } from '../../core/math.js';
import { prefersReducedMotion, isFinePointer } from '../../core/reducedMotion.js';

export function initMagneticCard(selectorOrEls = '.kx-magnetic-card', { pull = 0.15, tilt = 8, lambda = 12 } = {}) {
  if (!isFinePointer() || prefersReducedMotion()) return () => {};
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];

  const cleanups = els.map(el => {
    let rect = null, tx = 0, ty = 0, trx = 0, try_ = 0, x = 0, y = 0, rx = 0, ry = 0;
    const onEnter = () => { rect = el.getBoundingClientRect(); };
    const onMove = e => {
      if (!rect) rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      tx = px * rect.width * pull;
      ty = py * rect.height * pull;
      try_ = px * tilt * 2;
      trx = -py * tilt * 2;
    };
    const onLeave = () => { rect = null; tx = 0; ty = 0; trx = 0; try_ = 0; };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    const offTick = onTick((_, dt) => {
      x = damp(x, tx, lambda, dt); y = damp(y, ty, lambda, dt);
      rx = damp(rx, trx, lambda, dt); ry = damp(ry, try_, lambda, dt);
      el.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    });

    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      offTick();
    };
  });

  return () => cleanups.forEach(fn => fn());
}
