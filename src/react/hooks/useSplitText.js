import { useRef } from 'react';
import { useKineticEffect } from './useKineticEffect.js';
import { initSplitText } from '../../effects/text/splitText.js';

/**
 * Splits and reveals text. Pass `text` as a key at the call site
 * (e.g. `key={`${lang}-${text}`}`) if you want it to replay on content change.
 */
export function useSplitText(opts = {}) {
  const ref = useRef(null);
  useKineticEffect(ref, el => initSplitText([el], opts), opts, []);
  return ref;
}
