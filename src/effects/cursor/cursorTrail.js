/**
 * Kinetic — cursorTrail
 * A short chain of dots that follow the cursor with staggered lag — each
 * link dampens toward the position of the one before it, so the whole
 * chain reads as a single elastic trail rather than N independent dots.
 *
 * Usage:
 *   import { initCursorTrail } from 'kinetic/effects/cursor/cursorTrail.js';
 *   const destroy = initCursorTrail({ count: 6, container: document.body });
 */
import { onTick } from '../../core/raf.js';
import { onPointerMove } from '../../core/pointer.js';
import { damp } from '../../core/math.js';
import { prefersReducedMotion, isFinePointer } from '../../core/reducedMotion.js';

export function initCursorTrail({
  count = 6,
  container = document.body,
  size = 8,
  minSize = 3,
  color = 'var(--kx-accent, #4f7cff)',
  lambda = 22
} = {}) {
  if (!isFinePointer() || prefersReducedMotion()) return () => {};

  const dots = Array.from({ length: count }, (_, i) => {
    const el = document.createElement('div');
    const s = Math.max(minSize, size - i * (size - minSize) / count);
    Object.assign(el.style, {
      position: 'fixed', top: 0, left: 0, width: `${s}px`, height: `${s}px`,
      borderRadius: '50%', background: color, pointerEvents: 'none', zIndex: 9998,
      opacity: String(1 - i / count * 0.7), willChange: 'transform', mixBlendMode: 'exclusion'
    });
    container.appendChild(el);
    return { el, x: innerWidth / 2, y: innerHeight / 2 };
  });

  let target = { x: innerWidth / 2, y: innerHeight / 2 };
  const offPtr = onPointerMove(s => { target = s; });
  const offTick = onTick((_, dt) => {
    let leadX = target.x, leadY = target.y;
    dots.forEach((d, i) => {
      d.x = damp(d.x, leadX, lambda / (1 + i * 0.4), dt);
      d.y = damp(d.y, leadY, lambda / (1 + i * 0.4), dt);
      d.el.style.transform = `translate(${d.x}px,${d.y}px) translate(-50%,-50%)`;
      leadX = d.x; leadY = d.y;
    });
  });

  return function destroy() {
    offPtr(); offTick();
    dots.forEach(d => d.el.remove());
  };
}
