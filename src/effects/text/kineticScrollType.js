/**
 * Kinetic — kineticScrollType
 * Splits text into characters and scrubs their opacity/blur continuously
 * against scroll position as the paragraph passes through the viewport —
 * not a one-shot reveal (see splitText.js) but a live-scrubbed read, each
 * character sharpening in exactly as it's scrolled to, and blurring back
 * out if you scroll away.
 *
 * Usage:
 *   <p class="kx-scroll-type">Design is how it works.</p>
 *   import { initKineticScrollType } from 'kinetic/effects/text/kineticScrollType.js';
 *   const destroy = initKineticScrollType('.kx-scroll-type');
 */
import { onTick } from '../../core/raf.js';
import { clamp, map } from '../../core/math.js';
import { prefersReducedMotion } from '../../core/reducedMotion.js';

function splitChars(el) {
  const words = el.textContent.split(/(\s+)/);
  el.textContent = '';
  const spans = [];
  words.forEach(word => {
    if (/^\s+$/.test(word)) { el.appendChild(document.createTextNode(word)); return; }
    [...word].forEach(ch => {
      const span = document.createElement('span');
      span.textContent = ch;
      span.style.display = 'inline-block';
      span.style.willChange = 'opacity, filter';
      el.appendChild(span);
      spans.push(span);
    });
  });
  return spans;
}

export function initKineticScrollType(selectorOrEls, { startVh = 0.85, endVh = 0.35, minOpacity = 0.14, blurPx = 5 } = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  if (!els.length) return () => {};
  if (prefersReducedMotion()) { els.forEach(el => el.style.opacity = '1'); return () => {}; }

  const groups = els.map(el => ({ el, chars: splitChars(el) }));

  const off = onTick(() => {
    const vh = window.innerHeight;
    groups.forEach(({ el, chars }) => {
      const rect = el.getBoundingClientRect();
      // 0 while the paragraph's top is still below `startVh` of the viewport, 1 once it has scrolled up past `endVh`.
      const p = map(rect.top, vh * startVh, vh * endVh, 0, 1);
      const len = Math.max(1, chars.length);
      chars.forEach((span, i) => {
        const t = clamp(map(p, i / len, (i + 1) / len, 0, 1), 0, 1);
        span.style.opacity = String(minOpacity + t * (1 - minOpacity));
        span.style.filter = t >= 1 ? '' : `blur(${(1 - t) * blurPx}px)`;
      });
    });
  });

  return function destroy() {
    off();
    groups.forEach(({ chars }) => chars.forEach(s => { s.style.opacity = ''; s.style.filter = ''; }));
  };
}
