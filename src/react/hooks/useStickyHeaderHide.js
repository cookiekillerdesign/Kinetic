import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initStickyHeaderHide } from '../../effects/nav/stickyHeaderHide.js';

export function useStickyHeaderHide(opts = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initStickyHeaderHide(el, opts), opts, []);
  return ref;
}
