/**
 * Kinetic — customCursor
 * A hardware-cursor replacement: a small ring that lerps toward the real
 * pointer, expands over links/buttons, and can show a contextual label
 * (data-cursor-label="View project"). Disabled entirely on touch/coarse
 * pointers so it never gets stuck mid-screen on a tablet.
 *
 * Usage:
 *   import { initCustomCursor } from 'kinetic/effects/cursor/customCursor.js';
 *   const destroy = initCustomCursor({ speed: 0.2 });
 *
 * Markup it expects (or pass your own via `els`):
 *   <div class="kx-cursor"><span class="kx-cursor-ring">...</span></div>
 *   <div class="kx-cursor-label"></div>
 * See src/css/utilities.css for the matching styles.
 */
import { onTick } from '../../core/raf.js';
import { isFinePointer, isTouchDevice, prefersReducedMotion } from '../../core/reducedMotion.js';

export function initCustomCursor({
  cursorEl = document.querySelector('.kx-cursor'),
  labelEl = document.querySelector('.kx-cursor-label'),
  speed = 0.2,
  interactiveSelector = 'a,button,[data-cursor-hover]',
  labelAttr = 'data-cursor-label'
} = {}) {
  if (!cursorEl || isTouchDevice() || !isFinePointer()) {
    cursorEl?.style.setProperty('display', 'none');
    return () => {};
  }

  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  const reduce = prefersReducedMotion();

  const onMove = e => { mx = e.clientX; my = e.clientY; };
  // `mouseover`/`mouseout` (needed here for event delegation on `document`,
  // since `mouseenter`/`mouseleave` don't bubble) fire on every element
  // boundary crossed — including between a link and its OWN children (e.g.
  // <a class="kx-magnetic-btn"><span class="kx-magnetic-btn-inner">...) —
  // not just on genuinely entering/leaving the interactive element. Without
  // the `relatedTarget` containment check below, moving the real mouse from
  // an `<a>` onto its own inner `<span>` toggled 'on-link' off and back on
  // in the same instant, flickering the cursor's hover state.
  const onOver = e => {
    const link = e.target.closest(interactiveSelector);
    if (link && !link.contains(e.relatedTarget)) cursorEl.classList.add('on-link');
    const withLabel = e.target.closest(`[${labelAttr}]`);
    if (withLabel && !withLabel.contains(e.relatedTarget) && labelEl) {
      labelEl.textContent = withLabel.getAttribute(labelAttr);
      labelEl.classList.add('show');
    }
  };
  const onOut = e => {
    const link = e.target.closest(interactiveSelector);
    if (link && !link.contains(e.relatedTarget)) cursorEl.classList.remove('on-link');
    const withLabel = e.target.closest(`[${labelAttr}]`);
    if (withLabel && !withLabel.contains(e.relatedTarget) && labelEl) labelEl.classList.remove('show');
  };
  const onTouch = () => { cursorEl.style.display = 'none'; if (labelEl) labelEl.style.display = 'none'; offTick(); };

  addEventListener('mousemove', onMove, { passive: true });
  addEventListener('touchstart', onTouch, { passive: true });
  document.addEventListener('mouseover', onOver);
  document.addEventListener('mouseout', onOut);

  const offTick = onTick(() => {
    const factor = reduce ? 1 : speed;
    cx += (mx - cx) * factor;
    cy += (my - cy) * factor;
    cursorEl.style.transform = `translate(${cx}px,${cy}px)`;
    if (labelEl) { labelEl.style.left = cx + 'px'; labelEl.style.top = cy + 'px'; }
  });

  return function destroy() {
    removeEventListener('mousemove', onMove);
    removeEventListener('touchstart', onTouch);
    document.removeEventListener('mouseover', onOver);
    document.removeEventListener('mouseout', onOut);
    offTick();
  };
}
