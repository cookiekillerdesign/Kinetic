/**
 * Kinetic — smoothScroll
 * Two independent, composable pieces:
 *  1. smoothScrollTo / scrollToHash — eased one-shot scroll to a target
 *     (anchor links, "back to top"), using easeOutExpo instead of the
 *     native browser scroll curve.
 *  2. initVirtualSmoothScroll — an optional Lenis-style damped scroller.
 *     Native scrolling is left completely alone (nothing is intercepted or
 *     prevented, so the real scrollbar, keyboard scrolling, and assistive
 *     tech all keep working exactly as normal) — it just reads the
 *     resulting `window.scrollY` on every `scroll` event and lerps a
 *     *visual* value toward it, translating `wrapper` to fake that heavier,
 *     "damped" Awwwards scroll feel. Off by default; only use it if you
 *     want the full virtual-scroll experience (it changes how native
 *     scroll-anchoring and `<a href="#">` behave, so test carefully with
 *     the rest of the page).
 */
import { onTick } from '../../core/raf.js';
import { easeOutExpo } from '../../core/easing.js';
import { damp } from '../../core/math.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function smoothScrollTo(targetY, duration = 900) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  if (Math.abs(diff) < 1) return;
  if (prefersReducedMotion()) { window.scrollTo(0, targetY); return; }
  const startX = window.scrollX;
  const t0 = performance.now();
  function step(now) {
    const t = Math.min((now - t0) / duration, 1);
    // Preserve horizontal scroll — `window.scrollTo(0, y)` would otherwise
    // silently reset any existing horizontal scroll position to the left edge.
    window.scrollTo(startX, startY + diff * easeOutExpo(t));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export function scrollToHash(hash) {
  const el = document.querySelector(hash);
  if (!el) return;
  const targetY = el.getBoundingClientRect().top + window.scrollY;
  const distance = Math.abs(targetY - window.scrollY);
  const duration = Math.min(1500, Math.max(600, distance * 0.55));
  smoothScrollTo(targetY, duration);
}

/** Binds smoothScrollTo/scrollToHash to every same-page `<a href="#...">`. */
export function bindSmoothAnchors(root = document) {
  const onClick = e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const id = a.getAttribute('href');
    if (!document.querySelector(id)) return;
    e.preventDefault();
    scrollToHash(id);
    history.pushState(null, '', id);
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}

/**
 * Virtual smooth scroll: dampens native scroll into a lerped value applied
 * as a transform on `wrapper`. Sets `body.style.height` to the wrapper's
 * scrollHeight so the native scrollbar still reflects real page length.
 */
export function initVirtualSmoothScroll({ wrapper = document.querySelector('[data-kx-scroll-wrapper]'), lambda = 9 } = {}) {
  if (!wrapper || prefersReducedMotion()) return () => {};
  // Seed from the real scroll position, not 0 — otherwise a page that loads
  // already scrolled (hash anchor, browser scroll restoration) renders the
  // wrapper at the top and animates a jarring jump down on the first tick.
  let current = window.scrollY, target = window.scrollY;
  const spacer = document.createElement('div');

  function sync() {
    spacer.style.height = `${wrapper.scrollHeight}px`;
  }
  spacer.style.pointerEvents = 'none';
  document.body.appendChild(spacer);
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '100%';
  wrapper.style.willChange = 'transform';
  sync();

  const ro = new ResizeObserver(sync);
  ro.observe(wrapper);

  const onScroll = () => { target = window.scrollY; };
  addEventListener('scroll', onScroll, { passive: true });

  const offTick = onTick((_, dt) => {
    current = damp(current, target, lambda, dt);
    wrapper.style.transform = `translate3d(0, ${-current}px, 0)`;
  });

  return function destroy() {
    offTick();
    ro.disconnect();
    removeEventListener('scroll', onScroll);
    spacer.remove();
    wrapper.style.position = '';
    wrapper.style.transform = '';
  };
}
