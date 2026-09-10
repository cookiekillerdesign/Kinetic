import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initCounters } from '../../effects/text/counter.js';

/** Attach the ref to a <span data-to="248" data-suffix="+">0</span>. */
export function useCounter(opts = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initCounters([el], opts), opts, []);
  return ref;
}
