/**
 * Kinetic — scrambleText
 * "Decoding" text effect: characters cycle through random glyphs before
 * settling on the real letter, left-to-right, like a terminal decrypt
 * animation. Great for nav links, stat labels, hero taglines on hover.
 *
 * Usage:
 *   import { initScrambleText, scramble } from 'kinetic/effects/text/scrambleText.js';
 *   const destroy = initScrambleText('.scramble-on-hover'); // wires hover
 *   // or trigger manually:
 *   scramble(el, 'NEW TEXT');
 */
import { prefersReducedMotion } from '../../core/reducedMotion.js';

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

export function scramble(el, finalText = el.textContent, { chars = DEFAULT_CHARS, speed = 30, revealDelay = 22 } = {}) {
  if (prefersReducedMotion()) { el.textContent = finalText; return () => {}; }
  const len = finalText.length;
  const t0 = performance.now();
  let raf;
  // Driven by elapsed wall-clock time (not rAF call count) so the reveal
  // takes the same real-world duration on a 60Hz and a 144Hz display alike —
  // `elapsed` below stands in for the old frame-count/speed ratio.
  function tick(now) {
    const elapsed = ((now - t0) / 1000) * speed;
    let out = '';
    for (let i = 0; i < len; i++) {
      const revealAt = i * (revealDelay / speed);
      if (elapsed >= revealAt + 0.4) out += finalText[i];
      else out += finalText[i] === ' ' ? ' ' : chars[(Math.random() * chars.length) | 0];
    }
    el.textContent = out;
    if (elapsed < (len * revealDelay) / speed + 1) raf = requestAnimationFrame(tick);
    else el.textContent = finalText;
  }
  tick(t0);
  return () => cancelAnimationFrame(raf);
}

/** Wires hover-to-scramble on a set of elements (reverts to original text on next hover-in). */
export function initScrambleText(selectorOrEls = '.kx-scramble', opts = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const handlers = els.map(el => {
    const original = el.textContent;
    let cancel = () => {};
    const onEnter = () => { cancel(); cancel = scramble(el, original, opts); };
    el.addEventListener('mouseenter', onEnter);
    return () => { el.removeEventListener('mouseenter', onEnter); cancel(); };
  });
  return () => handlers.forEach(fn => fn());
}
