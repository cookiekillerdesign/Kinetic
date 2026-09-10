import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initScrollTimelineReveal } from '../../effects/scroll/scrollTimelineReveal.js';

/** Native scroll-driven reveal (falls back to the IO-based one). See scrollTimelineReveal.js. */
export function useScrollTimelineReveal(opts = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initScrollTimelineReveal([el], opts), opts, []);
  return ref;
}
