import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initStackedScrollCards } from '../../effects/cards/stackedScrollCards.js';

/** Attach to the `.kx-stack` container; children matching `cardSelector` become the sticky stack. */
export function useStackedScrollCards(opts = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initStackedScrollCards(el, opts), opts, []);
  return ref;
}
