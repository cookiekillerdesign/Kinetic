import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initKineticScrollType } from '../../effects/text/kineticScrollType.js';

/** Attach to a <p>/<h*> — its text is split and scrubbed by scroll position. */
export function useKineticScrollType(opts = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initKineticScrollType([el], opts), opts, []);
  return ref;
}
