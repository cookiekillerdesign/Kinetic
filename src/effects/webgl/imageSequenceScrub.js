/**
 * Kinetic — imageSequenceScrub
 * Scrubs through a sequence of images frame-by-frame as the user scrolls
 * through a container — the "spin the product" / Apple product-page
 * technique. Preloads every frame up front, draws whichever one matches
 * current scroll progress to a canvas, and reads progress straight from the
 * scroll container's own position in the viewport (no scroll library).
 *
 * Markup — pin the container yourself (e.g. plain position:sticky, or
 * pinSection) and give its outer wrapper real scroll height:
 *   <div class="seq-outer" style="height:400vh;">
 *     <div style="position:sticky;top:0;height:100vh;">
 *       <canvas class="kx-sequence"></canvas>
 *     </div>
 *   </div>
 *
 * Usage:
 *   import { initImageSequenceScrub } from 'kinetic/effects/webgl/imageSequenceScrub.js';
 *   const destroy = initImageSequenceScrub('.kx-sequence', {
 *     frames: Array.from({ length: 90 }, (_, i) => `/seq/frame_${String(i).padStart(3, '0')}.jpg`),
 *     scrollRoot: document.querySelector('.seq-outer') // the tall ancestor whose scroll range drives progress
 *   });
 */
import { onTick } from '../../core/raf.js';
import { clamp } from '../../core/math.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initImageSequenceScrub(selectorOrEl, { frames = [], scrollRoot = null, fit = 'cover' } = {}) {
  const canvas = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
  if (!canvas || !frames.length) return () => {};
  const root = scrollRoot || canvas.parentElement.parentElement || canvas.parentElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const images = frames.map(src => { const img = new Image(); img.decoding = 'async'; img.src = src; return img; });
  let current = -1;

  function progress() {
    const rect = root.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-rect.top / total, 0, 1);
  }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, canvas.clientWidth * dpr);
    canvas.height = Math.max(1, canvas.clientHeight * dpr);
  }
  function draw(index) {
    const img = images[index];
    if (!img || !img.complete || !img.naturalWidth) return;
    const cw = canvas.width, ch = canvas.height;
    const ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
    let dw, dh;
    if ((fit === 'cover') === (ir > cr)) { dh = ch; dw = ch * ir; } else { dw = cw; dh = cw / ir; }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }
  function frameForProgress(p) {
    return clamp(Math.round(p * (frames.length - 1)), 0, frames.length - 1);
  }

  resize();
  images[0].addEventListener('load', () => { if (current === -1) { current = 0; draw(0); } }, { once: true });

  const reduce = prefersReducedMotion();
  const offTick = reduce ? null : onTick(() => {
    const idx = frameForProgress(progress());
    if (idx !== current) { current = idx; draw(current); }
  });
  if (reduce) { current = frameForProgress(0.5); images[current] ? draw(current) : (images[current].addEventListener('load', () => draw(current), { once: true })); }

  const onResize = () => { resize(); draw(current < 0 ? 0 : current); };
  window.addEventListener('resize', onResize);
  // Every other canvas effect in this library reacts to a ResizeObserver,
  // not just window resize — this was the odd one out, so a canvas whose
  // box changes from a layout shift (sidebar toggle, container query, tab
  // switch) rather than an actual window resize would stay stretched/blurry
  // until the next real window resize.
  const ro = new ResizeObserver(onResize);
  ro.observe(canvas);

  return function destroy() {
    if (offTick) offTick();
    window.removeEventListener('resize', onResize);
    ro.disconnect();
  };
}
