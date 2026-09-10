/**
 * Kinetic — magneticButton
 * A convenience preset over the generic `magnetic` cursor effect, tuned for
 * buttons/CTAs: a slightly stronger pull, a bouncier release, and an inner
 * label that lags a touch behind the outer shell for a two-layer depth cue.
 *
 * Markup:
 *   <button class="kx-magnetic-btn"><span class="kx-magnetic-btn-inner">Get in touch</span></button>
 *
 * Usage:
 *   import { initMagneticButton } from 'kinetic/effects/buttons/magneticButton.js';
 *   const destroy = initMagneticButton('.kx-magnetic-btn');
 */
import { initMagnetic } from '../cursor/magnetic.js';
import { cssEasing } from '../../core/easing.js';

export function initMagneticButton(selectorOrEls = '.kx-magnetic-btn', { pull = 0.4, innerPull = 0.6 } = {}) {
  const els = typeof selectorOrEls === 'string' ? [...document.querySelectorAll(selectorOrEls)] : [...selectorOrEls];
  const offOuter = initMagnetic(els, { pull, releaseEase: cssEasing.outBack, releaseDuration: 600 });
  const inners = els.map(el => el.querySelector('.kx-magnetic-btn-inner')).filter(Boolean);
  const offInner = inners.length ? initMagnetic(inners, { pull: innerPull, releaseEase: cssEasing.outBack, releaseDuration: 600 }) : () => {};
  return () => { offOuter(); offInner(); };
}
