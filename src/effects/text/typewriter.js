/**
 * Kinetic — typewriter
 * Types out one or more strings character by character, with configurable
 * pause-at-end and delete-and-retype cycling (classic rotating-tagline
 * effect) or a single one-shot type-in.
 *
 * Usage:
 *   import { initTypewriter } from 'kinetic/effects/text/typewriter.js';
 *   const destroy = initTypewriter('.rotating-role', {
 *     words: ['Product Designer', 'UX Engineer', 'Frontend Craftsman'],
 *     loop: true
 *   });
 */
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initTypewriter(selectorOrEls = '.kx-typewriter', {
  words = null,
  typeSpeed = 55,
  deleteSpeed = 32,
  pause = 1400,
  loop = true,
  cursor = true
} = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const reduce = prefersReducedMotion();
  const timers = [];

  els.forEach(el => {
    // `words` explicitly passed as an empty array is still truthy, so a
    // bare `words || [el.textContent]` would leave `list` empty and crash
    // the very first `tick()` on `word.slice(...)` of an undefined word.
    const list = words && words.length ? words : [el.textContent];
    if (cursor) el.classList.add('kx-typewriter-caret');
    if (reduce) { el.textContent = list[0]; return; }

    let wi = 0, ci = 0, deleting = false;
    el.textContent = '';

    function tick() {
      const word = list[wi];
      if (!deleting) {
        ci++;
        el.textContent = word.slice(0, ci);
        if (ci === word.length) {
          if (!loop && wi === list.length - 1) return;
          timers.push(setTimeout(() => { deleting = true; tick(); }, pause));
          return;
        }
        timers.push(setTimeout(tick, typeSpeed));
      } else {
        ci--;
        el.textContent = word.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % list.length;
          timers.push(setTimeout(tick, typeSpeed));
          return;
        }
        timers.push(setTimeout(tick, deleteSpeed));
      }
    }
    tick();
  });

  return () => timers.forEach(clearTimeout);
}
