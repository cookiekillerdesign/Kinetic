import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initRippleDistort } from '../../effects/webgl/rippleDistort.js';

/** Attach to the wrapper div containing .kx-ripple-source + .kx-ripple-canvas. */
export function useRippleDistort(opts = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initRippleDistort([el], opts), opts, []);
  return ref;
}
