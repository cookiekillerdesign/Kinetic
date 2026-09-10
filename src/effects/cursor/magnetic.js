/**
 * Kinetic — magnetic
 * Makes elements gently pull toward the cursor on hover, then spring back.
 * Measures the element's box once on enter (not per-mousemove) to avoid a
 * forced-reflow read-after-write loop — the untransformed box doesn't move
 * while being dragged, so re-measuring every frame buys nothing.
 *
 * Usage:
 *   import { initMagnetic } from 'kinetic/effects/cursor/magnetic.js';
 *   const destroy = initMagnetic('.magnetic', { pull: 0.3 });
 */
import { prefersReducedMotion, isFinePointer } from '../../core/reducedMotion.js';

export function initMagnetic(selectorOrEls = '.kx-magnetic', {
  pull = 0.3,
  pullY = pull,
  maxOffset = Infinity,
  releaseEase = 'cubic-bezier(.19,1,.22,1)',
  releaseDuration = 500
} = {}) {
  if (!isFinePointer() || prefersReducedMotion()) return () => {};
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const resetters = [];
  const cleanups = els.map(el => {
    let rect = null;
    const measure = () => { rect = el.getBoundingClientRect(); };
    const reset = () => { rect = null; };
    resetters.push(reset);
    const onMove = e => {
      if (!rect) measure();
      let dx = e.clientX - (rect.left + rect.width / 2);
      let dy = e.clientY - (rect.top + rect.height / 2);
      dx = Math.max(-maxOffset, Math.min(maxOffset, dx));
      dy = Math.max(-maxOffset, Math.min(maxOffset, dy));
      el.style.transform = `translate(${dx * pull}px,${dy * pullY}px)`;
    };
    const onLeave = () => {
      rect = null;
      el.style.transition = `transform ${releaseDuration}ms ${releaseEase}`;
      el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; }, releaseDuration);
    };
    el.addEventListener('mouseenter', measure);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', measure);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  });
  // One shared resize listener for the whole batch, not one per element —
  // matches the rest of the library's "collapse N listeners into 1"
  // approach (see core/raf.js, core/pointer.js, core/observer.js). A page
  // with a few dozen `.kx-magnetic` elements previously registered a few
  // dozen separate `window resize` listeners for no benefit.
  const onResize = () => resetters.forEach(reset => reset());
  window.addEventListener('resize', onResize);
  return () => {
    cleanups.forEach(fn => fn());
    window.removeEventListener('resize', onResize);
  };
}
