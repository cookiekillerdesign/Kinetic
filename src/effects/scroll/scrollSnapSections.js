/**
 * Kinetic — scrollSnapSections
 * A thin enhancement layer over native CSS scroll-snap: adds keyboard
 * (arrow/PageUp/PageDown) navigation between snap sections and an optional
 * dot-nav that stays in sync via IntersectionObserver. The snapping itself
 * stays native CSS (`scroll-snap-type`) for smoothness — this only adds the
 * affordances native snap doesn't give you for free.
 *
 * Markup:
 *   <div class="kx-snap-container" style="scroll-snap-type:y mandatory; overflow-y:auto; height:100vh;">
 *     <section class="kx-snap-section" style="scroll-snap-align:start;">...</section>
 *     ...
 *   </div>
 *
 * Usage:
 *   import { initScrollSnapSections } from 'kinetic/effects/scroll/scrollSnapSections.js';
 *   const destroy = initScrollSnapSections('.kx-snap-container', { dotNav: '.kx-snap-dots' });
 */
import { observe } from '../../core/observer.js';

export function initScrollSnapSections(containerSelector = '.kx-snap-container', {
  sectionSelector = '.kx-snap-section',
  dotNav = null
} = {}) {
  const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
  if (!container) return () => {};
  const sections = [...container.querySelectorAll(sectionSelector)];

  const onKey = e => {
    if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(e.key)) return;
    const idx = sections.findIndex(s => {
      const r = s.getBoundingClientRect();
      return r.top >= -10 && r.top < innerHeight / 2;
    });
    const dir = e.key === 'ArrowDown' || e.key === 'PageDown' ? 1 : -1;
    const next = sections[Math.min(sections.length - 1, Math.max(0, idx + dir))];
    if (next) { e.preventDefault(); next.scrollIntoView({ behavior: 'smooth' }); }
  };
  container.setAttribute('tabindex', container.getAttribute('tabindex') || '0');
  container.addEventListener('keydown', onKey);

  const cleanups = [() => container.removeEventListener('keydown', onKey)];

  const dotsEl = dotNav ? document.querySelector(dotNav) : null;
  if (dotsEl) {
    dotsEl.innerHTML = '';
    const dots = sections.map((s, i) => {
      const dot = document.createElement('button');
      dot.className = 'kx-snap-dot';
      dot.setAttribute('aria-label', `Section ${i + 1}`);
      const onDotClick = () => s.scrollIntoView({ behavior: 'smooth' });
      dot.addEventListener('click', onDotClick);
      dotsEl.appendChild(dot);
      cleanups.push(() => dot.removeEventListener('click', onDotClick));
      return dot;
    });
    // This module owns the dots it created above — on destroy, remove them
    // from the DOM too, or they'd stay clickable/scroll-triggering forever
    // even after the effect is supposedly torn down.
    cleanups.push(() => { dots.forEach(dot => dot.remove()); });
    sections.forEach((s, i) => {
      const off = observe(s, entry => {
        const isActive = entry.isIntersecting && entry.intersectionRatio > 0.5;
        dots[i].classList.toggle('active', isActive);
        // Screen readers get no signal from a bare CSS class — `aria-current`
        // is the standard way to convey "this is the current item" in a set
        // of navigation controls (the same pattern used for current-page nav
        // links), so this was silently accessible-by-sight-only before.
        if (isActive) dots[i].setAttribute('aria-current', 'true');
        else dots[i].removeAttribute('aria-current');
      }, { threshold: 0.5, root: container });
      cleanups.push(off);
    });
  }

  return () => cleanups.forEach(fn => fn());
}
