/**
 * Kinetic — magneticText
 * Per-character magnetism: each letter in the element nudges away from (or
 * toward) the cursor individually, proportional to distance — reads as the
 * text "reacting" to the pointer rather than the whole block sliding.
 * Wraps each character in a span itself, so pass plain text elements.
 *
 * Usage:
 *   import { initMagneticText } from 'kinetic/effects/cursor/magneticText.js';
 *   const destroy = initMagneticText('.magnetic-text', { radius: 120, strength: 18 });
 */
import { onTick } from '../../core/raf.js';
import { onPointerMove } from '../../core/pointer.js';
import { damp } from '../../core/math.js';
import { prefersReducedMotion, isFinePointer } from '../../core/reducedMotion.js';

export function initMagneticText(selectorOrEls = '.kx-magnetic-text', { radius = 120, strength = 18 } = {}) {
  if (!isFinePointer() || prefersReducedMotion()) return () => {};
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];

  const chars = [];
  const splitEls = [];
  els.forEach(el => {
    if (el.dataset.kxSplit) return;
    const text = el.textContent;
    el.textContent = '';
    el.dataset.kxSplit = '1';
    splitEls.push({ el, text });
    [...text].forEach(c => {
      const span = document.createElement('span');
      span.textContent = c === ' ' ? ' ' : c;
      span.style.display = 'inline-block';
      span.style.willChange = 'transform';
      el.appendChild(span);
      chars.push({ span, x: 0, y: 0, tx: 0, ty: 0 });
    });
  });

  // Live pointer position, updated by the shared tracker and read each tick.
  let pointer = { x: -9999, y: -9999 };
  const offPtr = onPointerMove(s => { pointer = s; });

  const offTick = onTick((_, dt) => {
    for (const c of chars) {
      const box = c.span.getBoundingClientRect();
      const cx = box.left + box.width / 2, cy = box.top + box.height / 2;
      const dx = cx - pointer.x, dy = cy - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < radius) {
        const f = (1 - d / radius) * strength;
        c.tx = (dx / (d || 1)) * f;
        c.ty = (dy / (d || 1)) * f;
      } else {
        c.tx = 0; c.ty = 0;
      }
      c.x = damp(c.x, c.tx, 10, dt);
      c.y = damp(c.y, c.ty, 10, dt);
      c.span.style.transform = `translate(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px)`;
    }
  });

  return function destroy() {
    offPtr();
    offTick();
    // Restore the original text and clear the split flag so a subsequent
    // init() on the same elements (remount, React StrictMode double-invoke,
    // dependency change) re-splits instead of silently no-op'ing forever.
    splitEls.forEach(({ el, text }) => { el.textContent = text; delete el.dataset.kxSplit; });
  };
}
