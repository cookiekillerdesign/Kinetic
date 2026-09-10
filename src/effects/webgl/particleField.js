/**
 * Kinetic — particleField
 * A lightweight interactive particle system on 2D canvas (no WebGL needed
 * at this particle count): particles drift, connect with faint lines to
 * nearby neighbours, and are pushed away from the cursor. Classic
 * "constellation network" hero background, tuned to stay cheap.
 *
 * Usage:
 *   <canvas class="kx-particles"></canvas>
 *   import { initParticleField } from 'kinetic/effects/webgl/particleField.js';
 *   const destroy = initParticleField('.kx-particles', { count: 60, linkDistance: 120 });
 */
import { onTick } from '../../core/raf.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initParticleField(selectorOrCanvas = '.kx-particles', {
  count = 60,
  linkDistance = 120,
  speed = 0.25,
  color = '79,124,255',
  repelRadius = 140
} = {}) {
  const canvas = typeof selectorOrCanvas === 'string' ? document.querySelector(selectorOrCanvas) : selectorOrCanvas;
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  const reduce = prefersReducedMotion();

  let w = 0, h = 0, dpr = 1, particles = [], sized = false;
  function resize() {
    // Re-read devicePixelRatio on every resize, not just once at init —
    // otherwise dragging the window to a display with a different DPR
    // leaves the canvas blurry/mis-scaled since it never re-syncs.
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Particles are seeded only the FIRST time we see a real, nonzero size.
    // canvas.offsetWidth/Height can legitimately be 0 on the very first
    // synchronous resize() call below (layout not settled yet — a flex/grid
    // container sized by its own content, or a canvas mounted before React
    // finishes its initial paint). Previously the particle array was built
    // once right after that first call using whatever w/h existed at that
    // instant: if it was 0, every particle spawned at (0,0) and — since
    // resize() updates w/h but never rebuilt `particles` — stayed
    // permanently clumped in the corner even after the canvas grew to its
    // real size on a later ResizeObserver trigger.
    if (!sized && w > 0 && h > 0) {
      sized = true;
      particles = Array.from({ length: reduce ? Math.round(count / 3) : count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed, vy: (Math.random() - 0.5) * speed
      }));
    }
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  let pointer = { x: -9999, y: -9999 };
  const onMove = e => {
    const box = canvas.getBoundingClientRect();
    pointer = { x: e.clientX - box.left, y: e.clientY - box.top };
  };
  const onLeave = () => { pointer = { x: -9999, y: -9999 }; };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  const offTick = onTick((_, dt) => {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      const dx = p.x - pointer.x, dy = p.y - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < repelRadius) {
        const f = (1 - d / repelRadius) * 1.4;
        p.vx += (dx / (d || 1)) * f * dt * 6;
        p.vy += (dy / (d || 1)) * f * dt * 6;
      }
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.98; p.vy *= 0.98;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      p.x = Math.max(0, Math.min(w, p.x)); p.y = Math.max(0, Math.min(h, p.y));
    }
    ctx.fillStyle = `rgba(${color},0.8)`;
    for (const p of particles) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill(); }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < linkDistance) {
          ctx.strokeStyle = `rgba(${color},${(1 - d / linkDistance) * 0.35})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
  });

  return function destroy() {
    offTick(); ro.disconnect();
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
  };
}
