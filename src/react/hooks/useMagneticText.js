import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initMagneticText } from '../../effects/cursor/magneticText.js';

/** Per-character magnetic text. Attach the returned ref to the text element. */
export function useMagneticText(opts = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initMagneticText([el], opts), opts, [opts.radius, opts.strength]);
  return ref;
}
