/**
 * Kinetic — blobCursor
 * A gooey, metaball-style cursor: a short trail of circles chases the
 * pointer, each lagging a little more than the last, merged into one liquid
 * blob via an SVG goo filter (feGaussianBlur + feColorMatrix contrast
 * trick) — no canvas, no WebGL, just a handful of SVG circles.
 *
 * Usage:
 *   import { initBlobCursor } from 'kinetic/effects/cursor/blobCursor.js';
 *   const destroy = initBlobCursor({ count: 5, size: 22, color: '#4f6bff' });
 */
import { onTick } from '../../core/raf.js';
import { onPointerMove } from '../../core/pointer.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';
import { damp } from '../../core/math.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function initBlobCursor({ count = 5, size = 22, color = '#4f6bff', damping = 26, zIndex = 9998 } = {}) {
  if (prefersReducedMotion()) return () => {};

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  Object.assign(svg.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: String(zIndex)
  });

  const filterId = 'kx-blob-goo-' + Math.random().toString(36).slice(2, 8);
  svg.innerHTML =
    `<defs><filter id="${filterId}">` +
    `<feGaussianBlur in="SourceGraphic" stdDeviation="${size / 3}" result="b"/>` +
    `<feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"/>` +
    `</filter></defs><g filter="url(#${filterId})"></g>`;
  const group = svg.querySelector('g');

  const dots = Array.from({ length: Math.max(2, count) }, () => {
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('r', String(size / 2));
    c.setAttribute('fill', color);
    group.appendChild(c);
    return { el: c, x: innerWidth / 2, y: innerHeight / 2 };
  });
  document.body.appendChild(svg);

  let px = innerWidth / 2, py = innerHeight / 2;
  const offMove = onPointerMove(p => { px = p.x; py = p.y; });
  const offTick = onTick((now, dt) => {
    let tx = px, ty = py;
    dots.forEach((d, i) => {
      const lambda = damping - i * (damping / (dots.length + 2));
      d.x = damp(d.x, tx, Math.max(4, lambda), dt || 1 / 60);
      d.y = damp(d.y, ty, Math.max(4, lambda), dt || 1 / 60);
      d.el.setAttribute('cx', String(d.x));
      d.el.setAttribute('cy', String(d.y));
      tx = d.x; ty = d.y;
    });
  });

  return function destroy() {
    offMove();
    offTick();
    svg.remove();
  };
}
