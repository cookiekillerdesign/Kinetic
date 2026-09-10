/**
 * Kinetic — gooeyIndicator
 * A liquid, metaball-style active-nav indicator: a "lead" pill jumps
 * straight to the hovered/focused link while a "trail" pill chases it with
 * damped lag, both merged under a shared SVG goo filter — so it reads as
 * one blob stretching and catching up, not two shapes cross-fading.
 *
 * Markup:
 *   <nav class="kx-gooey-nav">
 *     <div class="kx-gooey-fx"><span class="kx-gooey-lead"></span><span class="kx-gooey-trail"></span></div>
 *     <a data-gooey class="is-active">Work</a><a data-gooey>About</a><a data-gooey>Contact</a>
 *   </nav>
 *   .kx-gooey-nav { position: relative; }
 *   .kx-gooey-fx { position: absolute; inset: 0; filter: url(#kx-goo); pointer-events: none; }
 *   .kx-gooey-lead, .kx-gooey-trail { position: absolute; top: 0; left: 0; border-radius: 999px; background: var(--kx-accent, #4f6bff); }
 *   .kx-gooey-nav a { position: relative; z-index: 1; }
 *
 * Usage:
 *   import { initGooeyIndicator } from 'kinetic/effects/nav/gooeyIndicator.js';
 *   const destroy = initGooeyIndicator('.kx-gooey-nav');
 */
import { onTick } from '../../core/raf.js';
import { damp } from '../../core/math.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

let gooInstalled = false;
function ensureGooFilter() {
  if (gooInstalled || document.getElementById('kx-goo')) { gooInstalled = true; return; }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML =
    '<filter id="kx-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/>' +
    '<feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"/></filter>';
  document.body.appendChild(svg);
  gooInstalled = true;
}

export function initGooeyIndicator(selectorOrEl, {
  linkSelector = '[data-gooey]',
  leadSelector = '.kx-gooey-lead',
  trailSelector = '.kx-gooey-trail',
  damping = 14
} = {}) {
  const root = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
  if (!root) return () => {};
  const links = [...root.querySelectorAll(linkSelector)];
  const lead = root.querySelector(leadSelector);
  const trail = root.querySelector(trailSelector);
  if (!links.length || !lead || !trail) return () => {};
  ensureGooFilter();

  let tx = 0, ty = 0, tw = 0, th = 0;
  let cx = 0, cy = 0, cw = 0, ch = 0;
  let ready = false;

  function boxFor(link) {
    const r = link.getBoundingClientRect(), pr = root.getBoundingClientRect();
    return { x: r.left - pr.left, y: r.top - pr.top, w: r.width, h: r.height };
  }
  function setTarget(link) {
    if (!link) return;
    const b = boxFor(link);
    tx = b.x; ty = b.y; tw = b.w; th = b.h;
    if (!ready) { cx = tx; cy = ty; cw = tw; ch = th; ready = true; }
  }
  function place(el, x, y, w, h) {
    el.style.transform = `translate(${x}px,${y}px)`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
  }

  const activeLink = () => root.querySelector(`${linkSelector}.is-active`) || links[0];
  setTarget(activeLink());
  place(lead, tx, ty, tw, th);
  place(trail, tx, ty, tw, th);

  const onOver = e => setTarget(e.currentTarget);
  const onLeave = () => setTarget(activeLink());
  links.forEach(link => {
    link.addEventListener('pointerenter', onOver);
    link.addEventListener('focus', onOver);
  });
  root.addEventListener('pointerleave', onLeave);

  const reduce = prefersReducedMotion();
  const off = reduce ? null : onTick((now, dt) => {
    place(lead, tx, ty, tw, th);
    const d = Math.max(4, damping);
    cx = damp(cx, tx, d, dt || 1 / 60);
    cy = damp(cy, ty, d, dt || 1 / 60);
    cw = damp(cw, tw, d, dt || 1 / 60);
    ch = damp(ch, th, d, dt || 1 / 60);
    place(trail, cx, cy, cw, ch);
  });
  if (reduce) { place(lead, tx, ty, tw, th); place(trail, tx, ty, tw, th); }

  return function destroy() {
    if (off) off();
    links.forEach(link => {
      link.removeEventListener('pointerenter', onOver);
      link.removeEventListener('focus', onOver);
    });
    root.removeEventListener('pointerleave', onLeave);
  };
}
