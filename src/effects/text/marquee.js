/**
 * Kinetic — marquee
 * An infinite horizontal ticker built by duplicating the content once and
 * animating both copies with CSS `translateX(-50%)` — no JS-per-frame cost
 * at rest; a pointer-driven speed multiplier is the only thing that needs
 * rAF, and only while hovered.
 *
 * Usage:
 *   <div class="kx-marquee"><div class="kx-marquee-track">Award-winning · Handmade · </div></div>
 *   import { initMarquee } from 'kinetic/effects/text/marquee.js';
 *   const destroy = initMarquee('.kx-marquee', { speed: 40, hoverSlow: true });
 */
import { onTick } from '../../core/raf.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initMarquee(selectorOrEls = '.kx-marquee', { speed = 40, hoverSlow = true, direction = -1 } = {}) {
  const roots = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const reduce = prefersReducedMotion();
  const cleanups = [];

  roots.forEach(root => {
    const track = root.querySelector('.kx-marquee-track') || root.firstElementChild;
    if (!track) return;
    if (!track.dataset.kxDup) {
      track.dataset.kxDup = '1';
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      root.appendChild(clone);
      root.style.display = 'flex';
      root.style.overflow = 'hidden';
      track.style.flex = '0 0 auto';
      track.style.whiteSpace = 'nowrap';
      clone.style.flex = '0 0 auto';
      clone.style.whiteSpace = 'nowrap';
    }
    if (reduce) return;

    let x = 0;
    let speedFactor = 1;
    const onEnter = () => { if (hoverSlow) speedFactor = 0.35; };
    const onLeave = () => { speedFactor = 1; };
    if (hoverSlow) { root.addEventListener('mouseenter', onEnter); root.addEventListener('mouseleave', onLeave); }

    const offTick = onTick((_, dt) => {
      const w = track.offsetWidth || 1;
      x += direction * speed * speedFactor * dt;
      if (Math.abs(x) >= w) x = x % w;
      root.style.transform = `translateX(${x}px)`;
    });

    cleanups.push(() => {
      offTick();
      if (hoverSlow) { root.removeEventListener('mouseenter', onEnter); root.removeEventListener('mouseleave', onLeave); }
    });
  });

  return () => cleanups.forEach(fn => fn());
}
