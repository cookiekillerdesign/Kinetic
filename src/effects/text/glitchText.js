/**
 * Kinetic — glitchText
 * Short, punchy RGB-split glitch bursts on hover (or looping) using CSS
 * clip-path slices + a hue-shifted duplicate layer, no canvas needed. Pairs
 * with the .kx-glitch utility classes.
 *
 * Usage:
 *   import { initGlitchText } from 'kinetic/effects/text/glitchText.js';
 *   const destroy = initGlitchText('.glitch', { trigger: 'hover' }); // or 'loop'
 */
import { prefersReducedMotion } from '../../core/reducedMotion.js';

export function initGlitchText(selectorOrEls = '.kx-glitch', { trigger = 'hover', loopEvery = 4000, burstDuration = 420 } = {}) {
  if (prefersReducedMotion()) return () => {};
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];

  els.forEach(el => {
    if (!el.dataset.kxGlitchText) {
      el.dataset.kxGlitchText = el.textContent;
      el.setAttribute('data-text', el.textContent);
    }
  });

  const fire = el => {
    el.classList.add('is-glitching');
    setTimeout(() => el.classList.remove('is-glitching'), burstDuration);
  };

  const timers = [];
  if (trigger === 'loop') {
    els.forEach(el => {
      const id = setInterval(() => fire(el), loopEvery + Math.random() * 1000);
      timers.push(id);
    });
    return () => timers.forEach(clearInterval);
  }

  const handlers = els.map(el => {
    const onEnter = () => fire(el);
    el.addEventListener('mouseenter', onEnter);
    return () => el.removeEventListener('mouseenter', onEnter);
  });
  return () => handlers.forEach(fn => fn());
}
