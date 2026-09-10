/**
 * Kinetic — magneticNav
 * A nav bar where a "pill" background slides and resizes to sit under
 * whichever link is hovered (or active), using FLIP so it glides between
 * arbitrary positions rather than just fading. A thin, purpose-built
 * wrapper over the same technique as morphTransition.
 *
 * Markup:
 *   <nav class="kx-magnetic-nav">
 *     <span class="kx-nav-pill"></span>
 *     <a class="kx-nav-link is-active">Work</a>
 *     <a class="kx-nav-link">About</a>
 *     <a class="kx-nav-link">Contact</a>
 *   </nav>
 *
 * Usage:
 *   import { initMagneticNav } from 'kinetic/effects/nav/magneticNav.js';
 *   const destroy = initMagneticNav('.kx-magnetic-nav');
 */
import { prefersReducedMotion } from '../../core/reducedMotion.js';
import { cssEasing } from '../../core/easing.js';

export function initMagneticNav(selector = '.kx-magnetic-nav', { linkSelector = '.kx-nav-link', pillSelector = '.kx-nav-pill' } = {}) {
  const nav = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!nav) return () => {};
  const pill = nav.querySelector(pillSelector);
  const links = [...nav.querySelectorAll(linkSelector)];
  if (!pill || !links.length) return () => {};
  const reduce = prefersReducedMotion();

  function moveTo(el, animate = true) {
    const navBox = nav.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    pill.style.transition = animate && !reduce ? `transform 420ms ${cssEasing.outBack}, width 420ms ${cssEasing.out}` : 'none';
    pill.style.width = `${box.width}px`;
    pill.style.transform = `translateX(${box.left - navBox.left}px)`;
  }

  const active = nav.querySelector(`${linkSelector}.is-active`) || links[0];
  requestAnimationFrame(() => moveTo(active, false));

  const handlers = links.map(link => {
    const onEnter = () => moveTo(link);
    const onFocus = () => moveTo(link);
    link.addEventListener('mouseenter', onEnter);
    link.addEventListener('focus', onFocus);
    return () => { link.removeEventListener('mouseenter', onEnter); link.removeEventListener('focus', onFocus); };
  });
  const onLeave = () => moveTo(nav.querySelector(`${linkSelector}.is-active`) || links[0]);
  nav.addEventListener('mouseleave', onLeave);

  const ro = new ResizeObserver(() => moveTo(nav.querySelector(`${linkSelector}.is-active`) || links[0], false));
  ro.observe(nav);

  return () => { handlers.forEach(fn => fn()); nav.removeEventListener('mouseleave', onLeave); ro.disconnect(); };
}
