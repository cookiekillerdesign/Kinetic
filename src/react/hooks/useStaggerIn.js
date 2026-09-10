import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initStaggerIn } from '../../effects/grid/staggerIn.js';

export function useStaggerIn(opts = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initStaggerIn([el], opts), opts, []);
  return ref;
}
