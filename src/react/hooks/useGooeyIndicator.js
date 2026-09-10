import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initGooeyIndicator } from '../../effects/nav/gooeyIndicator.js';

/** Attach to the `.kx-gooey-nav` container. See gooeyIndicator.js for the required markup. */
export function useGooeyIndicator(opts = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initGooeyIndicator(el, opts), opts, []);
  return ref;
}
