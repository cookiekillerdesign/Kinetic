import { useEffect } from 'react';
import { initScrollReveal } from '../../effects/scroll/scrollReveal.js';

/** Observes every not-yet-revealed `.kx-reveal` in the document. Re-run
 *  (via `deps`) after route changes or content swaps that add new ones. */
export function useReveal(deps = []) {
  useEffect(() => {
    let destroy;
    try {
      destroy = initScrollReveal();
    } catch (err) {
      console.error('[kinetic] useReveal init failed:', err);
      return undefined;
    }
    return () => { try { destroy(); } catch (err) { console.error('[kinetic] useReveal cleanup failed:', err); } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
