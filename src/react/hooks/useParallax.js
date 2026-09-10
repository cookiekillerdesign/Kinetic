import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initParallax } from '../../effects/scroll/parallax.js';

/** Attach the ref, and optionally set `speed` (defaults to 0.3, or read from data-kx-speed). */
export function useParallax({ speed = 0.3, axis = 'y' } = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => {
    el.dataset.kxSpeed = String(speed);
    return initParallax([el], { axis });
  }, { speed, axis }, [speed, axis]);
  return ref;
}
