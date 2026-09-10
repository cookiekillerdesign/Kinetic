import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initMagneticCard } from '../../effects/cards/magneticCard.js';

export function useMagneticCard(opts = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initMagneticCard([el], opts), opts, []);
  return ref;
}
