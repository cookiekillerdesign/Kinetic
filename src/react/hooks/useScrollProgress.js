import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initScrollProgress } from '../../effects/scroll/scrollProgress.js';

/** Attach the ref to the bar element; pass `target` as a ref/element to track
 *  scroll progress through a specific container instead of the whole page. */
export function useScrollProgress({ target = null } = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initScrollProgress(el, { target }), { target }, []);
  return ref;
}
