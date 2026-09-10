import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initTilt3d } from '../../effects/cards/tilt3d.js';

export function useTilt3d(opts = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initTilt3d([el], opts), opts, []);
  return ref;
}
